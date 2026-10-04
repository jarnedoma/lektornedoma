import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Table } from "@/components/admin/ui";
import { AccentPill, Badge } from "@/components/ui";
import { price } from "@/lib/format";

export const metadata = { title: "Videokurzy" };

export default async function VideosAdmin() {
  const [rows, sold] = await Promise.all([
    db.select().from(schema.videoCourses).orderBy(asc(schema.videoCourses.sortOrder)),
    db.select({ id: schema.orders.videoCourseId, n: count() }).from(schema.orders).where(eq(schema.orders.kind, "video")).groupBy(schema.orders.videoCourseId),
  ]);
  const soldMap = new Map(sold.map((s) => [s.id, s.n]));
  return (
    <>
      <AdminHeader
        title="Videokurzy"
        subtitle="Nabídka videokurzů na webu. Samotné kurzy běží na externím vzdělávacím portálu."
        actions={<Link href="/admin/videokurzy/novy" className="btn-primary btn-sm">+ Nový videokurz</Link>}
      />
      <Table head={["Videokurz", "Oblast", "Lekcí", "Cena", "Objednávek", "Stav"]} empty={rows.length === 0}>
        {rows.map((v) => (
          <tr key={v.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3"><Link href={`/admin/videokurzy/${v.id}`} className="font-semibold text-ink-950 hover:text-m365-700">{v.title}</Link></td>
            <td className="px-4 py-3"><AccentPill accent={v.accent} /></td>
            <td className="px-4 py-3">{v.lessonsCount}</td>
            <td className="px-4 py-3 whitespace-nowrap">{price(v.price)}</td>
            <td className="px-4 py-3">{soldMap.get(v.id) ?? 0}</td>
            <td className="px-4 py-3">{v.isPublished ? <Badge tone="green">Zveřejněno</Badge> : <Badge>Skryto</Badge>}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
