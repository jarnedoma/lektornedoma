import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader } from "@/components/admin/ui";
import { BookingForm } from "@/components/admin/booking-form";

export const metadata = { title: "Nová rezervace" };

export default async function NewBooking({ searchParams }: { searchParams: Promise<{ od?: string }> }) {
  const { od } = await searchParams;
  const courses = await db.select({ id: schema.courses.id, title: schema.courses.title }).from(schema.courses).orderBy(asc(schema.courses.title));
  return (
    <>
      <AdminHeader title="Nová rezervace" back={{ href: "/admin/kalendar", label: "Kalendář" }} />
      <BookingForm courses={courses} defaults={{ dateFrom: od }} />
    </>
  );
}
