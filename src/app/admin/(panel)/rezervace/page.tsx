import Link from "next/link";
import { asc, desc, eq, gte, lt, and, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, FilterTabs, StatusBadge, Table } from "@/components/admin/ui";
import { BOOKING_STATUSES } from "@/lib/constants";
import { dateRange, price, todayISO } from "@/lib/format";

export const metadata = { title: "Rezervace" };

export default async function BookingsList({ searchParams }: { searchParams: Promise<{ stav?: string }> }) {
  const { stav } = await searchParams;
  const today = todayISO();
  const conds: SQL[] = [];
  if (stav === "probehle") conds.push(lt(schema.bookings.dateTo, today));
  else if (stav && stav in BOOKING_STATUSES) conds.push(eq(schema.bookings.status, stav));
  else conds.push(gte(schema.bookings.dateTo, today));
  const rows = await db
    .select()
    .from(schema.bookings)
    .where(and(...conds))
    .orderBy(stav === "probehle" ? desc(schema.bookings.dateFrom) : asc(schema.bookings.dateFrom));
  return (
    <>
      <AdminHeader title="Rezervace lektora" back={{ href: "/admin/kalendar", label: "Kalendář" }} actions={<Link href="/admin/rezervace/nova" className="btn-primary btn-sm">+ Nová rezervace</Link>} />
      <FilterTabs
        base="/admin/rezervace"
        current={stav}
        tabs={[[undefined, "Nadcházející"], ...Object.entries(BOOKING_STATUSES).map(([k, v]) => [k, v.label] as [string, string]), ["probehle", "Proběhlé"]]}
      />
      <Table head={["Termín", "Klient", "Kurz", "Místo", "Honorář", "Stav"]} empty={rows.length === 0}>
        {rows.map((b) => (
          <tr key={b.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 font-semibold whitespace-nowrap"><Link href={`/admin/rezervace/${b.id}`} className="hover:text-m365-700">{dateRange(b.dateFrom, b.dateTo)}</Link></td>
            <td className="px-4 py-3">{b.company || b.contactName}</td>
            <td className="px-4 py-3 text-slate-600">{b.courseTitle}</td>
            <td className="px-4 py-3 text-slate-600">{b.location}{b.isOnline ? " (online)" : ""}</td>
            <td className="px-4 py-3 whitespace-nowrap">{b.fee ? price(b.fee) : "—"}</td>
            <td className="px-4 py-3"><StatusBadge map={BOOKING_STATUSES} value={b.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
