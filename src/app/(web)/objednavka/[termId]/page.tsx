import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { getTermForOrder } from "@/lib/queries";
import { TermOrderForm } from "@/components/forms/order-form";
import { dateRange, price, todayISO } from "@/lib/format";
import { IconCalendar, IconClock, IconPin } from "@/components/icons";

export const metadata: Metadata = { title: "Přihláška na kurz", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ termId: string }> }) {
  await connection();
  const id = Number((await params).termId);
  const row = Number.isInteger(id) ? await getTermForOrder(id) : null;
  if (!row || !row.course.isPublished) notFound();
  const { term, course } = row;
  if (term.isPartner && term.partnerUrl) redirect(term.partnerUrl);
  const available = term.status === "open" && term.startDate >= todayISO();
  const unit = term.price ?? course.priceOpen;

  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_24rem]">
      <div>
        <p className="eyebrow mb-3">Přihláška na kurz</p>
        <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">{course.title}</h1>
        {available ? (
          <div className="card p-6 sm:p-8">
            <TermOrderForm termId={term.id} unitPrice={unit} maxParticipants={term.capacity} />
          </div>
        ) : (
          <div className="card p-8">
            <p className="text-slate-600">Tento termín už není možné objednat.</p>
            <Link href={`/kurzy/${course.slug}`} className="btn-ghost mt-4">Zpět na kurz</Link>
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-6">
          <p className="font-display text-lg font-bold text-ink-950">Shrnutí</p>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-center gap-2"><IconCalendar width={16} height={16} /> {dateRange(term.startDate, term.endDate)}</li>
            <li className="flex items-center gap-2"><IconClock width={16} height={16} /> {term.timeFrom}–{term.timeTo}</li>
            <li className="flex items-center gap-2"><IconPin width={16} height={16} /> {term.location}</li>
          </ul>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">Cena za osobu (bez DPH)</p>
            <p className="font-display text-2xl font-bold text-ink-950">{price(unit)}</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Po odeslání přihlášky obdržíte potvrzení a fakturu. V ceně jsou studijní materiály a vzorové soubory.
          </p>
        </div>
      </aside>
    </div>
  );
}
