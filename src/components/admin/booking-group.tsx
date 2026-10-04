import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { BOOKING_STATUSES } from "@/lib/constants";
import { dateRange, plural } from "@/lib/format";
import { setBookingStatus } from "@/app/admin/actions";
import { StatusBadge } from "./ui";

/** Přehled všech dnů z jedné rezervace (klient vybral víc termínů naráz) + hromadné potvrzení. */
export async function BookingGroup({ groupId, currentId, back }: { groupId: string; currentId?: number; back: string }) {
  if (!groupId) return null;
  const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.groupId, groupId)).orderBy(asc(schema.bookings.dateFrom));
  if (rows.length < 2) return null;
  const days = rows.reduce((n, r) => n + Math.round((Date.parse(r.dateTo) - Date.parse(r.dateFrom)) / 86400000) + 1, 0);
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  return (
    <section className="card mb-6 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold">
          Rezervace více termínů · {plural(days, "den", "dny", "dní")} · {plural(rows.length, "blok", "bloky", "bloků")}
        </h2>
        {pendingCount > 0 && (
          <form action={setBookingStatus} className="flex gap-2">
            <input type="hidden" name="id" value={rows.find((r) => r.status === "pending")!.id} />
            <input type="hidden" name="whole" value="1" />
            <input type="hidden" name="back" value={back} />
            <button name="status" value="confirmed" className="btn btn-sm bg-excel-600 text-white hover:bg-excel-700">
              Potvrdit všechny nepotvrzené ({pendingCount})
            </button>
            <button name="status" value="cancelled" className="btn-ghost btn-sm">Zamítnout všechny</button>
          </form>
        )}
      </div>
      <ul className="mt-3 divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/rezervace/${r.id}`} className={`flex flex-wrap items-center justify-between gap-2 py-2 text-sm ${r.id === currentId ? "font-semibold" : ""}`}>
              <span className="text-ink-950">{dateRange(r.dateFrom, r.dateTo)}</span>
              <span className="flex-1 text-slate-600">{r.courseTitle}</span>
              <StatusBadge map={BOOKING_STATUSES} value={r.status} />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500">Každý blok upravujete zvlášť (honorář, poznámky). Kontakt a město se při úpravě jednoho bloku nemění u ostatních.</p>
    </section>
  );
}
