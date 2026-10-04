import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getCategoriesWithCourses, getClients, getFeaturedCourses, getTestimonials, getUpcomingTerms, getVideoCourses } from "@/lib/queries";
import { CourseCard, TermRow } from "@/components/course-card";
import { SectionHeading } from "@/components/ui";
import { TestimonialCard } from "@/components/testimonial-card";
import { LecturerPhoto } from "@/components/lecturer-photo";
import { ClientWall } from "@/components/client-wall";
import { price } from "@/lib/format";
import { IconArrowRight, IconCalendar, IconCheck, IconCloud, IconPlay, IconSparkle, IconTable, IconChart } from "@/components/icons";

const AREA_ICON: Record<string, typeof IconTable> = { excel: IconTable, m365: IconCloud, copilot: IconSparkle, powerbi: IconChart };
const AREA_STYLE: Record<string, string> = {
  excel: "from-excel-600 to-excel-500",
  m365: "from-m365-600 to-m365-500",
  copilot: "from-copilot-600 via-fuchsia-500 to-m365-500",
  powerbi: "from-amber-500 to-yellow-400",
  neutral: "from-slate-600 to-slate-500",
};

export default async function HomePage() {
  const [s, { categories }, featured, terms, testimonials, clients, videos] = await Promise.all([
    getSettings(),
    getCategoriesWithCourses(),
    getFeaturedCourses(),
    getUpcomingTerms(4),
    getTestimonials({ featured: true }),
    getClients(),
    getVideoCourses(),
  ]);
  const copilot = featured.filter((f) => f.category?.accent === "copilot");
  const otherFeatured = featured.filter((f) => f.category?.accent !== "copilot").slice(0, 6);

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,rgba(108,63,216,0.12),transparent),radial-gradient(50rem_30rem_at_0%_10%,rgba(16,124,65,0.10),transparent),radial-gradient(40rem_30rem_at_60%_100%,rgba(15,108,189,0.10),transparent)]" />
        <div className="container-x relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-excel-50 px-3 py-1 text-xs font-semibold text-excel-700 ring-1 ring-excel-200">Excel</span>
              <span className="rounded-full bg-m365-50 px-3 py-1 text-xs font-semibold text-m365-700 ring-1 ring-m365-200">Microsoft 365</span>
              <span className="rounded-full bg-copilot-50 px-3 py-1 text-xs font-semibold text-copilot-700 ring-1 ring-copilot-200">Copilot & AI</span>
            </div>
            <p className="mb-4 font-display text-lg font-semibold text-slate-500">{s.lecturerName} · lektor</p>
            <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-[3.5rem]">{s.heroHeadline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{s.heroText}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/poptavka" className="btn-primary px-6 py-3 text-base">
                Poptat firemní školení <IconArrowRight width={18} height={18} />
              </Link>
              <Link href="/kalendar" className="btn-ghost px-6 py-3 text-base">
                <IconCalendar width={18} height={18} /> Volné termíny lektora
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <LecturerPhoto url={s.photoUrl} name={s.lecturerName} />
            <div className="absolute -bottom-6 -left-4 rounded-2xl bg-white p-4 shadow-xl shadow-slate-300/40 ring-1 ring-slate-200 sm:-left-10">
              <p className="font-display text-3xl font-extrabold text-ink-950">{s.statParticipants}</p>
              <p className="text-xs font-medium text-slate-500">proškolených účastníků</p>
            </div>
            <div className="absolute -right-2 top-8 rounded-2xl bg-ink-950 p-4 text-white shadow-xl sm:-right-8">
              <p className="font-display text-3xl font-extrabold">od {s.statSince}</p>
              <p className="text-xs font-medium text-slate-300">lektoruji Microsoft Office</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Čísla ——— */}
      <section className="border-y border-slate-200/70 bg-slate-50/60">
        <div className="container-x grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {[
            [s.statParticipants, "účastníků"],
            [s.statCourses, "realizovaných kurzů"],
            [s.statDays, "odškolených dní"],
            [String(new Date().getFullYear() - Number(s.statSince || 2009)) + " let", "praxe v lektorování"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-3xl font-extrabold text-ink-950 sm:text-4xl">{n}</p>
              <p className="mt-1 text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Oblasti ——— */}
      <section className="container-x py-20 sm:py-28">
        <SectionHeading
          eyebrow="Co školím"
          title="Od Excelu po umělou inteligenci v Microsoft 365"
          text="Excel je můj domovský přístav. Dnes ale pomáhám firmám i s celým Microsoft 365 a s tím, jak smysluplně nasadit Copilota."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = AREA_ICON[cat.accent] ?? IconTable;
            return (
              <Link
                key={cat.id}
                href={`/kurzy#${cat.slug}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-lg transition hover:-translate-y-1 ${AREA_STYLE[cat.accent] ?? AREA_STYLE.neutral}`}
              >
                <Icon width={32} height={32} className="opacity-90" />
                <h3 className="mt-10 text-2xl font-bold text-white">{cat.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/85">{cat.description}</p>
                <p className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
                  {cat.courses.length} kurzů <IconArrowRight width={16} height={16} className="transition group-hover:translate-x-1" />
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ——— Copilot spotlight ——— */}
      {copilot.length > 0 && (
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-28">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-copilot-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-0 h-[26rem] w-[26rem] rounded-full bg-m365-600/25 blur-3xl" />
          <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-copilot-200">
                <IconSparkle width={16} height={16} /> Microsoft 365 Copilot
              </p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">AI, která šetří čas – když ji umíte používat.</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-300">
                Licence Copilota sama o sobě produktivitu nezvýší. Ukážu vašemu týmu konkrétní scénáře z jejich práce, naučím je psát dobrá zadání a
                kontrolovat výsledky. Bezpečně a v souladu s firemními pravidly.
              </p>
              <ul className="mt-6 space-y-2.5 text-slate-200">
                {["Workshopy pro uživatele i management", "Copilot v Excelu – moje specializace", "Knihovna promptů na míru vaší firmě", "Podpora při zavádění Copilota"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <IconCheck width={18} height={18} className="text-copilot-200" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/kurzy#copilot-ai" className="btn mt-8 bg-white text-ink-950 hover:bg-slate-100">
                Kurzy Copilot & AI <IconArrowRight width={16} height={16} />
              </Link>
            </div>
            <div className="grid content-center gap-4 sm:grid-cols-2">
              {copilot.slice(0, 4).map(({ course }) => (
                <Link
                  key={course.id}
                  href={`/kurzy/${course.slug}`}
                  className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
                >
                  {course.isNew && <span className="mb-3 inline-block rounded-full bg-copilot-500/30 px-2.5 py-0.5 text-xs font-semibold text-copilot-100">Novinka</span>}
                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{course.subtitle}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-copilot-200">
                    Detail kurzu <IconArrowRight width={15} height={15} className="transition group-hover:translate-x-1" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— Doporučené kurzy ——— */}
      {otherFeatured.length > 0 && (
        <section className="container-x py-20 sm:py-28">
          <SectionHeading eyebrow="Nejžádanější" title="Kurzy, které firmy objednávají nejčastěji" action={{ href: "/kurzy", label: "Celý katalog" }} />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {otherFeatured.map(({ course, category }) => (
              <CourseCard key={course.id} course={course} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* ——— Reference ——— */}
      {(testimonials.length > 0 || clients.length > 0) && (
        <section className="bg-slate-50/70 py-20 sm:py-28">
          <div className="container-x">
            <SectionHeading eyebrow="Reference" title="Školil jsem pro velké korporace i malé firmy" action={{ href: "/reference", label: "Všechny reference" }} />
            {clients.length > 0 && <ClientWall clients={clients.slice(0, 18)} />}
            {testimonials.length > 0 && (
              <div className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${clients.length ? "mt-12" : ""}`}>
                {testimonials.slice(0, 6).map((t) => (
                  <TestimonialCard key={t.id} t={t} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ——— Jak probíhá firemní školení ——— */}
      <section className="container-x py-20 sm:py-28">
        <SectionHeading eyebrow="Firemní školení" title="Jak spolupráce probíhá" text={s.priceCompanyDay} />
        <ol className="grid gap-5 md:grid-cols-4">
          {[
            ["Poptávka", "Napíšete mi, co potřebujete, nebo si rovnou zablokujete volný den v kalendáři."],
            ["Návrh na míru", "Upřesníme úroveň účastníků a jejich úlohy. Pošlu osnovu a cenu."],
            ["Školení", "U vás ve firmě nebo online. Prakticky, ideálně na vašich datech."],
            ["Podpora po kurzu", "Materiály, vzorové soubory a možnost doptat se na cokoli i po školení."],
          ].map(([t, d], i) => (
            <li key={t} className="card relative p-6">
              <span className="font-display text-5xl font-extrabold text-slate-100">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ——— Termíny ——— */}
      {terms.length > 0 && (
        <section className="container-x pb-20 sm:pb-28">
          <SectionHeading eyebrow="Kurzy pro veřejnost" title="Nejbližší otevřené termíny" action={{ href: "/terminy", label: "Všechny termíny" }} />
          <div className="grid gap-3">
            {terms.map(({ term, course, category }) => (
              <TermRow key={term.id} term={term} course={course} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* ——— Videokurzy ——— */}
      {videos.length > 0 && (
        <section className="container-x pb-20 sm:pb-28">
          <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-m365-50 via-white to-excel-50 p-8 ring-1 ring-slate-200 sm:p-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">Videokurzy</p>
              <h2 className="text-3xl font-bold sm:text-4xl">Učte se vlastním tempem</h2>
              <p className="mt-4 text-lg text-slate-600">Videokurzy Excelu a Copilota s praktickými příklady. Kdykoli, odkudkoli, s přístupem na vzdělávacím portálu.</p>
              <Link href="/videokurzy" className="btn-primary mt-7">
                Nabídka videokurzů <IconArrowRight width={16} height={16} />
              </Link>
            </div>
            <div className="grid gap-3">
              {videos.slice(0, 3).map((v) => (
                <Link key={v.id} href={`/videokurzy/${v.slug}`} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
                    <IconPlay />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-950">{v.title}</p>
                    <p className="text-sm text-slate-500">{v.lessonsCount} lekcí</p>
                  </div>
                  <p className="font-display font-bold text-ink-950">{price(v.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— CTA ——— */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-950 px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_120%,rgba(108,63,216,0.45),transparent)]" />
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">Pojďme naplánovat školení pro váš tým</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-300">Napište mi, co potřebujete, nebo si rovnou vyberte volný den v mém kalendáři.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/poptavka" className="btn bg-white px-6 py-3 text-base text-ink-950 hover:bg-slate-100">Nezávazná poptávka</Link>
            <Link href="/kalendar" className="btn bg-white/10 px-6 py-3 text-base text-white ring-1 ring-white/20 hover:bg-white/20">Rezervovat termín</Link>
          </div>
        </div>
      </section>
    </>
  );
}
