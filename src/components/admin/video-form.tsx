import type { VideoCourse } from "@/lib/schema";
import { ACCENTS, LEVELS } from "@/lib/constants";
import { saveVideoCourse } from "@/app/admin/actions";
import { Check, F, Panel } from "./ui";
import { SaveButton } from "./client-bits";

export function VideoForm({ v }: { v?: VideoCourse }) {
  return (
    <form action={saveVideoCourse} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {v && <input type="hidden" name="id" value={v.id} />}
      <Panel title="Obsah">
        <div className="grid gap-4">
          <F label="Název"><input name="title" required defaultValue={v?.title} className="input" /></F>
          <F label="Perex"><textarea name="perex" rows={2} defaultValue={v?.perex} className="input" /></F>
          <F label="Co se naučíte" hint="Jeden bod na řádek."><textarea name="highlights" rows={6} defaultValue={v?.highlights} className="input" /></F>
          <F label="Popis" hint="Odstavce oddělte prázdným řádkem."><textarea name="description" rows={6} defaultValue={v?.description} className="input" /></F>
          <F label="Odkaz na kurz na vzdělávacím portálu" hint="Neveřejné – pro vaši evidenci a odeslání přístupu."><input name="portalUrl" type="url" defaultValue={v?.portalUrl} className="input" placeholder="https://" /></F>
          <F label="Obrázek (URL)"><input name="imageUrl" defaultValue={v?.imageUrl} className="input" placeholder="https://… nebo /obrazky/…" /></F>
        </div>
      </Panel>
      <div className="space-y-6">
        <Panel title="Cena a parametry">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <F label="Cena (Kč)"><input name="price" inputMode="numeric" required defaultValue={v?.price ?? ""} className="input" /></F>
              <F label="Původní cena"><input name="priceOld" inputMode="numeric" defaultValue={v?.priceOld ?? ""} className="input" /></F>
              <F label="Počet lekcí"><input name="lessonsCount" type="number" defaultValue={v?.lessonsCount ?? 0} className="input" /></F>
              <F label="Délka (min)"><input name="durationMinutes" type="number" defaultValue={v?.durationMinutes ?? 0} className="input" /></F>
            </div>
            <F label="Úroveň">
              <select name="level" defaultValue={v?.level ?? "vsichni"} className="input">
                {Object.entries(LEVELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </F>
            <F label="Barva / oblast">
              <select name="accent" defaultValue={v?.accent ?? "excel"} className="input">
                {Object.entries(ACCENTS).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}
              </select>
            </F>
            <F label="URL (slug)"><input name="slug" defaultValue={v?.slug} className="input" /></F>
            <F label="Pořadí"><input name="sortOrder" type="number" defaultValue={v?.sortOrder ?? 0} className="input" /></F>
            <Check name="isPublished" label="Zveřejněno" defaultChecked={v?.isPublished ?? true} />
            <Check name="isFeatured" label="Doporučený" defaultChecked={v?.isFeatured} />
          </div>
        </Panel>
        <SaveButton className="btn-primary w-full">{v ? "Uložit" : "Vytvořit videokurz"}</SaveButton>
      </div>
    </form>
  );
}
