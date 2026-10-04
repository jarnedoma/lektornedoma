import type { Testimonial } from "@/lib/schema";
import { IconQuote } from "./icons";
import { Stars } from "./ui";

export function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.authorName
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <figure className="card flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between">
        <IconQuote width={28} height={28} className={t.kind === "company" ? "text-m365-200" : "text-copilot-200"} />
        {t.rating > 0 && <Stars value={t.rating} />}
      </div>
      <blockquote className="flex-1 leading-relaxed text-slate-700">{t.text}</blockquote>
      {t.courseName && <p className="mt-4 text-xs font-medium text-slate-500">Kurz: {t.courseName}</p>}
      <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{initials}</span>
        <span className="min-w-0 text-sm">
          <span className="block font-semibold text-ink-950">{t.authorName}</span>
          <span className="block truncate text-slate-500">{[t.authorRole, t.company].filter(Boolean).join(", ")}</span>
        </span>
      </figcaption>
    </figure>
  );
}
