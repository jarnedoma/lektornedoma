import type { Category, Course } from "@/lib/schema";
import { ACCENTS, LEVELS } from "@/lib/constants";
import { saveCourse } from "@/app/admin/actions";
import { Check, F, Panel } from "./ui";
import { SaveButton } from "./client-bits";

export function CourseForm({ course, categories }: { course?: Course; categories: Category[] }) {
  const c = course;
  return (
    <form action={saveCourse} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="space-y-6">
        <Panel title="Základní informace">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Název kurzu" className="sm:col-span-2"><input name="title" required defaultValue={c?.title} className="input" /></F>
            <F label="Podtitulek" className="sm:col-span-2"><input name="subtitle" defaultValue={c?.subtitle} className="input" /></F>
            <F label="Perex (krátký úvod)" className="sm:col-span-2"><textarea name="perex" rows={2} defaultValue={c?.perex} className="input" /></F>
            <F label="Popis" className="sm:col-span-2" hint="Odstavce oddělte prázdným řádkem."><textarea name="description" rows={6} defaultValue={c?.description} className="input" /></F>
            <F label="Osnova – co se naučíte" className="sm:col-span-2" hint="Jeden bod na řádek."><textarea name="syllabus" rows={8} defaultValue={c?.syllabus} className="input font-mono text-[13px]" /></F>
            <F label="Pro koho je kurz"><textarea name="audience" rows={3} defaultValue={c?.audience} className="input" /></F>
            <F label="Předpoklady"><textarea name="prerequisites" rows={3} defaultValue={c?.prerequisites} className="input" /></F>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Zařazení a cena">
          <div className="space-y-4">
            <F label="Oblast">
              <select name="categoryId" defaultValue={c?.categoryId ?? categories[0]?.id ?? ""} className="input">
                <option value="">— bez oblasti —</option>
                {categories.map((k) => (
                  <option key={k.id} value={k.id}>{k.name} ({ACCENTS[k.accent]?.label})</option>
                ))}
              </select>
            </F>
            <F label="Úroveň">
              <select name="level" defaultValue={c?.level ?? "vsichni"} className="input">
                {Object.entries(LEVELS).map(([k, l]) => (
                  <option key={k} value={k}>{l}</option>
                ))}
              </select>
            </F>
            <div className="grid grid-cols-2 gap-3">
              <F label="Počet dní"><input name="durationDays" type="number" min={1} defaultValue={c?.durationDays ?? 1} className="input" /></F>
              <F label="Hodin/den"><input name="hoursPerDay" type="number" min={1} defaultValue={c?.hoursPerDay ?? 6} className="input" /></F>
            </div>
            <F label="Cena za osobu – veřejný termín (Kč)" hint="Prázdné = na dotaz"><input name="priceOpen" inputMode="numeric" defaultValue={c?.priceOpen ?? ""} className="input" /></F>
            <F label="URL adresa (slug)" hint="Vyplní se automaticky z názvu."><input name="slug" defaultValue={c?.slug} className="input" /></F>
            <F label="Pořadí v oblasti"><input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input" /></F>
            <F label="ID na starém webu" hint="Číslo z adresy detail-kurzu?id=… – staré odkazy se přesměrují sem."><input name="legacyId" type="number" min={1} defaultValue={c?.legacyId ?? ""} className="input" /></F>
          </div>
        </Panel>
        <Panel title="Zobrazení">
          <div className="space-y-3">
            <Check name="isPublished" label="Zveřejněno na webu" defaultChecked={c?.isPublished ?? true} />
            <Check name="isFeatured" label="Doporučený (na úvodní stránce)" defaultChecked={c?.isFeatured} />
            <Check name="isNew" label="Štítek „Novinka“" defaultChecked={c?.isNew} />
          </div>
        </Panel>
        <SaveButton className="btn-primary w-full">{c ? "Uložit kurz" : "Vytvořit kurz"}</SaveButton>
      </div>
    </form>
  );
}
