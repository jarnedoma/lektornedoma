import Link from "next/link";
import type { ReactNode } from "react";
import { ACCENTS, LEVELS, type Tone } from "@/lib/constants";
import { IconStar } from "./icons";

const TONES: Record<Tone, string> = {
  blue: "bg-m365-50 text-m365-700 ring-m365-200",
  green: "bg-excel-50 text-excel-700 ring-excel-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  violet: "bg-copilot-50 text-copilot-700 ring-copilot-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({ tone = "slate", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function AccentPill({ accent, label }: { accent: string; label?: string }) {
  const a = ACCENTS[accent] ?? ACCENTS.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${a.bg} ${a.text} ${a.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
      {label ?? a.label}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return <Badge tone="slate">{LEVELS[level] ?? level}</Badge>;
}

export function PartnerBadge({ name }: { name?: string }) {
  return (
    <Badge tone="amber">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 12l4-4 4 2 3-3 7 5M7 16l2 2a1.5 1.5 0 002 0l4-4" />
      </svg>
      Partnerský termín{name ? ` · ${name}` : ""}
    </Badge>
  );
}

export function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 text-amber-400 ${className}`} aria-label={`Hodnocení ${value} z 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} width={16} height={16} className={i < value ? "" : "text-slate-200"} />
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
  center,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  action?: { href: string; label: string };
  center?: boolean;
}) {
  return (
    <div className={`mb-10 flex flex-col gap-4 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {text && <p className="mt-4 text-lg leading-relaxed text-slate-600">{text}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost shrink-0">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow?: string; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-slate-50 to-white">
      <div className="pointer-events-none absolute -top-40 right-0 h-80 w-[40rem] rounded-full bg-gradient-to-r from-m365-200/40 via-copilot-200/40 to-excel-200/40 blur-3xl" />
      <div className="container-x relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">{children}</div>;
}
