import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getSettings } from "@/lib/settings";
import { getCategoriesWithCourses } from "@/lib/queries";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PageHero } from "@/components/ui";
import { IconCalendar, IconMail, IconPhone } from "@/components/icons";

export const metadata: Metadata = { title: "Poptávka školení" };

export default async function InquiryPage({ searchParams }: { searchParams: Promise<{ kurz?: string }> }) {
  await connection();
  const { kurz } = await searchParams;
  const [s, { categories }] = await Promise.all([getSettings(), getCategoriesWithCourses()]);
  const options = categories.flatMap((c) => c.courses.map((k) => ({ id: k.id, title: k.title, group: c.name })));
  return (
    <>
      <PageHero
        eyebrow="Poptávka"
        title="Poptejte školení pro sebe nebo celý tým"
        text="Popište, co potřebujete. Ozvu se obvykle do 24 hodin s návrhem obsahu, termínu a ceny. Poptávka je nezávazná."
      />
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <InquiryForm courses={options} defaultCourseId={kurz ? Number(kurz) : undefined} />
        <aside className="space-y-5">
          <div className="card space-y-3 p-6">
            <p className="font-display text-lg font-bold text-ink-950">Raději napřímo?</p>
            <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-slate-700 hover:text-ink-950"><IconMail width={18} height={18} /> {s.email}</a>
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-700 hover:text-ink-950"><IconPhone width={18} height={18} /> {s.phone}</a>
          </div>
          <div className="card p-6">
            <p className="font-display text-lg font-bold text-ink-950">Víte už termín?</p>
            <p className="mt-2 text-sm text-slate-600">V kalendáři vidíte moje volné dny a jeden si můžete rovnou zablokovat.</p>
            <Link href="/kalendar" className="btn-ghost mt-4 w-full"><IconCalendar width={16} height={16} /> Otevřít kalendář</Link>
          </div>
          <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-slate-200/70">{s.priceCompanyDay}</div>
        </aside>
      </div>
    </>
  );
}
