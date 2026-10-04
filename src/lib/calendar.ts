import { and, eq, gte, inArray, lte, ne, or, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import type { Booking } from "./schema";
import { addDays, parseISO, todayISO } from "./format";

/** Výsledný stav dne, jak ho vidí veřejnost. */
export type DayState = "free" | "pending" | "busy" | "past" | "off";

export type DayInfo = {
  date: string;
  state: DayState;
  /** Město, kde lektor ten den je (z rezervace nebo ručního záznamu) */
  city: string;
  manual: { status: string; note: string; city: string } | null;
  bookings: Booking[];
  /** Vypsané veřejné/partnerské termíny v tento den – lektor školí, den je obsazený */
  terms: DayTerm[];
};

export type DayTerm = { id: number; courseTitle: string; city: string; isPartner: boolean };

/** Město z místa konání termínu: „Praha – Karlín“ → „Praha“. */
export function cityFromLocation(location: string, isOnline: boolean): string {
  if (isOnline) return "online";
  return location.split(/\s[–-]\s|,/)[0].trim();
}

/** Město dne: potvrzená rezervace > termín kurzu > nepotvrzená rezervace > ruční záznam. */
export function resolveCity(manual: { city: string } | undefined, dayBookings: Booking[], dayTerms: DayTerm[] = []): string {
  const confirmed = dayBookings.find((b) => (b.status === "confirmed" || b.status === "done") && b.city);
  const term = dayTerms.find((t) => t.city);
  const pending = dayBookings.find((b) => b.status === "pending" && b.city);
  return confirmed?.city || term?.city || pending?.city || manual?.city || "";
}

export function monthBounds(year: number, month: number) {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { first, last, lastDay };
}

/** Mřížka kalendáře (týdny od pondělí), doplněná o dny sousedních měsíců. */
export function monthGrid(year: number, month: number): string[] {
  const { first, last } = monthBounds(year, month);
  const startDow = (parseISO(first).getUTCDay() + 6) % 7; // 0 = pondělí
  const endDow = (parseISO(last).getUTCDay() + 6) % 7;
  const start = addDays(first, -startDow);
  const end = addDays(last, 6 - endDow);
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

export function isWeekend(date: string): boolean {
  const dow = parseISO(date).getUTCDay();
  return dow === 0 || dow === 6;
}

/**
 * Pravidla (od nejvyšší priority):
 * 1. minulost → past
 * 2. potvrzená / odškolená rezervace nebo vypsaný termín kurzu → busy
 * 3. ruční „obsazeno" → busy
 * 4. nepotvrzená rezervace nebo ruční „zablokováno" → pending
 * 5. ruční „volno" → free (ruční záznam „auto" nese jen město/poznámku a dostupnost nemění)
 * 6. výchozí: pracovní den volný, víkend nedostupný (lze změnit v nastavení)
 */
export function resolveState(
  date: string,
  manual: { status: string } | undefined,
  dayBookings: Booking[],
  opts: { today: string; weekendsOpen: boolean },
  hasTerm = false,
): DayState {
  if (date < opts.today) return "past";
  if (dayBookings.some((b) => b.status === "confirmed" || b.status === "done")) return "busy";
  if (hasTerm) return "busy";
  if (manual?.status === "busy") return "busy";
  if (dayBookings.some((b) => b.status === "pending") || manual?.status === "pending") return "pending";
  if (manual?.status === "free") return "free";
  if (isWeekend(date) && !opts.weekendsOpen) return "off";
  return "free";
}

/**
 * @param bookableFrom první den, který lze rezervovat (dřívější dny jsou „past“).
 *   Veřejný kalendář používá zítřek (rezervace nejpozději den předem), admin dnešek.
 */
export async function getCalendarRange(from: string, to: string, weekendsOpen: boolean, bookableFrom = todayISO()): Promise<DayInfo[]> {
  const [manualRows, bookingRows, termRows] = await Promise.all([
    db
      .select()
      .from(schema.calendarDays)
      .where(and(gte(schema.calendarDays.date, from), lte(schema.calendarDays.date, to))),
    db
      .select()
      .from(schema.bookings)
      .where(
        and(
          lte(schema.bookings.dateFrom, to),
          gte(schema.bookings.dateTo, from),
          ne(schema.bookings.status, "cancelled"),
        ),
      ),
    db
      .select({ term: schema.terms, courseTitle: schema.courses.title })
      .from(schema.terms)
      .innerJoin(schema.courses, eq(schema.terms.courseId, schema.courses.id))
      .where(
        and(
          inArray(schema.terms.status, ["open", "full"]),
          lte(schema.terms.startDate, to),
          or(and(isNull(schema.terms.endDate), gte(schema.terms.startDate, from)), gte(schema.terms.endDate, from)),
        ),
      ),
  ]);
  const manual = new Map(manualRows.map((r) => [r.date, r]));
  const out: DayInfo[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const dayBookings = bookingRows.filter((b) => b.dateFrom <= d && b.dateTo >= d);
    const m = manual.get(d);
    const dayTerms: DayTerm[] = termRows
      .filter(({ term }) => term.startDate <= d && (term.endDate ?? term.startDate) >= d)
      .map(({ term, courseTitle }) => ({ id: term.id, courseTitle, city: cityFromLocation(term.location, term.isOnline), isPartner: term.isPartner }));
    out.push({
      date: d,
      state: resolveState(d, m, dayBookings, { today: bookableFrom, weekendsOpen }, dayTerms.length > 0),
      city: resolveCity(m, dayBookings, dayTerms),
      manual: m ? { status: m.status, note: m.note, city: m.city } : null,
      bookings: dayBookings,
      terms: dayTerms,
    });
  }
  return out;
}

/** Zkontroluje, že jsou všechny dny v rozsahu volné (pro veřejnou rezervaci). */
export async function rangeIsFree(from: string, to: string, weekendsOpen: boolean): Promise<boolean> {
  const days = await getCalendarRange(from, to, weekendsOpen, firstBookableDay());
  return days.every((d) => d.state === "free");
}

/** Rezervovat z webu lze nejdříve na zítřek. */
export function firstBookableDay(): string {
  return addDays(todayISO(), 1);
}
