import { notFound } from "next/navigation";
import { and, asc, eq, gte, lte, ne } from "drizzle-orm";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { AdminHeader, StatusBadge } from "@/components/admin/ui";
import { BookingForm } from "@/components/admin/booking-form";
import { BookingGroup } from "@/components/admin/booking-group";
import { ConfirmButton } from "@/components/admin/client-bits";
import { BOOKING_STATUSES } from "@/lib/constants";
import { dateRange } from "@/lib/format";
import { deleteBooking } from "../../../actions";

export const metadata = { title: "Rezervace" };

export default async function EditBooking({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [b] = Number.isInteger(id) ? await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)) : [];
  if (!b) notFound();
  const [courses, conflicts] = await Promise.all([
    db.select({ id: schema.courses.id, title: schema.courses.title }).from(schema.courses).orderBy(asc(schema.courses.title)),
    db
      .select()
      .from(schema.bookings)
      .where(and(ne(schema.bookings.id, b.id), ne(schema.bookings.status, "cancelled"), lte(schema.bookings.dateFrom, b.dateTo), gte(schema.bookings.dateTo, b.dateFrom))),
  ]);
  return (
    <>
      <AdminHeader
        title={<span className="flex flex-wrap items-center gap-3">{dateRange(b.dateFrom, b.dateTo)} <StatusBadge map={BOOKING_STATUSES} value={b.status} /></span>}
        subtitle={`${b.company || b.contactName} · ${b.courseTitle}`}
        back={{ href: `/admin/kalendar?mesic=${b.dateFrom.slice(0, 7)}&den=${b.dateFrom}`, label: "Kalendář" }}
        actions={
          <form action={deleteBooking}>
            <input type="hidden" name="id" value={b.id} />
            <ConfirmButton>Smazat rezervaci</ConfirmButton>
          </form>
        }
      />
      {conflicts.length > 0 && b.status !== "cancelled" && (
        <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          <b>Pozor, kolize:</b> ve stejném termínu je i{" "}
          {conflicts.map((c, i) => (
            <span key={c.id}>
              {i > 0 && ", "}
              <Link href={`/admin/rezervace/${c.id}`} className="underline">{c.company || c.contactName} ({BOOKING_STATUSES[c.status]?.label})</Link>
            </span>
          ))}
          .
        </div>
      )}
      <BookingGroup groupId={b.groupId} currentId={b.id} back={`/admin/rezervace/${b.id}`} />
      <BookingForm booking={b} courses={courses} />
    </>
  );
}
