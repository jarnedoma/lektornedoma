"use client";

import { useMemo, useState } from "react";
import { submitBooking } from "@/app/(web)/actions";
import { MONTHS, WEEKDAYS_SHORT, addDays, dateRange, parseISO, plural, weekday } from "@/lib/format";
import { IconChevronLeft, IconChevronRight, IconPin, IconX } from "../icons";
import { Consent, Field, FormAlert, FormSuccess, Honeypot, SubmitButton, useFormAction } from "./fields";

export const MAX_BOOKING_DAYS = 20;

type DayState = "free" | "pending" | "busy" | "past" | "off";
type PublicDay = { state: DayState; city: string };
type Opt = { id: number; title: string; group: string };

const STATE_STYLE: Record<DayState, string> = {
  free: "bg-excel-50 text-excel-800 ring-excel-200 hover:bg-excel-100 hover:ring-excel-400 cursor-pointer",
  pending: "bg-amber-50 text-amber-800 ring-amber-200 cursor-not-allowed",
  busy: "bg-rose-50 text-rose-700 ring-rose-200 cursor-not-allowed",
  past: "bg-transparent text-slate-300 ring-transparent cursor-not-allowed",
  off: "bg-slate-50 text-slate-400 ring-slate-100 cursor-not-allowed",
};

const STATE_LABEL: Record<DayState, string> = {
  free: "volno",
  pending: "zablokováno",
  busy: "obsazeno",
  past: "",
  off: "nedostupné",
};

/** Seskupí seřazená data do souvislých bloků (pro přehledné zobrazení). */
function toRuns(dates: string[]): { from: string; to: string }[] {
  const runs: { from: string; to: string }[] = [];
  for (const d of dates) {
    const last = runs.at(-1);
    if (last && addDays(last.to, 1) === d) last.to = d;
    else runs.push({ from: d, to: d });
  }
  return runs;
}

function shortDate(date: string) {
  const d = parseISO(date);
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}.`;
}

export function BookingCalendar({
  months,
  initialMonth,
  days,
  travelNote,
  courses,
  maxDays,
}: {
  months: { year: number; month: number }[];
  initialMonth: number;
  /** Stav a město lektora podle data (celý rok + pár dní okolo) */
  days: Record<string, PublicDay>;
  travelNote: string;
  courses: Opt[];
  maxDays: number;
}) {
  const [monthIdx, setMonthIdx] = useState(initialMonth);
  const [selected, setSelected] = useState<string[]>([]);
  const [sameCourse, setSameCourse] = useState(true);
  const [courseAll, setCourseAll] = useState("");
  const [perDay, setPerDay] = useState<Record<string, string>>({});
  const [online, setOnline] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const { state, onSubmit, pending } = useFormAction(submitBooking);

  const { year, month } = months[monthIdx];
  const groups = useMemo(() => [...new Set(courses.map((c) => c.group))], [courses]);
  const runs = useMemo(() => toRuns(selected), [selected]);

  const grid = useMemo(() => {
    const first = `${year}-${String(month).padStart(2, "0")}-01`;
    const startDow = (parseISO(first).getUTCDay() + 6) % 7;
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells: (string | null)[] = Array.from({ length: startDow }, () => null);
    for (let i = 0; i < lastDay; i++) cells.push(addDays(first, i));
    return cells;
  }, [year, month]);

  const toggle = (date: string) => {
    setLimitHit(false);
    setSelected((cur) => {
      if (cur.includes(date)) return cur.filter((d) => d !== date);
      if (cur.length >= maxDays) {
        setLimitHit(true);
        return cur;
      }
      return [...cur, date].sort();
    });
  };

  /** Kde lektor školí nejbližší dny před/po bloku (přes víkend až 3 dny). */
  const nearCity = (start: string, step: number) => {
    for (let i = 1, d = addDays(start, step); i <= 3; i++, d = addDays(d, step)) {
      if (selected.includes(d)) return null;
      const c = days[d]?.city;
      if (c && c !== "online") return { date: d, city: c };
    }
    return null;
  };

  const multi = selected.length > 1;
  const perDayMode = multi && !sameCourse;
  const selection = JSON.stringify(selected.map((date) => ({ date, courseId: (perDayMode ? perDay[date] : courseAll) || null })));

  if (state?.ok) {
    return (
      <FormSuccess title="Termíny jsou zablokované" message={state.message}>
        <a href="/kalendar" className="btn-ghost">Zpět do kalendáře</a>
      </FormSuccess>
    );
  }
  const e = state?.errors ?? {};

  const courseSelect = (value: string, onChange: (v: string) => void, id?: string) => (
    <select id={id} className="input" value={value} onChange={(ev) => onChange(ev.target.value)}>
      <option value="">— jiné téma / upřesním níže —</option>
      {groups.map((g) => (
        <optgroup key={g} label={g}>
          {courses
            .filter((c) => c.group === g)
            .map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {MONTHS[month - 1]} <span className="text-slate-400">{year}</span>
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={monthIdx === 0}
                onClick={() => setMonthIdx((i) => i - 1)}
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50 disabled:text-slate-300 disabled:ring-slate-100"
                aria-label="Předchozí měsíc"
              >
                <IconChevronLeft />
              </button>
              <button
                type="button"
                disabled={monthIdx === months.length - 1}
                onClick={() => setMonthIdx((i) => i + 1)}
                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50 disabled:text-slate-300 disabled:ring-slate-100"
                aria-label="Další měsíc"
              >
                <IconChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500">
            {WEEKDAYS_SHORT.map((w) => (
              <div key={w} className="pb-2">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((date, i) => {
              if (!date) return <div key={`e${i}`} className="aspect-square" />;
              const d = days[date] ?? { state: "past" as DayState, city: "" };
              const isSel = selected.includes(date);
              return (
                <button
                  key={date}
                  type="button"
                  disabled={d.state !== "free"}
                  onClick={() => toggle(date)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset transition ${
                    isSel ? "bg-ink-950 text-white ring-ink-950" : STATE_STYLE[d.state]
                  }`}
                  aria-pressed={isSel}
                  aria-label={`${date} ${isSel ? "vybráno" : STATE_LABEL[d.state]}${d.city ? ` – ${d.city}` : ""}`}
                >
                  {Number(date.slice(8))}
                  <span className={`mt-0.5 hidden text-[10px] font-medium sm:block ${isSel ? "text-white/70" : "opacity-70"}`}>
                    {isSel ? "vybráno" : STATE_LABEL[d.state]}
                  </span>
                  {d.city && !isSel && (
                    <span className="mt-0.5 flex max-w-full items-center gap-0.5 truncate px-1 text-[9px] leading-tight font-semibold sm:text-[10px]" title={d.city}>
                      <IconPin width={10} height={10} className="hidden shrink-0 sm:block" />
                      <span className="truncate">{d.city}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-slate-600">
            Vyberte <b>jeden nebo více volných dnů</b>, klidně i v různých měsících. Dalším kliknutím den z výběru odeberete.
          </p>
          {limitHit && (
            <p className="mt-2 text-sm font-medium text-amber-700">Najednou lze vybrat nejvýše {maxDays} dní. Pro víc mi prosím napište poptávku.</p>
          )}

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            <Legend className="bg-excel-100 ring-excel-300" label="Volný den" />
            <Legend className="bg-amber-100 ring-amber-300" label="Zablokováno – čeká na potvrzení" />
            <Legend className="bg-rose-100 ring-rose-300" label="Obsazeno" />
            <Legend className="bg-slate-100 ring-slate-200" label="Nedostupné" />
            <span className="inline-flex items-center gap-1.5"><IconPin width={13} height={13} /> město, kde ten den školím</span>
          </div>
          {travelNote && <p className="mt-4 rounded-xl bg-m365-50 p-3.5 text-xs leading-relaxed text-m365-800 ring-1 ring-m365-100">{travelNote}</p>}
        </div>
      </div>

      <div>
        {selected.length === 0 ? (
          <div className="card flex h-full min-h-72 flex-col justify-center gap-3 p-8 text-center">
            <p className="font-display text-xl font-bold text-ink-950">1. Vyberte jeden nebo více volných dnů</p>
            <p className="text-slate-600">2. Ke dnům zvolte kurz a místo konání</p>
            <p className="text-slate-600">3. Termíny pro vás zablokuji a ozvu se s potvrzením</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
            <Honeypot />
            <input type="hidden" name="selection" value={selection} />

            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Vybrané termíny</p>
                  <p className="mt-1 font-display text-xl font-bold text-ink-950">{plural(selected.length, "den", "dny", "dní")}</p>
                </div>
                <button type="button" onClick={() => setSelected([])} className="text-xs font-semibold text-slate-500 hover:text-rose-600">
                  Zrušit výběr
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {runs.map((r) => {
                  const before = nearCity(r.from, -1);
                  const after = nearCity(r.to, 1);
                  return (
                    <li key={r.from} className="border-t border-slate-200 pt-2 text-sm">
                      <p className="font-semibold text-ink-950">
                        {dateRange(r.from, r.to)}{" "}
                        <span className="font-normal text-slate-500">
                          ({weekday(r.from)}
                          {r.from !== r.to ? ` – ${weekday(r.to)}` : ""})
                        </span>
                      </p>
                      {(before || after) && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
                          <IconPin width={12} height={12} className="text-m365-600" />
                          {before && (
                            <span>
                              předtím ({shortDate(before.date)}) školím: <b className="text-ink-950">{before.city}</b>
                            </span>
                          )}
                          {after && (
                            <span>
                              potom ({shortDate(after.date)}) školím: <b className="text-ink-950">{after.city}</b>
                            </span>
                          )}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              {runs.some((r) => nearCity(r.from, -1) || nearCity(r.to, 1)) && (
                <p className="mt-2 text-xs text-slate-500">Zohledněte prosím cestování – při delším přejezdu se připočítává cestovné.</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="courseAll">Kurz</label>
              {multi && (
                <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 has-[:checked]:bg-m365-50 has-[:checked]:ring-m365-500">
                    <input type="radio" name="courseMode" checked={sameCourse} onChange={() => setSameCourse(true)} /> Stejný pro všechny dny
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 has-[:checked]:bg-m365-50 has-[:checked]:ring-m365-500">
                    <input
                      type="radio"
                      name="courseMode"
                      checked={!sameCourse}
                      onChange={() => {
                        setSameCourse(false);
                        setPerDay((p) => Object.fromEntries(selected.map((d) => [d, p[d] ?? courseAll])));
                      }}
                    />
                    Různé kurzy po dnech
                  </label>
                </div>
              )}
              {perDayMode ? (
                <ul className="space-y-2">
                  {selected.map((d) => (
                    <li key={d} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2">
                      <span className="text-sm leading-tight">
                        <b className="text-ink-950">{shortDate(d)}</b>
                        <span className="block text-xs text-slate-500">{weekday(d)}</span>
                      </span>
                      {courseSelect(perDay[d] ?? "", (v) => setPerDay((p) => ({ ...p, [d]: v })))}
                      <button
                        type="button"
                        onClick={() => toggle(d)}
                        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                        aria-label={`Odebrat ${d}`}
                      >
                        <IconX width={16} height={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                courseSelect(courseAll, setCourseAll, "courseAll")
              )}
              {e.courseId && <p className="mt-1 text-xs font-medium text-rose-600">{e.courseId}</p>}
            </div>
            <Field label="Upřesnění / jiné téma" name="courseTitle" className="sm:col-span-2" error={e.courseTitle}>
              <textarea
                id="courseTitle"
                name="courseTitle"
                rows={2}
                className="input"
                placeholder={multi ? "např. první 3 dny základy pro nováčky, další dny Power Query pro controlling…" : "pokud nevybíráte kurz z nabídky"}
              />
            </Field>

            <Field label="Počet účastníků" name="participants" type="number" min={1} inputMode="numeric" error={e.participants} />
            <label className="flex items-end gap-2 pb-2.5 text-sm text-slate-600">
              <input type="checkbox" name="isOnline" checked={online} onChange={(ev) => setOnline(ev.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Školení
              proběhne online
            </label>
            {!online && (
              <>
                <Field label="Město konání" name="city" required placeholder="např. Ostrava" error={e.city} hint="Zobrazí se v kalendáři (bez vašeho jména)." />
                <Field label="Adresa / firma" name="location" placeholder="ulice, budova…" error={e.location} />
              </>
            )}

            <Field label="Kontaktní osoba" name="contactName" required autoComplete="name" error={e.contactName} />
            <Field label="Firma" name="company" autoComplete="organization" />
            <Field label="E-mail" name="email" type="email" required autoComplete="email" error={e.email} />
            <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
            <Field label="Poznámka" name="message" className="sm:col-span-2">
              <textarea id="message" name="message" rows={3} className="input" placeholder="Úroveň účastníků, čas začátku, technické vybavení…" />
            </Field>
            <div className="sm:col-span-2">
              <Consent error={e.consent} />
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <FormAlert state={state} />
              <SubmitButton pending={pending} className="btn-primary w-full">
                Zablokovat {selected.length === 1 ? "termín" : plural(selected.length, "termín", "termíny", "termínů")}
              </SubmitButton>
              <p className="text-center text-xs text-slate-500">Rezervace je nezávazná, dokud ji nepotvrdím.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3.5 w-3.5 rounded ring-1 ring-inset ${className}`} />
      {label}
    </span>
  );
}
