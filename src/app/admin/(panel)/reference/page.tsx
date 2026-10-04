import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Check, F, FilterTabs, Panel } from "@/components/admin/ui";
import { ConfirmButton, SaveButton } from "@/components/admin/client-bits";
import { Badge, Stars } from "@/components/ui";
import type { Testimonial } from "@/lib/schema";
import { deleteTestimonial, importTestimonials, saveTestimonial } from "../../actions";

export const metadata = { title: "Reference" };

function TestimonialForm({ t }: { t?: Testimonial }) {
  return (
    <form action={saveTestimonial} className="grid gap-4 sm:grid-cols-2">
      {t && <input type="hidden" name="id" value={t.id} />}
      <F label="Typ">
        <select name="kind" defaultValue={t?.kind ?? "individual"} className="input">
          <option value="individual">Jednotlivec (účastník)</option>
          <option value="company">Firma</option>
        </select>
      </F>
      <F label="Hodnocení (0–5)"><input name="rating" type="number" min={0} max={5} defaultValue={t?.rating ?? 5} className="input" /></F>
      <F label="Jméno"><input name="authorName" required defaultValue={t?.authorName} className="input" /></F>
      <F label="Pozice"><input name="authorRole" defaultValue={t?.authorRole} className="input" /></F>
      <F label="Firma"><input name="company" defaultValue={t?.company} className="input" /></F>
      <F label="Kurz"><input name="courseName" defaultValue={t?.courseName} className="input" /></F>
      <F label="Text reference" className="sm:col-span-2"><textarea name="text" rows={4} required defaultValue={t?.text} className="input" /></F>
      <F label="Datum / rok"><input name="date" defaultValue={t?.date} className="input" placeholder="např. 2025" /></F>
      <F label="Pořadí"><input name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} className="input" /></F>
      <div className="flex flex-wrap gap-5 sm:col-span-2">
        <Check name="isPublished" label="Zveřejněno" defaultChecked={t?.isPublished ?? true} />
        <Check name="isFeatured" label="Doporučená (úvodní stránka)" defaultChecked={t?.isFeatured} />
      </div>
      <div className="sm:col-span-2"><SaveButton>{t ? "Uložit" : "Přidat referenci"}</SaveButton></div>
    </form>
  );
}

export default async function ReferencesAdmin({ searchParams }: { searchParams: Promise<{ typ?: string; upravit?: string }> }) {
  const { typ, upravit } = await searchParams;
  const kind = typ === "company" || typ === "individual" ? typ : undefined;
  const rows = await db
    .select()
    .from(schema.testimonials)
    .where(kind ? eq(schema.testimonials.kind, kind) : undefined)
    .orderBy(asc(schema.testimonials.sortOrder), desc(schema.testimonials.createdAt));
  const editing = upravit ? rows.find((r) => r.id === Number(upravit)) : undefined;

  return (
    <>
      <AdminHeader title="Reference" subtitle={`${rows.length} referencí`} actions={<Link href="/admin/reference/firmy" className="btn-ghost btn-sm">Loga / seznam firem →</Link>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <div>
          <FilterTabs base="/admin/reference" param="typ" current={kind} tabs={[[undefined, "Vše"], ["individual", "Jednotlivci"], ["company", "Firmy"]]} />
          <div className="space-y-3">
            {rows.map((t) => (
              <div key={t.id} className={`card p-5 ${editing?.id === t.id ? "ring-2 ring-m365-500" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-950">{t.authorName} <span className="font-normal text-slate-500">{[t.authorRole, t.company].filter(Boolean).join(", ")}</span></p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone={t.kind === "company" ? "blue" : "violet"}>{t.kind === "company" ? "Firma" : "Jednotlivec"}</Badge>
                      {!t.isPublished && <Badge>Skryto</Badge>}
                      {t.isFeatured && <Badge tone="green">Doporučená</Badge>}
                      {t.rating > 0 && <Stars value={t.rating} />}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/reference?${kind ? `typ=${kind}&` : ""}upravit=${t.id}`} className="btn-ghost btn-sm">Upravit</Link>
                    <form action={deleteTestimonial}>
                      <input type="hidden" name="id" value={t.id} />
                      <ConfirmButton>Smazat</ConfirmButton>
                    </form>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Panel title={editing ? "Upravit referenci" : "Nová reference"} actions={editing && <Link href="/admin/reference" className="text-xs text-slate-500">Zrušit</Link>}>
            <TestimonialForm key={editing?.id ?? "new"} t={editing} />
          </Panel>
          <Panel title="Hromadný import">
            <form action={importTestimonials} className="space-y-3">
              <p className="text-xs text-slate-500">
                Vložte řádky z Excelu nebo CSV. Sloupce oddělené tabulátorem nebo středníkem v pořadí:
                <br />
                <code className="text-[11px]">jméno; pozice; firma; kurz; hodnocení; text</code>
              </p>
              <select name="kind" className="input">
                <option value="individual">Jednotlivci</option>
                <option value="company">Firmy</option>
              </select>
              <textarea name="data" rows={6} className="input font-mono text-xs" placeholder={"Jan Novák; controller; Firma a.s.; Kontingenční tabulky; 5; Skvělý kurz…"} />
              <SaveButton className="btn-ghost btn-sm w-full">Importovat</SaveButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
