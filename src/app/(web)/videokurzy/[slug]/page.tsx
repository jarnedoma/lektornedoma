import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoCourseBySlug } from "@/lib/queries";
import { VideoOrderForm } from "@/components/forms/order-form";
import { AccentPill, LevelBadge } from "@/components/ui";
import { ACCENTS } from "@/lib/constants";
import { lines, paragraphs, price } from "@/lib/format";
import { IconCheck, IconClock, IconPlay } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = await getVideoCourseBySlug((await params).slug);
  return v ? { title: `Videokurz ${v.title}`, description: v.perex } : {};
}

export default async function VideoCourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const v = await getVideoCourseBySlug((await params).slug);
  if (!v) notFound();
  const a = ACCENTS[v.accent] ?? ACCENTS.neutral;
  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-[1fr_26rem]">
      <div className="min-w-0">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/videokurzy" className="hover:text-ink-950">Videokurzy</Link> / {v.title}
        </nav>
        <div className="mb-4 flex flex-wrap gap-2">
          <AccentPill accent={v.accent} />
          <LevelBadge level={v.level} />
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{v.title}</h1>
        <p className="mt-4 text-xl text-slate-600">{v.perex}</p>
        <div className={`relative mt-8 grid aspect-video place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${a.grad}`}>
          {v.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white/90 text-ink-950 shadow-xl">
            <IconPlay width={36} height={36} />
          </span>
        </div>
        {lines(v.highlights).length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">Co se naučíte</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {lines(v.highlights).map((h) => (
                <li key={h} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-slate-700">
                  <IconCheck width={20} height={20} className={`mt-0.5 shrink-0 ${a.text}`} /> {h}
                </li>
              ))}
            </ul>
          </section>
        )}
        {v.description && (
          <div className="prose-lite mt-10">
            {paragraphs(v.description).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              {v.priceOld && <p className="text-sm text-slate-400 line-through">{price(v.priceOld)}</p>}
              <p className="font-display text-3xl font-extrabold text-ink-950">{price(v.price)}</p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <IconClock width={16} height={16} /> {v.lessonsCount} lekcí
            </p>
          </div>
          <p className="mb-5 rounded-xl bg-m365-50 p-3 text-xs leading-relaxed text-m365-800 ring-1 ring-m365-100">
            Kurz běží na externím vzdělávacím portálu. Po úhradě vám e-mailem přijde přístup.
          </p>
          <VideoOrderForm videoCourseId={v.id} />
        </div>
      </aside>
    </div>
  );
}
