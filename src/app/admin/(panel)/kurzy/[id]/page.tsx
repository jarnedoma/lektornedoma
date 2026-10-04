import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { CourseForm } from "@/components/admin/course-form";
import { ConfirmButton } from "@/components/admin/client-bits";
import { PartnerBadge } from "@/components/ui";
import { TERM_STATUSES } from "@/lib/constants";
import { dateRange, price, todayISO } from "@/lib/format";
import { deleteCourse } from "../../../actions";

export const metadata = { title: "Úprava kurzu" };

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [course] = Number.isInteger(id) ? await db.select().from(schema.courses).where(eq(schema.courses.id, id)) : [];
  if (!course) notFound();
  const [categories, terms] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db.select().from(schema.terms).where(eq(schema.terms.courseId, id)).orderBy(desc(schema.terms.startDate)),
  ]);
  const today = todayISO();
  return (
    <>
      <AdminHeader
        title={course.title}
        back={{ href: "/admin/kurzy", label: "Kurzy" }}
        actions={
          <>
            <Link href={`/kurzy/${course.slug}`} target="_blank" className="btn-ghost btn-sm">Zobrazit na webu ↗</Link>
            <form action={deleteCourse}>
              <input type="hidden" name="id" value={course.id} />
              <ConfirmButton message="Smazat kurz včetně všech jeho termínů?">Smazat</ConfirmButton>
            </form>
          </>
        }
      />
      <Panel
        title="Termíny kurzu"
        className="mb-6"
        actions={<Link href={`/admin/terminy/novy?kurz=${course.id}`} className="btn-primary btn-sm">+ Přidat termín</Link>}
      >
        {terms.length === 0 ? (
          <p className="text-sm text-slate-500">Kurz zatím nemá žádné termíny.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {terms.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/terminy/${t.id}`} className={`flex flex-wrap items-center justify-between gap-3 py-2.5 ${t.startDate < today ? "opacity-50" : ""}`}>
                  <span className="font-semibold text-ink-950">{dateRange(t.startDate, t.endDate)}</span>
                  <span className="flex-1 text-sm text-slate-500">{t.location}</span>
                  {t.isPartner && <PartnerBadge name={t.partnerName} />}
                  <span className="text-sm">{price(t.price ?? course.priceOpen)}</span>
                  <StatusBadge map={TERM_STATUSES} value={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <CourseForm course={course} categories={categories} />
    </>
  );
}
