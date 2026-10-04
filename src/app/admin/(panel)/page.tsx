import Link from "next/link";
import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { INQUIRY_STATUSES, ORDER_STATUSES, TERM_STATUSES } from "@/lib/constants";
import { addDays, dateRange, dateTime, price, todayISO } from "@/lib/format";
import { monthBounds } from "@/lib/calendar";
import { setBookingStatus } from "../actions";
import { SaveButton } from "@/components/admin/client-bits";

export default async function Dashboard() {
  const today = todayISO();
  const { first, last } = monthBounds(Number(today.slice(0, 4)), Number(today.slice(5, 7)));
  const [pending, upcoming, inquiries, orders, terms, monthBookings] = await Promise.all([
    db.select().from(schema.bookings).where(eq(schema.bookings.status, "pending")).orderBy(asc(schema.bookings.dateFrom)),
    db
      .select()
      .from(schema.bookings)
      .where(and(eq(schema.bookings.status, "confirmed"), gte(schema.bookings.dateTo, today), lte(schema.bookings.dateFrom, addDays(today, 30))))
      .orderBy(asc(schema.bookings.dateFrom)),
    db.select().from(schema.inquiries).where(inArray(schema.inquiries.status, ["new", "in_progress"])).orderBy(desc(schema.inquiries.createdAt)).limit(6),
    db.select().from(schema.orders).where(inArray(schema.orders.status, ["new", "confirmed", "invoiced"])).orderBy(desc(schema.orders.createdAt)).limit(6),
    db
      .select({ term: schema.terms, course: schema.courses })
      .from(schema.terms)
      .innerJoin(schema.courses, eq(schema.terms.courseId, schema.courses.id))
      .where(gte(schema.terms.startDate, today))
      .orderBy(asc(schema.terms.startDate))
      .limit(5),
    db
      .select()
      .from(schema.bookings)
      .where(and(inArray(schema.bookings.status, ["confirmed", "done"]), lte(schema.bookings.dateFrom, last), gte(schema.bookings.dateTo, first))),
  ]);
  const monthFees = monthBookings.reduce((sum, b) => sum + (b.fee ?? 0), 0);
  const newInq = inquiries.filter((i) => i.status === "new").length;
  const newOrd = orders.filter((o) => o.status === "new").length;

  return (
    <>
      <AdminHeader title="Přehled" subtitle={`Dnes je ${dateRange(today)}`} actions={<Link href="/admin/rezervace/nova" className="btn-primary btn-sm">+ Nová rezervace</Link>} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Nepotvrzené rezervace", pending.length, "/admin/kalendar", "text-amber-600"],
          ["Nové poptávky", newInq, "/admin/poptavky?stav=new", "text-m365-600"],
          ["Nové objednávky", newOrd, "/admin/objednavky?stav=new", "text-excel-600"],
          ["Honoráře tento měsíc", price(monthFees), "/admin/kalendar", "text-ink-950"],
        ].map(([label, value, href, color]) => (
          <Link key={label as string} href={href as string} className="card p-5 transition hover:shadow-md">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 font-display text-3xl font-extrabold ${color}`}>{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Čeká na potvrzení" actions={<Link href="/admin/kalendar" className="text-xs font-semibold text-m365-700">Kalendář →</Link>}>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">Žádné nepotvrzené rezervace.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pending.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/admin/rezervace/${b.id}`} className="min-w-0">
                    <p className="font-semibold text-ink-950">{dateRange(b.dateFrom, b.dateTo)}</p>
                    <p className="truncate text-sm text-slate-500">{b.company || b.contactName} · {b.courseTitle} · {b.location}</p>
                  </Link>
                  <form action={setBookingStatus} className="shrink-0">
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <input type="hidden" name="back" value="/admin" />
                    <SaveButton className="btn btn-sm bg-excel-600 text-white hover:bg-excel-700">Potvrdit</SaveButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Nejbližší potvrzená školení (30 dní)">
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">Nic naplánováno.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/rezervace/${b.id}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-950">{dateRange(b.dateFrom, b.dateTo)}</p>
                      <p className="truncate text-sm text-slate-500">{b.company || b.contactName} · {b.courseTitle}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-700">{b.fee ? price(b.fee) : "—"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Otevřené poptávky" actions={<Link href="/admin/poptavky" className="text-xs font-semibold text-m365-700">Vše →</Link>}>
          {inquiries.length === 0 ? (
            <p className="text-sm text-slate-500">Žádné otevřené poptávky.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {inquiries.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/poptavky/${i.id}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-950">{i.company || i.name}</p>
                      <p className="truncate text-sm text-slate-500">{i.topic || i.message.slice(0, 80) || "—"} · {dateTime(i.createdAt)}</p>
                    </div>
                    <StatusBadge map={INQUIRY_STATUSES} value={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Rozpracované objednávky" actions={<Link href="/admin/objednavky" className="text-xs font-semibold text-m365-700">Vše →</Link>}>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">Žádné rozpracované objednávky.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/objednavky/${o.id}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-950">{o.itemTitle}</p>
                      <p className="truncate text-sm text-slate-500">{o.company || o.name} · {price(o.total)}</p>
                    </div>
                    <StatusBadge map={ORDER_STATUSES} value={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Nejbližší veřejné termíny" className="lg:col-span-2" actions={<Link href="/admin/terminy" className="text-xs font-semibold text-m365-700">Termíny →</Link>}>
          {terms.length === 0 ? (
            <p className="text-sm text-slate-500">Žádné vypsané termíny.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {terms.map(({ term, course }) => (
                <li key={term.id}>
                  <Link href={`/admin/terminy/${term.id}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-950">{course.title}</p>
                      <p className="truncate text-sm text-slate-500">{dateRange(term.startDate, term.endDate)} · {term.location}{term.isPartner ? ` · partner: ${term.partnerName}` : ""}</p>
                    </div>
                    <StatusBadge map={TERM_STATUSES} value={term.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
