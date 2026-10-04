import Link from "next/link";
import { asc, count, eq, gte, and } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Table } from "@/components/admin/ui";
import { AccentPill, Badge } from "@/components/ui";
import { LEVELS } from "@/lib/constants";
import { price, todayISO } from "@/lib/format";

export const metadata = { title: "Kurzy" };

export default async function CoursesAdmin() {
  const [cats, courses, termCounts] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select().from(schema.courses).orderBy(asc(schema.courses.sortOrder), asc(schema.courses.title)),
    db
      .select({ courseId: schema.terms.courseId, n: count() })
      .from(schema.terms)
      .where(and(gte(schema.terms.startDate, todayISO()), eq(schema.terms.status, "open")))
      .groupBy(schema.terms.courseId),
  ]);
  const tc = new Map(termCounts.map((t) => [t.courseId, t.n]));
  const groups = [...cats.map((c) => ({ cat: c, items: courses.filter((k) => k.categoryId === c.id) })), { cat: null, items: courses.filter((k) => !cats.some((c) => c.id === k.categoryId)) }].filter((g) => g.items.length || g.cat);

  return (
    <>
      <AdminHeader
        title="Kurzy"
        subtitle={`${courses.length} kurzů v ${cats.length} oblastech`}
        actions={
          <>
            <Link href="/admin/kurzy/kategorie" className="btn-ghost btn-sm">Oblasti</Link>
            <Link href="/admin/kurzy/novy" className="btn-primary btn-sm">+ Nový kurz</Link>
          </>
        }
      />
      <div className="space-y-8">
        {groups.map(({ cat, items }) => (
          <section key={cat?.id ?? "none"}>
            <div className="mb-3 flex items-center gap-3">
              {cat ? <AccentPill accent={cat.accent} label={cat.name} /> : <Badge>Bez oblasti</Badge>}
            </div>
            <Table head={["Kurz", "Úroveň", "Délka", "Cena", "Termíny", "Stav"]} empty={items.length === 0}>
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/kurzy/${c.id}`} className="font-semibold text-ink-950 hover:text-m365-700">{c.title}</Link>
                    <div className="mt-0.5 flex gap-1">
                      {c.isFeatured && <Badge tone="blue">Doporučený</Badge>}
                      {c.isNew && <Badge tone="violet">Novinka</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{LEVELS[c.level]}</td>
                  <td className="px-4 py-3 text-slate-600">{c.durationDays} d</td>
                  <td className="px-4 py-3 whitespace-nowrap">{price(c.priceOpen)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/terminy/novy?kurz=${c.id}`} className="text-m365-700 hover:underline">{tc.get(c.id) ?? 0} · přidat</Link>
                  </td>
                  <td className="px-4 py-3">{c.isPublished ? <Badge tone="green">Zveřejněno</Badge> : <Badge>Skryto</Badge>}</td>
                </tr>
              ))}
            </Table>
          </section>
        ))}
      </div>
    </>
  );
}
