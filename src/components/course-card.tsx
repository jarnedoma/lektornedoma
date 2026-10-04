import Link from "next/link";
import type { Category, Course, Term } from "@/lib/schema";
import { ACCENTS } from "@/lib/constants";
import { dateRange, plural, price } from "@/lib/format";
import { AccentPill, Badge, LevelBadge, PartnerBadge } from "./ui";
import { IconArrowRight, IconCalendar, IconClock, IconPin } from "./icons";

export function CourseCard({ course, category }: { course: Course; category?: Category | null }) {
  const accent = category?.accent ?? "neutral";
  const a = ACCENTS[accent] ?? ACCENTS.neutral;
  return (
    <Link href={`/kurzy/${course.slug}`} className="card group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.grad}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {category && <AccentPill accent={accent} label={a.label} />}
        <LevelBadge level={course.level} />
        {course.isNew && <Badge tone="violet">Novinka</Badge>}
      </div>
      <h3 className="text-lg font-bold leading-snug group-hover:text-m365-700">{course.title}</h3>
      {course.subtitle && <p className="mt-1.5 text-sm text-slate-600">{course.subtitle}</p>}
      <div className="mt-auto flex items-center justify-between pt-6 text-sm">
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <IconClock width={16} height={16} /> {plural(course.durationDays, "den", "dny", "dní")}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-ink-950">
          {course.priceOpen ? `od ${price(course.priceOpen)}` : "na míru"}
          <IconArrowRight width={16} height={16} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function TermRow({
  term,
  course,
  category,
  showCourse = true,
}: {
  term: Term;
  course: Course;
  category?: Category | null;
  showCourse?: boolean;
}) {
  const unit = term.price ?? course.priceOpen;
  const d = new Date(term.startDate + "T00:00:00Z");
  const full = term.status === "full";
  const external = term.isPartner && term.partnerUrl;
  return (
    <div className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${term.isPartner ? "bg-amber-50/30 ring-amber-200" : ""}`}>
      <div className="flex shrink-0 items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 text-center ring-1 ring-slate-200">
          <div>
            <p className="font-display text-2xl font-extrabold leading-none text-ink-950">{d.getUTCDate()}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase text-slate-500">
              {d.toLocaleString("cs-CZ", { month: "short", timeZone: "UTC" })}
            </p>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {showCourse && category && <AccentPill accent={category.accent} />}
          {term.isPartner && <PartnerBadge name={term.partnerName} />}
          {term.isOnline && <Badge tone="blue">Online</Badge>}
          {full && <Badge tone="amber">Obsazeno</Badge>}
        </div>
        {showCourse && (
          <Link href={`/kurzy/${course.slug}`} className="font-display text-lg font-bold text-ink-950 hover:text-m365-700">
            {course.title}
          </Link>
        )}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><IconCalendar width={15} height={15} /> {dateRange(term.startDate, term.endDate)}</span>
          <span className="inline-flex items-center gap-1.5"><IconClock width={15} height={15} /> {term.timeFrom}–{term.timeTo}</span>
          <span className="inline-flex items-center gap-1.5"><IconPin width={15} height={15} /> {term.location}</span>
        </div>
        {term.note && <p className="mt-1.5 text-xs text-slate-500">{term.note}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
        <p className="font-display text-lg font-bold text-ink-950">{price(unit)}</p>
        {external ? (
          <a href={term.partnerUrl} target="_blank" rel="noopener" className="btn-ghost btn-sm">
            Přihláška u partnera ↗
          </a>
        ) : full ? (
          <Link href={`/poptavka?kurz=${course.id}`} className="btn-ghost btn-sm">Zájem o další termín</Link>
        ) : (
          <Link href={`/objednavka/${term.id}`} className="btn-accent btn-sm">Přihlásit se</Link>
        )}
      </div>
    </div>
  );
}
