import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getClients, getTestimonials } from "@/lib/queries";
import { LecturerPhoto } from "@/components/lecturer-photo";
import { TestimonialCard } from "@/components/testimonial-card";
import { ClientWall } from "@/components/client-wall";
import { paragraphs } from "@/lib/format";
import { IconCheck, IconLinkedIn, IconMail, IconPhone } from "@/components/icons";

export const metadata: Metadata = { title: "O lektorovi" };

export default async function AboutPage() {
  const [s, testimonials, clients] = await Promise.all([getSettings(), getTestimonials({ featured: true }), getClients(true)]);
  return (
    <>
      <section className="container-x grid items-start gap-14 py-14 sm:py-20 lg:grid-cols-[22rem_1fr]">
        <div className="lg:sticky lg:top-24">
          <LecturerPhoto url={s.photoUrl} name={s.lecturerName} />
          <div className="card mt-6 space-y-3 p-5 text-sm">
            <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-slate-700 hover:text-ink-950"><IconMail width={16} height={16} /> {s.email}</a>
            <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-700 hover:text-ink-950"><IconPhone width={16} height={16} /> {s.phone}</a>
            {s.linkedinUrl && (
              <a href={s.linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-slate-700 hover:text-ink-950"><IconLinkedIn width={16} height={16} /> LinkedIn</a>
            )}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">O lektorovi</p>
          <h1 className="text-4xl font-extrabold sm:text-5xl">{s.lecturerName}</h1>
          <p className="mt-3 text-xl text-slate-600">{s.lecturerTitle}</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [s.statParticipants, "účastníků"],
              [s.statCourses, "kurzů"],
              [s.statDays, "školicích dní"],
              [s.statSince, "lektoruji od"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
                <p className="font-display text-2xl font-extrabold text-ink-950">{n}</p>
                <p className="text-xs text-slate-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="prose-lite mt-10 text-lg">
            {paragraphs(s.bio).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["Praxe místo teorie", "Učím na reálných úlohách, ideálně na datech a šablonách vaší firmy."],
              ["Na míru úrovni týmu", "Před školením si ujasníme, kdo přijde a co potřebuje. Nikdo se nenudí, nikdo se neztratí."],
              ["Excel + AI", "Propojuji hluboké znalosti Excelu s tím, co dnes zvládne Microsoft 365 Copilot."],
              ["Podpora i po kurzu", "Materiály, vzorové soubory a možnost se doptat i týdny po školení."],
            ].map(([t, d]) => (
              <div key={t} className="card flex gap-4 p-5">
                <IconCheck width={22} height={22} className="mt-0.5 shrink-0 text-excel-600" />
                <div>
                  <p className="font-semibold text-ink-950">{t}</p>
                  <p className="mt-1 text-sm text-slate-600">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/poptavka" className="btn-primary">Poptat školení</Link>
            <Link href="/kalendar" className="btn-ghost">Volné termíny</Link>
          </div>
        </div>
      </section>
      {(clients.length > 0 || testimonials.length > 0) && (
        <section className="bg-slate-50/70 py-16">
          <div className="container-x">
            <h2 className="mb-8 text-3xl font-bold">Co o mně říkají klienti</h2>
            {clients.length > 0 && <ClientWall clients={clients} />}
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => <TestimonialCard key={t.id} t={t} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
