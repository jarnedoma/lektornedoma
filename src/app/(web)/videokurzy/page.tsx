import type { Metadata } from "next";
import Link from "next/link";
import { getVideoCourses } from "@/lib/queries";
import { AccentPill, EmptyState, LevelBadge, PageHero } from "@/components/ui";
import { ACCENTS } from "@/lib/constants";
import { lines, price } from "@/lib/format";
import { IconCheck, IconClock, IconPlay } from "@/components/icons";

export const metadata: Metadata = { title: "Videokurzy", description: "Videokurzy Excel, Microsoft 365 a Copilot – učte se vlastním tempem." };

export default async function VideoCoursesPage() {
  const videos = await getVideoCourses();
  return (
    <>
      <PageHero
        eyebrow="Videokurzy"
        title="Naučte se Excel a Copilot vlastním tempem"
        text="Videokurzy objednáte tady na webu. Po úhradě vám pošlu přístup na vzdělávací portál, kde kurz najdete včetně cvičných souborů."
      />
      <div className="container-x py-14">
        {videos.length === 0 ? (
          <EmptyState>Videokurzy připravuji – brzy tu budou.</EmptyState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => {
              const a = ACCENTS[v.accent] ?? ACCENTS.neutral;
              return (
                <Link key={v.id} href={`/videokurzy/${v.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className={`relative grid aspect-video place-items-center bg-gradient-to-br ${a.grad}`}>
                    {v.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : null}
                    <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white/90 text-ink-950 shadow-lg transition group-hover:scale-110">
                      <IconPlay width={30} height={30} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <AccentPill accent={v.accent} />
                      <LevelBadge level={v.level} />
                    </div>
                    <h2 className="text-xl font-bold">{v.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{v.perex}</p>
                    <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                      {lines(v.highlights).slice(0, 4).map((h) => (
                        <li key={h} className="flex gap-2"><IconCheck width={16} height={16} className={`mt-0.5 shrink-0 ${a.text}`} /> {h}</li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-end justify-between pt-6">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <IconClock width={16} height={16} /> {v.lessonsCount} lekcí{v.durationMinutes ? ` · ${Math.round(v.durationMinutes / 60)} h` : ""}
                      </span>
                      <span className="text-right">
                        {v.priceOld && <span className="block text-xs text-slate-400 line-through">{price(v.priceOld)}</span>}
                        <span className="font-display text-xl font-bold text-ink-950">{price(v.price)}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
