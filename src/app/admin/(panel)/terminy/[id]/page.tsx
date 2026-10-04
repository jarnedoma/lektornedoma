import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { TermForm } from "@/components/admin/term-form";
import { ConfirmButton } from "@/components/admin/client-bits";
import { ORDER_STATUSES } from "@/lib/constants";
import { price } from "@/lib/format";
import { deleteTerm } from "../../../actions";

export const metadata = { title: "Úprava termínu" };

export default async function EditTerm({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [term] = Number.isInteger(id) ? await db.select().from(schema.terms).where(eq(schema.terms.id, id)) : [];
  if (!term) notFound();
  const [courses, orders] = await Promise.all([
    db.select({ id: schema.courses.id, title: schema.courses.title, priceOpen: schema.courses.priceOpen }).from(schema.courses).orderBy(asc(schema.courses.title)),
    db.select().from(schema.orders).where(eq(schema.orders.termId, id)).orderBy(desc(schema.orders.createdAt)),
  ]);
  const course = courses.find((c) => c.id === term.courseId);
  return (
    <>
      <AdminHeader
        title={`Termín: ${course?.title ?? ""}`}
        back={{ href: "/admin/terminy", label: "Termíny" }}
        actions={
          <form action={deleteTerm}>
            <input type="hidden" name="id" value={term.id} />
            <ConfirmButton>Smazat termín</ConfirmButton>
          </form>
        }
      />
      <TermForm term={term} courses={courses} back={`/admin/terminy/${term.id}`} />
      <Panel title={`Přihlášky (${orders.reduce((n, o) => n + (o.status === "cancelled" ? 0 : o.participants), 0)} / ${term.capacity} účastníků)`} className="mt-6">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">Zatím žádné přihlášky.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/objednavky/${o.id}`} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="font-semibold text-ink-950">{o.company || o.name}</span>
                  <span className="flex-1 text-sm text-slate-500">{o.participants}× · {o.email}</span>
                  <span className="text-sm">{price(o.total)}</span>
                  <StatusBadge map={ORDER_STATUSES} value={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
