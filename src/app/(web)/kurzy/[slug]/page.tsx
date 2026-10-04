import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { TermRow } from "@/components/course-card";
import { AccentPill, Badge, LevelBadge } from "@/components/ui";
import { ACCENTS } from "@/lib/constants";
import { lines, paragraphs, plural, price } from "@/lib/format";
import { IconArrowRight, IconCalendar, IconCheck, IconClock, IconUsers } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await getCourseBySlug((await params).slug);
  if (!data) return {};
  return { title: data.course.title, description: data.course.perex || data.course.subtitle };
}

export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getCourseBySlug((await params).slug);
  if (!data) notFound();
  const { course, category, terms } = data;
  const s = await getSettings();
  const a = ACCENTS[category?.accent ?? "neutral"] ?? ACCENTS.neutral;
  const syllabus = lines(course.syllabus);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${a.grad}`} />
        <div className="container-x py-12 sm:py-16">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/kurzy" className="hover:text-ink-950">Kurzy</Link>
            {category && (
              <>
                {" / "}
                <Link href={`/kurzy#${category.slug}`} className="hover:text-ink-950">{category.name}</Link>
              </>
            )}
          </nav>
          <div className="mb-5 flex flex-wrap gap-2">
            {category && <AccentPill accent={category.accent} />}
            <LevelBadge level={course.level} />
            {course.isNew && <Badge tone="violet">Novinka</Badge>}
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">{course.title}</h1>
          {course.subtitle && <p className="mt-4 max-w-2xl text-xl text-slate-600">{course.subtitle}</p>}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><IconClock width={18} height={18} /> {plural(course.durationDays, "den", "dny", "dní")} · {course.hoursPerDay} h denně</span>
            <span className="inline-flex items-center gap-2"><IconUsers width={18} height={18} /> firemně i pro veřejnost</span>
            {terms.length > 0 && (
              <a href="#terminy" className="inline-flex items-center gap-2 font-semibold text-m365-700">
                <IconCalendar width={18} height={18} /> {plural(terms.length, "vypsaný termín", "vypsané termíny", "vypsaných termínů")}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {course.perex && <p className="mb-8 text-xl leading-relaxed text-ink-900">{course.perex}</p>}
          {course.description && (
            <div className="prose-lite mb-10">
              {paragraphs(course.description).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {syllabus.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 text-2xl font-bold">Co se naučíte</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {syllabus.map((item) => (
                  <li key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-slate-700">
                    <IconCheck width={20} height={20} className={`mt-0.5 shrink-0 ${a.text}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {(course.audience || course.prerequisites) && (
            <section className="mb-12 grid gap-5 sm:grid-cols-2">
              {course.audience && (
                <div className="card p-6">
                  <h3 className="mb-2 font-bold">Pro koho je kurz</h3>
                  <p className="text-slate-600">{course.audience}</p>
                </div>
              )}
              {course.prerequisites && (
                <div className="card p-6">
                  <h3 className="mb-2 font-bold">Předpoklady</h3>
                  <p className="text-slate-600">{course.prerequisites}</p>
                </div>
              )}
            </section>
          )}

          <section id="terminy" className="scroll-mt-24">
            <h2 className="mb-5 text-2xl font-bold">Otevřené termíny</h2>
            {terms.length ? (
              <div className="grid gap-3">
                {terms.map((t) => (
                  <TermRow key={t.id} term={t} course={course} category={category} showCourse={false} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8">
                <p className="text-slate-600">Momentálně není vypsaný žádný veřejný termín. Kurz vám ale rád odškolím firemně, nebo dejte vědět, že máte zájem o další termín.</p>
                <Link href={`/poptavka?kurz=${course.id}`} className="btn-ghost mt-4">Mám zájem o termín</Link>
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className={`bg-gradient-to-br p-6 text-white ${a.grad}`}>
              <p className="text-sm text-white/80">Veřejný termín</p>
              <p className="font-display text-3xl font-extrabold">{course.priceOpen ? price(course.priceOpen) : "na dotaz"}</p>
              {course.priceOpen && <p className="text-xs text-white/80">za osobu bez DPH</p>}
            </div>
            <div className="space-y-4 p-6">
              <div>
                <p className="text-sm font-semibold text-ink-950">Firemní školení na míru</p>
                <p className="mt-1 text-sm text-slate-600">{s.priceCompanyDay}</p>
              </div>
              <Link href={`/poptavka?kurz=${course.id}`} className="btn-primary w-full">
                Poptat pro firmu <IconArrowRight width={16} height={16} />
              </Link>
              <Link href="/kalendar" className="btn-ghost w-full">
                <IconCalendar width={16} height={16} /> Vybrat volný den lektora
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
