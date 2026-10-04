import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, FilterTabs, StatusBadge, Table } from "@/components/admin/ui";
import { INQUIRY_KINDS, INQUIRY_STATUSES } from "@/lib/constants";
import { dateTime } from "@/lib/format";

export const metadata = { title: "Poptávky" };

export default async function InquiriesAdmin({ searchParams }: { searchParams: Promise<{ stav?: string }> }) {
  const { stav } = await searchParams;
  const filter = stav && stav in INQUIRY_STATUSES ? stav : undefined;
  const [rows, counts] = await Promise.all([
    db
      .select({ inq: schema.inquiries, courseTitle: schema.courses.title })
      .from(schema.inquiries)
      .leftJoin(schema.courses, eq(schema.inquiries.courseId, schema.courses.id))
      .where(filter ? eq(schema.inquiries.status, filter) : inArray(schema.inquiries.status, ["new", "in_progress", "offer_sent"]))
      .orderBy(desc(schema.inquiries.createdAt)),
    db.select({ status: schema.inquiries.status, n: count() }).from(schema.inquiries).groupBy(schema.inquiries.status),
  ]);
  const cnt = Object.fromEntries(counts.map((c) => [c.status, c.n]));
  return (
    <>
      <AdminHeader title="Poptávky" subtitle="Poptávky firemních a individuálních školení z webu." />
      <FilterTabs base="/admin/poptavky" current={filter} tabs={[[undefined, "Otevřené"], ...Object.entries(INQUIRY_STATUSES).map(([k, v]) => [k, v.label, cnt[k] ?? 0] as [string, string, number])]} />
      <Table head={["Přijato", "Klient", "Zájem", "Účastníků", "Stav"]} empty={rows.length === 0}>
        {rows.map(({ inq: i, courseTitle }) => (
          <tr key={i.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{dateTime(i.createdAt)}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/poptavky/${i.id}`} className="font-semibold text-ink-950 hover:text-m365-700">{i.company || i.name}</Link>
              <div className="text-xs text-slate-500">{i.company ? `${i.name} · ` : ""}{i.email}</div>
            </td>
            <td className="px-4 py-3">
              {courseTitle || i.topic || <span className="text-slate-400">{i.message.slice(0, 60)}</span>}
              <div className="text-xs text-slate-500">{INQUIRY_KINDS[i.kind]}</div>
            </td>
            <td className="px-4 py-3">{i.participants ?? "—"}</td>
            <td className="px-4 py-3"><StatusBadge map={INQUIRY_STATUSES} value={i.status} /></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
