import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesWithCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";
import { EmptyState, PageHero } from "@/components/ui";
import { ACCENTS, LEVELS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Katalog kurzů",
  description: "Kurzy Microsoft Excel, Microsoft 365, Copilot a Power BI – pro veřejnost i jako firemní školení na míru.",
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ uroven?: string; q?: string }> }) {
  const { uroven, q } = await searchParams;
  const [{ categories, uncategorized }, s] = await Promise.all([getCategoriesWithCourses(), getSettings()]);
  const query = (q ?? "").trim().toLowerCase();
  const match = (c: { level: string; title: string; subtitle: string; perex: string }) =>
    (!uroven || c.level === uroven || c.level === "vsichni") &&
    (!query || `${c.title} ${c.subtitle} ${c.perex}`.toLowerCase().includes(query));
  const sections = [
    ...categories.map((c) => ({ ...c, courses: c.courses.filter(match) })),
    ...(uncategorized.length
      ? [{ id: 0, slug: "dalsi", name: "Další kurzy", description: "", accent: "neutral", sortOrder: 99, courses: uncategorized.filter(match) }]
      : []),
  ];
  const total = sections.reduce((n, s) => n + s.courses.length, 0);
  const filterHref = (lvl?: string) => {
    const p = new URLSearchParams();
    if (lvl) p.set("uroven", lvl);
    if (q) p.set("q", q);
    const str = p.toString();
    return `/kurzy${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow="Katalog kurzů"
        title="Excel, Microsoft 365 a Copilot – přehledně na jednom místě"
        text={
          <>
            Všechny kurzy realizuji jako firemní školení na míru (u vás nebo online) a vybrané i jako otevřené termíny pro veřejnost.{" "}
            <span className="text-slate-500">{s.priceCompanyDay}</span>
          </>
        }
      />

      <div className="sticky top-16 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="container-x flex flex-col gap-2 py-3">
          <nav className="-mx-1 flex gap-1 overflow-x-auto">
            {sections.map((c) => {
              const a = ACCENTS[c.accent] ?? ACCENTS.neutral;
              return (
                <a key={c.slug} href={`#${c.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-ink-950">
                  <span className={`h-2 w-2 rounded-full ${a.dot}`} />
                  {c.name}
                  <span className="text-xs text-slate-400">{c.courses.length}</span>
                </a>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-2 sm:justify-between">
            <form action="/kurzy" className="relative order-last sm:order-none">
              {uroven && <input type="hidden" name="uroven" value={uroven} />}
              <input name="q" defaultValue={q} placeholder="Hledat kurz…" className="input w-48 py-1.5" />
            </form>
            <div className="flex flex-wrap gap-1">
              <Link href={filterHref()} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${!uroven ? "bg-ink-950 text-white ring-ink-950" : "text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>
                Všechny úrovně
              </Link>
              {Object.entries(LEVELS)
                .filter(([k]) => k !== "vsichni")
                .map(([k, l]) => (
                  <Link key={k} href={filterHref(k)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${uroven === k ? "bg-ink-950 text-white ring-ink-950" : "text-slate-600 ring-slate-200 hover:bg-slate-50"}`}>
                    {l}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x space-y-20 py-14">
        {total === 0 && <EmptyState>Filtru neodpovídá žádný kurz. <Link href="/kurzy" className="font-semibold text-m365-700">Zrušit filtr</Link></EmptyState>}
        {sections
          .filter((c) => c.courses.length > 0)
          .map((cat) => {
            const a = ACCENTS[cat.accent] ?? ACCENTS.neutral;
            return (
              <section key={cat.slug} id={cat.slug} className="scroll-mt-44">
                <div className="mb-8 flex items-start gap-4">
                  <span className={`mt-1 h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${a.grad}`} />
                  <div>
                    <h2 className="text-3xl font-bold">{cat.name}</h2>
                    {cat.description && <p className="mt-2 max-w-2xl text-slate-600">{cat.description}</p>}
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {cat.courses.map((course) => (
                    <CourseCard key={course.id} course={course} category={cat.id ? cat : null} />
                  ))}
                </div>
              </section>
            );
          })}

        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Nenašli jste, co hledáte?</h3>
            <p className="mt-1 text-slate-600">Každé firemní školení připravuji na míru. Popište mi, co váš tým potřebuje.</p>
          </div>
          <Link href="/poptavka" className="btn-primary shrink-0">Poptat kurz na míru</Link>
        </div>
      </div>
    </>
  );
}
