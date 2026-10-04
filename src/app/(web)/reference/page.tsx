import type { Metadata } from "next";
import Link from "next/link";
import { getClients, getTestimonials } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { ClientWall } from "@/components/client-wall";
import { TestimonialCard } from "@/components/testimonial-card";
import { EmptyState, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Reference", description: "Reference firem a hodnocení účastníků kurzů Excel, Microsoft 365 a Copilot." };

export default async function ReferencesPage({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const { typ } = await searchParams;
  const view = typ === "jednotlivci" ? "individual" : typ === "firmy" ? "company" : "all";
  const [s, clients, companies, individuals] = await Promise.all([
    getSettings(),
    getClients(),
    getTestimonials({ kind: "company" }),
    getTestimonials({ kind: "individual" }),
  ]);
  const tab = (key: string | undefined, label: string, count: number) => (
    <Link
      href={key ? `/reference?typ=${key}` : "/reference"}
      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${(typ ?? undefined) === key ? "bg-ink-950 text-white ring-ink-950" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
    >
      {label} <span className="opacity-60">{count}</span>
    </Link>
  );

  return (
    <>
      <PageHero
        eyebrow="Reference"
        title="Důvěřují mi velké korporace i malé firmy"
        text={`Za ${new Date().getFullYear() - Number(s.statSince || 2009)} let jsem proškolil přes ${s.statParticipants} účastníků na ${s.statCourses} kurzech. Tady je, co o školeních říkají firmy i jednotliví účastníci.`}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {tab(undefined, "Vše", companies.length + individuals.length)}
          {tab("firmy", "Firmy", companies.length + clients.length)}
          {tab("jednotlivci", "Účastníci kurzů", individuals.length)}
        </div>
      </PageHero>

      <div className="container-x space-y-16 py-14">
        {view !== "individual" && clients.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Firmy, pro které jsem školil</h2>
            <ClientWall clients={clients} />
          </section>
        )}
        {view !== "individual" && companies.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Reference firem</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
        {view !== "company" && individuals.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold">Hodnocení účastníků</h2>
            <div className="columns-1 gap-5 md:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
              {individuals.map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
        {companies.length + individuals.length + clients.length === 0 && <EmptyState>Reference se připravují.</EmptyState>}
      </div>
    </>
  );
}
