import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { TermForm } from "@/components/admin/term-form";

export const metadata = { title: "Nový termín" };

export default async function NewTerm({ searchParams }: { searchParams: Promise<{ kurz?: string }> }) {
  const { kurz } = await searchParams;
  const courses = await db.select({ id: schema.courses.id, title: schema.courses.title, priceOpen: schema.courses.priceOpen }).from(schema.courses).orderBy(asc(schema.courses.title));
  const courseId = kurz ? Number(kurz) : undefined;
  return (
    <>
      <AdminHeader title="Nový termín" back={{ href: courseId ? `/admin/kurzy/${courseId}` : "/admin/terminy", label: courseId ? "Kurz" : "Termíny" }} />
      <TermForm courses={courses} courseId={courseId} back={courseId ? `/admin/kurzy/${courseId}` : "/admin/terminy"} />
    </>
  );
}
