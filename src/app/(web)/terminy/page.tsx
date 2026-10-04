import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingTerms } from "@/lib/queries";
import { TermRow } from "@/components/course-card";
import { EmptyState, PageHero } from "@/components/ui";
import { MONTHS } from "@/lib/format";

export const metadata: Metadata = { title: "Termíny kurzů pro veřejnost" };

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const { typ } = await searchParams;
  const all = await getUpcomingTerms();
  const rows = all.filter(({ term }) => (typ === "partner" ? term.isPartner : typ === "vlastni" ? !term.isPartner : true));
  const byMonth = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = r.term.startDate.slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), r]);
  }
  const tab = (key: string | undefined, label: string) => (
    <Link
      href={key ? `/terminy?typ=${key}` : "/terminy"}
      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${typ === key ? "bg-ink-950 text-white ring-ink-950" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHero
        eyebrow="Kurzy pro veřejnost"
        title="Otevřené termíny"
        text="Přihlaste se na kurz s účastníky z různých firem. Partnerské termíny realizuji ve spolupráci se školicími centry – přihláška probíhá u partnera."
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {tab(undefined, "Všechny")}
          {tab("vlastni", "Moje termíny")}
          {tab("partner", "Partnerské termíny")}
        </div>
      </PageHero>
      <div className="container-x space-y-12 py-14">
        {rows.length === 0 && (
          <EmptyState>
            Momentálně nejsou vypsané žádné termíny. <Link href="/poptavka" className="font-semibold text-m365-700">Napište mi</Link> a dám vám vědět o dalším.
          </EmptyState>
        )}
        {[...byMonth.entries()].map(([ym, items]) => (
          <section key={ym}>
            <h2 className="mb-4 text-xl font-bold">
              {MONTHS[Number(ym.slice(5)) - 1]} <span className="text-slate-400">{ym.slice(0, 4)}</span>
            </h2>
            <div className="grid gap-3">
              {items.map(({ term, course, category }) => (
                <TermRow key={term.id} term={term} course={course} category={category} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
