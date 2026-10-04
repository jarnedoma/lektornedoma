import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { CourseForm } from "@/components/admin/course-form";

export const metadata = { title: "Nový kurz" };

export default async function NewCourse() {
  const categories = await db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder));
  return (
    <>
      <AdminHeader title="Nový kurz" back={{ href: "/admin/kurzy", label: "Kurzy" }} />
      <CourseForm categories={categories} />
    </>
  );
}
