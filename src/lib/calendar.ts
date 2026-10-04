import { and, gte, lte, ne } from "drizzle-orm";
import { db, schema } from "./db";
import type { Booking } from "./schema";
import { addDays, parseISO, todayISO } from "./format";

/** Výsledný stav dne, jak ho vidí veřejnost. */
export type DayState = "free" | "pending" | "busy" | "past" | "off";

export type DayInfo = {
  date: string;
  state: DayState;
  manual: { status: string; note: string } | null;
  bookings: Booking[];
};

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
 * 2. potvrzená / odškolená rezervace → busy
 * 3. ruční „obsazeno" → busy
 * 4. nepotvrzená rezervace nebo ruční „zablokováno" → pending
 * 5. ruční „volno" → free
 * 6. výchozí: pracovní den volný, víkend nedostupný (lze změnit v nastavení)
 */
export function resolveState(
  date: string,
  manual: { status: string } | undefined,
  dayBookings: Booking[],
  opts: { today: string; weekendsOpen: boolean },
): DayState {
  if (date < opts.today) return "past";
  if (dayBookings.some((b) => b.status === "confirmed" || b.status === "done")) return "busy";
  if (manual?.status === "busy") return "busy";
  if (dayBookings.some((b) => b.status === "pending") || manual?.status === "pending") return "pending";
  if (manual?.status === "free") return "free";
  if (isWeekend(date) && !opts.weekendsOpen) return "off";
  return "free";
}

export async function getCalendarRange(from: string, to: string, weekendsOpen: boolean): Promise<DayInfo[]> {
  const [manualRows, bookingRows] = await Promise.all([
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
  ]);
  const manual = new Map(manualRows.map((r) => [r.date, r]));
  const today = todayISO();
  const out: DayInfo[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const dayBookings = bookingRows.filter((b) => b.dateFrom <= d && b.dateTo >= d);
    const m = manual.get(d);
    out.push({
      date: d,
      state: resolveState(d, m, dayBookings, { today, weekendsOpen }),
      manual: m ? { status: m.status, note: m.note } : null,
      bookings: dayBookings,
    });
  }
  return out;
}

/** Zkontroluje, že jsou všechny dny v rozsahu volné (pro veřejnou rezervaci). */
export async function rangeIsFree(from: string, to: string, weekendsOpen: boolean): Promise<boolean> {
  const days = await getCalendarRange(from, to, weekendsOpen);
  return days.every((d) => d.state === "free");
}
