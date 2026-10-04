import Link from "next/link";
import { and, asc, desc, eq, gte, lt, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, FilterTabs, StatusBadge, Table } from "@/components/admin/ui";
import { PartnerBadge, Badge } from "@/components/ui";
import { TERM_STATUSES } from "@/lib/constants";
import { dateRange, price, todayISO } from "@/lib/format";

export const metadata = { title: "Termíny" };

export default async function TermsAdmin({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const { typ } = await searchParams;
  const today = todayISO();
  const conds: SQL[] = [typ === "probehle" ? lt(schema.terms.startDate, today) : gte(schema.terms.startDate, today)];
  if (typ === "partner") conds.push(eq(schema.terms.isPartner, true));
  if (typ === "vlastni") conds.push(eq(schema.terms.isPartner, false));
  const rows = await db
    .select({ term: schema.terms, course: schema.courses })
    .from(schema.terms)
    .innerJoin(schema.courses, eq(schema.terms.courseId, schema.courses.id))
    .where(and(...conds))
    .orderBy(typ === "probehle" ? desc(schema.terms.startDate) : asc(schema.terms.startDate));
  const orders = await db.select({ termId: schema.orders.termId, participants: schema.orders.participants, status: schema.orders.status }).from(schema.orders).where(eq(schema.orders.kind, "term"));
  const booked = new Map<number, number>();
  for (const o of orders) if (o.termId && o.status !== "cancelled") booked.set(o.termId, (booked.get(o.termId) ?? 0) + o.participants);

  return (
    <>
      <AdminHeader title="Termíny kurzů" subtitle="Veřejné termíny vlastní i partnerské." actions={<Link href="/admin/terminy/novy" className="btn-primary btn-sm">+ Nový termín</Link>} />
      <FilterTabs base="/admin/terminy" param="typ" current={typ} tabs={[[undefined, "Nadcházející"], ["vlastni", "Vlastní"], ["partner", "Partnerské"], ["probehle", "Proběhlé"]]} />
      <Table head={["Datum", "Kurz", "Místo", "Přihlášeno", "Cena", "Stav"]} empty={rows.length === 0}>
        {rows.map(({ term: t, course: c }) => (
          <tr key={t.id} className={`hover:bg-slate-50/60 ${t.isPartner ? "bg-amber-50/30" : ""}`}>
            <td className="px-4 py-3 font-semibold whitespace-nowrap"><Link href={`/admin/terminy/${t.id}`} className="hover:text-m365-700">{dateRange(t.startDate, t.endDate)}</Link></td>
            <td className="px-4 py-3">
              <Link href={`/admin/terminy/${t.id}`} className="hover:text-m365-700">{c.title}</Link>
              <div className="mt-0.5 flex gap-1">
                {t.isPartner && <PartnerBadge name={t.partnerName} />}
                {t.isOnline && <Badge tone="blue">Online</Badge>}
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{t.location}</td>
            <td className="px-4 py-3">{t.isPartner && t.partnerUrl ? <span className="text-slate-400">u partnera</span> : `${booked.get(t.id) ?? 0} / ${t.capacity}`}</td>
            <td className="px-4 py-3 whitespace-nowrap">{price(t.price ?? c.priceOpen)}</td>
            <td className="px-4 py-3"><StatusBadge map={TERM_STATUSES} value={t.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
