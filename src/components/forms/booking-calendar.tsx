"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { submitBooking } from "@/app/(web)/actions";
import { MONTHS, WEEKDAYS_SHORT, addDays, dateRange, parseISO, weekday } from "@/lib/format";
import { IconChevronLeft, IconChevronRight, IconPin } from "../icons";
import { Consent, Field, FormAlert, FormSuccess, Honeypot, SubmitButton, useFormAction } from "./fields";

type PublicDay = { date: string; state: "free" | "pending" | "busy" | "past" | "off"; inMonth: boolean; city: string };
type Opt = { id: number; title: string; group: string };

const STATE_STYLE: Record<PublicDay["state"], string> = {
  free: "bg-excel-50 text-excel-800 ring-excel-200 hover:bg-excel-100 hover:ring-excel-400 cursor-pointer",
  pending: "bg-amber-50 text-amber-800 ring-amber-200 cursor-not-allowed",
  busy: "bg-rose-50 text-rose-700 ring-rose-200 cursor-not-allowed",
  past: "bg-transparent text-slate-300 ring-transparent cursor-not-allowed",
  off: "bg-slate-50 text-slate-400 ring-slate-100 cursor-not-allowed",
};

const STATE_LABEL: Record<PublicDay["state"], string> = {
  free: "volno",
  pending: "zablokováno",
  busy: "obsazeno",
  past: "",
  off: "nedostupné",
};

export function BookingCalendar({
  year,
  month,
  days,
  cities,
  travelNote,
  courses,
  prevHref,
  nextHref,
}: {
  year: number;
  month: number;
  days: PublicDay[];
  /** Město lektora podle data (i pár dní mimo zobrazený měsíc) */
  cities: Record<string, string>;
  travelNote: string;
  courses: Opt[];
  prevHref: string | null;
  nextHref: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [length, setLength] = useState(1);
  const [online, setOnline] = useState(false);
  const { state, onSubmit, pending } = useFormAction(submitBooking);
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  // Kolik po sobě jdoucích dnů od vybraného je volných (v rámci načteného měsíce)
  const maxLength = useMemo(() => {
    if (!selected) return 1;
    let n = 0;
    for (let d = selected; byDate.get(d)?.state === "free" && n < 5; d = addDays(d, 1)) n++;
    return Math.max(1, n);
  }, [selected, byDate]);

  const lastSelected = selected ? addDays(selected, Math.min(length, maxLength) - 1) : null;
  // Kde je lektor nejbližší dny před a po vybraném termínu (přes víkend až 3 dny)
  const nearby = useMemo(() => {
    if (!selected || !lastSelected) return null;
    const find = (start: string, step: number) => {
      for (let i = 1, d = addDays(start, step); i <= 3; i++, d = addDays(d, step)) {
        if (cities[d]) return { date: d, city: cities[d] };
      }
      return null;
    };
    return { before: find(selected, -1), after: find(lastSelected, 1) };
  }, [selected, lastSelected, cities]);

  const inRange = (d: string) => selected && d >= selected && d <= addDays(selected, Math.min(length, maxLength) - 1);
  const groups = [...new Set(courses.map((c) => c.group))];

  if (state?.ok) {
    return (
      <FormSuccess title="Termín je zablokovaný" message={state.message}>
        <Link href="/kalendar" className="btn-ghost">Zpět do kalendáře</Link>
      </FormSuccess>
    );
  }
  const e = state?.errors ?? {};

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div className="card p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {MONTHS[month - 1]} <span className="text-slate-400">{year}</span>
          </h2>
          <div className="flex gap-2">
            {prevHref ? (
              <Link href={prevHref} scroll={false} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Předchozí měsíc">
                <IconChevronLeft />
              </Link>
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full text-slate-300 ring-1 ring-slate-100"><IconChevronLeft /></span>
            )}
            {nextHref && (
              <Link href={nextHref} scroll={false} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-slate-200 hover:bg-slate-50" aria-label="Další měsíc">
                <IconChevronRight />
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500">
          {WEEKDAYS_SHORT.map((w) => (
            <div key={w} className="pb-2">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const day = Number(d.date.slice(8));
            if (!d.inMonth) return <div key={d.date} className="aspect-square" />;
            const isSel = inRange(d.date);
            return (
              <button
                key={d.date}
                type="button"
                disabled={d.state !== "free"}
                onClick={() => {
                  setSelected(d.date);
                  setLength(1);
                }}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset transition ${
                  isSel ? "bg-ink-950 text-white ring-ink-950" : STATE_STYLE[d.state]
                }`}
                aria-pressed={!!isSel}
                aria-label={`${d.date} ${STATE_LABEL[d.state]}${d.city ? ` – ${d.city}` : ""}`}
              >
                {day}
                <span className={`mt-0.5 hidden text-[10px] font-medium sm:block ${isSel ? "text-white/70" : "opacity-70"}`}>
                  {isSel ? "vybráno" : STATE_LABEL[d.state]}
                </span>
                {d.city && !isSel && (
                  <span className="mt-0.5 flex max-w-full items-center gap-0.5 truncate px-1 text-[9px] font-semibold leading-tight sm:text-[10px]" title={d.city}>
                    <IconPin width={10} height={10} className="hidden shrink-0 sm:block" />
                    <span className="truncate">{d.city}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
          <Legend className="bg-excel-100 ring-excel-300" label="Volný den" />
          <Legend className="bg-amber-100 ring-amber-300" label="Zablokováno – čeká na potvrzení" />
          <Legend className="bg-rose-100 ring-rose-300" label="Obsazeno" />
          <Legend className="bg-slate-100 ring-slate-200" label="Nedostupné" />
          <span className="inline-flex items-center gap-1.5"><IconPin width={13} height={13} /> město, kde ten den školím</span>
        </div>
        {travelNote && <p className="mt-4 rounded-xl bg-m365-50 p-3.5 text-xs leading-relaxed text-m365-800 ring-1 ring-m365-100">{travelNote}</p>}
      </div>

      <div>
        {!selected ? (
          <div className="card flex h-full flex-col justify-center gap-3 p-8 text-center">
            <p className="font-display text-xl font-bold text-ink-950">1. Vyberte volný den v kalendáři</p>
            <p className="text-slate-600">2. Zvolte kurz a místo konání</p>
            <p className="text-slate-600">3. Termín pro vás zablokuji a ozvu se s potvrzením</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
            <Honeypot />
            <input type="hidden" name="dateFrom" value={selected} />
            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vybraný termín</p>
              <p className="mt-1 font-display text-xl font-bold text-ink-950">
                {dateRange(selected, addDays(selected, Math.min(length, maxLength) - 1))}
              </p>
              <p className="text-sm text-slate-500">{weekday(selected)}</p>
              {nearby && (nearby.before || nearby.after) && (
                <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm text-slate-600">
                  {nearby.before && (
                    <p className="flex items-center gap-1.5">
                      <IconPin width={14} height={14} className="shrink-0 text-m365-600" />
                      <span>Předtím ({weekday(nearby.before.date)} {dateShortNoYear(nearby.before.date)}) školím: <b className="text-ink-950">{nearby.before.city}</b></span>
                    </p>
                  )}
                  {nearby.after && (
                    <p className="flex items-center gap-1.5">
                      <IconPin width={14} height={14} className="shrink-0 text-m365-600" />
                      <span>Potom ({weekday(nearby.after.date)} {dateShortNoYear(nearby.after.date)}) školím: <b className="text-ink-950">{nearby.after.city}</b></span>
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Zohledněte prosím cestování – při delším přejezdu se připočítává cestovné.</p>
                </div>
              )}
            </div>
            <Field label="Počet dní" name="days">
              <select
                id="days"
                name="days"
                className="input"
                value={Math.min(length, maxLength)}
                onChange={(ev) => setLength(Number(ev.target.value))}
              >
                {Array.from({ length: maxLength }, (_, i) => (
                  <option key={i} value={i + 1}>{i + 1} {i === 0 ? "den" : i < 4 ? "dny" : "dní"}</option>
                ))}
              </select>
            </Field>
            <Field label="Počet účastníků" name="participants" type="number" min={1} inputMode="numeric" error={e.participants} />

            <Field label="Kurz" name="courseId" error={e.courseId} className="sm:col-span-2">
              <select id="courseId" name="courseId" className="input" defaultValue="">
                <option value="">— jiné téma (napište níže) —</option>
                {groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {courses.filter((c) => c.group === g).map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Jiné téma / upřesnění" name="courseTitle" placeholder="pokud nevybíráte kurz z nabídky" className="sm:col-span-2" />

            <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
              <input type="checkbox" name="isOnline" checked={online} onChange={(ev) => setOnline(ev.target.checked)} className="h-4 w-4 rounded border-slate-300" /> Školení proběhne online
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
              <SubmitButton pending={pending} className="btn-primary w-full">Zablokovat termín</SubmitButton>
              <p className="text-center text-xs text-slate-500">Rezervace je nezávazná, dokud ji nepotvrdím.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function dateShortNoYear(date: string) {
  const d = parseISO(date);
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}.`;
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3.5 w-3.5 rounded ring-1 ring-inset ${className}`} />
      {label}
    </span>
  );
}
