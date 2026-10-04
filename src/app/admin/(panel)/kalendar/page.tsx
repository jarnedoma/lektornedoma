import Link from "next/link";
import { and, asc, gte, lte, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCalendarRange, monthBounds, monthGrid, type DayState } from "@/lib/calendar";
import { getSettings } from "@/lib/settings";
import { AdminHeader, Check, F, Panel, StatusBadge } from "@/components/admin/ui";
import { SaveButton } from "@/components/admin/client-bits";
import { BOOKING_STATUSES } from "@/lib/constants";
import { MONTHS, WEEKDAYS_SHORT, dateLong, dateRange, price, todayISO, weekday } from "@/lib/format";
import { setBookingStatus, setDayStatus } from "../../actions";

export const metadata = { title: "Kalendář lektora" };

const CELL: Record<DayState, string> = {
  free: "bg-white",
  pending: "bg-amber-50",
  busy: "bg-rose-50",
  past: "bg-slate-50 text-slate-400",
  off: "bg-slate-50",
};
const STATE_TEXT: Record<DayState, string> = {
  free: "Volno",
  pending: "Zablokováno (nepotvrzeno)",
  busy: "Obsazeno",
  past: "Minulost",
  off: "Nedostupné (víkend)",
};
const MANUAL_LABEL: Record<string, string> = { free: "Ručně: volno", busy: "Ručně: obsazeno", pending: "Ručně: zablokováno", auto: "" };

export default async function AdminCalendar({ searchParams }: { searchParams: Promise<{ mesic?: string; den?: string }> }) {
  const sp = await searchParams;
  const today = todayISO();
  const ym = sp.mesic && /^\d{4}-\d{2}$/.test(sp.mesic) ? sp.mesic : today.slice(0, 7);
  const y = Number(ym.slice(0, 4));
  const m = Number(ym.slice(5, 7));
  const settings = await getSettings();
  const grid = monthGrid(y, m);
  const days = await getCalendarRange(grid[0], grid[grid.length - 1], settings.bookingWeekends === "1");
  const { first, last } = monthBounds(y, m);
  const selected = sp.den && /^\d{4}-\d{2}-\d{2}$/.test(sp.den) ? days.find((d) => d.date === sp.den) ?? null : null;

  const monthBookings = await db
    .select()
    .from(schema.bookings)
    .where(and(lte(schema.bookings.dateFrom, last), gte(schema.bookings.dateTo, first), ne(schema.bookings.status, "cancelled")))
    .orderBy(asc(schema.bookings.dateFrom));
  const confirmed = monthBookings.filter((b) => b.status === "confirmed" || b.status === "done");
  const fees = confirmed.reduce((s, b) => s + (b.fee ?? 0), 0);

  const shift = (n: number) => new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
  const dayHref = (d: string) => `/admin/kalendar?mesic=${ym}&den=${d}`;
  const back = selected ? dayHref(selected.date) : `/admin/kalendar?mesic=${ym}`;

  return (
    <>
      <AdminHeader
        title="Kalendář lektora"
        subtitle="Klikněte na den pro změnu stavu, poznámku nebo novou rezervaci."
        actions={
          <>
            <Link href="/admin/rezervace" className="btn-ghost btn-sm">Seznam rezervací</Link>
            <Link href={`/admin/rezervace/nova${selected ? `?od=${selected.date}` : ""}`} className="btn-primary btn-sm">+ Nová rezervace</Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-display text-xl font-bold">
              {MONTHS[m - 1]} {y}
            </h2>
            <div className="flex items-center gap-2">
              <Link href={`/admin/kalendar?mesic=${shift(-1)}`} className="btn-ghost btn-sm">←</Link>
              <Link href="/admin/kalendar" className="btn-ghost btn-sm">Dnes</Link>
              <Link href={`/admin/kalendar?mesic=${shift(1)}`} className="btn-ghost btn-sm">→</Link>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 text-center text-xs font-semibold text-slate-500">
            {WEEKDAYS_SHORT.map((w) => (
              <div key={w} className="py-2">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const inMonth = d.date >= first && d.date <= last;
              const isSel = selected?.date === d.date;
              return (
                <Link
                  key={d.date}
                  href={dayHref(d.date)}
                  scroll={false}
                  className={`relative min-h-24 border-b border-r border-slate-100 p-1.5 text-left text-xs transition hover:bg-m365-50/60 sm:min-h-28 ${CELL[d.state]} ${inMonth ? "" : "opacity-40"} ${isSel ? "ring-2 ring-inset ring-m365-600" : ""}`}
                >
                  <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-[13px] font-semibold ${d.date === today ? "bg-ink-950 text-white" : ""}`}>
                    {Number(d.date.slice(8))}
                  </span>
                  {d.state === "off" && !d.bookings.length && <span className="ml-1 text-[10px] text-slate-400">víkend</span>}
                  {d.city && (
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-m365-700" title={d.city}>
                      📍 {d.city}
                    </span>
                  )}
                  {d.manual && (d.manual.status !== "auto" || d.manual.note) && (
                    <span className="mt-0.5 block truncate rounded bg-slate-900/5 px-1 py-0.5 text-[10px] text-slate-600" title={d.manual.note}>
                      {{ busy: "■ ", free: "□ ", pending: "◪ " }[d.manual.status] ?? ""}
                      {d.manual.note || MANUAL_LABEL[d.manual.status]}
                    </span>
                  )}
                  {d.terms.map((t) => (
                    <span key={`t${t.id}`} className="mt-0.5 block truncate rounded bg-m365-600 px-1 py-0.5 text-[10px] font-medium text-white" title={t.courseTitle}>
                      {t.isPartner ? "◆ " : ""}{t.courseTitle}
                    </span>
                  ))}
                  {d.bookings.map((b) => (
                    <span
                      key={b.id}
                      className={`mt-0.5 block truncate rounded px-1 py-0.5 text-[10px] font-medium ${b.status === "pending" ? "bg-amber-200/70 text-amber-900" : "bg-excel-600 text-white"}`}
                      title={`${b.company || b.contactName} – ${b.courseTitle}`}
                    >
                      {b.company || b.contactName}
                    </span>
                  ))}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 px-5 py-3 text-xs text-slate-500">
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-excel-600 align-middle" /> potvrzená rezervace</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-amber-200 align-middle" /> nepotvrzená (zablokovaná)</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-m365-600 align-middle" /> termín kurzu (◆ partnerský)</span>
            <span><span className="mr-1 inline-block h-3 w-3 rounded bg-rose-100 ring-1 ring-rose-200 align-middle" /> obsazeno</span>
            <span>■ ručně obsazeno · □ ručně volno · ◪ ručně zablokováno</span>
          </div>
        </div>

        <div className="space-y-6">
          {selected ? (
            <Panel title={`${weekday(selected.date)} ${dateLong(selected.date)}`}>
              <p className="text-sm">
                Stav na webu: <b>{STATE_TEXT[selected.state]}</b>
              </p>
              <p className="mb-4 text-sm">
                Město na webu: <b>{selected.city || "—"}</b>
              </p>
              {selected.terms.length > 0 && (
                <ul className="mb-3 space-y-2">
                  {selected.terms.map((t) => (
                    <li key={t.id} className="rounded-xl bg-m365-50 p-3 text-sm ring-1 ring-m365-100">
                      <Link href={`/admin/terminy/${t.id}`} className="font-semibold text-ink-950 hover:text-m365-700">
                        {t.isPartner ? "Partnerský termín" : "Veřejný termín"}: {t.courseTitle}
                      </Link>
                      <p className="text-slate-500">{t.city}</p>
                    </li>
                  ))}
                </ul>
              )}
              {selected.bookings.length > 0 && (
                <ul className="mb-5 space-y-2">
                  {selected.bookings.map((b) => (
                    <li key={b.id} className="rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200/70">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/rezervace/${b.id}`} className="font-semibold text-ink-950 hover:text-m365-700">
                          {b.company || b.contactName}
                        </Link>
                        <StatusBadge map={BOOKING_STATUSES} value={b.status} />
                      </div>
                      <p className="mt-1 text-slate-600">{b.courseTitle}</p>
                      <p className="text-slate-500">{[b.city, b.location].filter(Boolean).join(", ")}{b.fee ? ` · ${price(b.fee)}` : ""}</p>
                      {b.status === "pending" && (
                        <form action={setBookingStatus} className="mt-2 flex gap-2">
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="back" value={back} />
                          <button name="status" value="confirmed" className="btn btn-sm bg-excel-600 text-white hover:bg-excel-700">Potvrdit</button>
                          <button name="status" value="cancelled" className="btn-ghost btn-sm">Zamítnout</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <form action={setDayStatus} className="space-y-3 border-t border-slate-100 pt-4">
                <input type="hidden" name="from" value={selected.date} />
                <input type="hidden" name="back" value={back} />
                <p className="text-sm font-semibold text-ink-950">Ruční označení dne</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["auto", "Automaticky"],
                    ["free", "Volno"],
                    ["busy", "Obsazeno"],
                    ["pending", "Zablokováno"],
                  ].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ring-slate-200 has-[:checked]:bg-m365-50 has-[:checked]:ring-m365-500">
                      <input type="radio" name="status" value={v} defaultChecked={(selected.manual?.status ?? "auto") === v} />
                      {l}
                    </label>
                  ))}
                </div>
                <input name="city" defaultValue={selected.manual?.city ?? ""} placeholder="Město (veřejné), např. Ostrava" className="input" />
                <p className="-mt-1 text-xs text-slate-500">Město z rezervace má přednost. Ruční město se hodí např. pro školení u partnera nebo „Automaticky + Ostrava“ (jen informace, den zůstane volný).</p>
                <input name="note" defaultValue={selected.manual?.note ?? ""} placeholder="Poznámka (jen pro vás), např. dovolená" className="input" />
                <SaveButton className="btn-primary btn-sm w-full">Uložit den</SaveButton>
              </form>
              <Link href={`/admin/rezervace/nova?od=${selected.date}`} className="btn-ghost btn-sm mt-3 w-full">+ Rezervace na tento den</Link>
            </Panel>
          ) : (
            <Panel title="Vyberte den">
              <p className="text-sm text-slate-500">Kliknutím na den v kalendáři zobrazíte detail, rezervace a můžete den ručně označit.</p>
            </Panel>
          )}

          <Panel title="Hromadné označení">
            <form action={setDayStatus} className="space-y-3">
              <input type="hidden" name="back" value={back} />
              <div className="grid grid-cols-2 gap-2">
                <F label="Od"><input type="date" name="from" required className="input" defaultValue={selected?.date} /></F>
                <F label="Do"><input type="date" name="to" required className="input" /></F>
              </div>
              <select name="status" className="input" defaultValue="busy">
                <option value="busy">Obsazeno (např. dovolená)</option>
                <option value="free">Volno (i víkendy)</option>
                <option value="pending">Zablokováno</option>
                <option value="auto">Automaticky (jen město/poznámka, nebo zrušit označení)</option>
              </select>
              <input name="city" placeholder="Město (veřejné)" className="input" />
              <input name="note" placeholder="Poznámka (jen pro vás)" className="input" />
              <Check name="skipWeekends" label="Vynechat víkendy" />
              <SaveButton className="btn-ghost btn-sm w-full">Použít na rozsah</SaveButton>
            </form>
          </Panel>

          <Panel title={`${MONTHS[m - 1]} v číslech`}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Potvrzené akce</dt><dd className="font-display text-xl font-bold">{confirmed.length}</dd></div>
              <div><dt className="text-slate-500">Nepotvrzené</dt><dd className="font-display text-xl font-bold text-amber-600">{monthBookings.length - confirmed.length}</dd></div>
              <div className="col-span-2"><dt className="text-slate-500">Domluvené honoráře</dt><dd className="font-display text-xl font-bold">{price(fees)}</dd></div>
            </dl>
          </Panel>
        </div>
      </div>

      <Panel title={`Rezervace – ${MONTHS[m - 1]} ${y}`} className="mt-6">
        {monthBookings.length === 0 ? (
          <p className="text-sm text-slate-500">V tomto měsíci nejsou žádné rezervace.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {monthBookings.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/rezervace/${b.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-950">{dateRange(b.dateFrom, b.dateTo)} · {b.company || b.contactName}</p>
                    <p className="text-sm text-slate-500">{b.courseTitle} · {[b.city, b.location].filter(Boolean).join(", ")}{b.isOnline ? " (online)" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">{b.fee ? price(b.fee) : ""}</span>
                    <StatusBadge map={BOOKING_STATUSES} value={b.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
