import type { Term } from "@/lib/schema";
import { TERM_STATUSES } from "@/lib/constants";
import { saveTerm } from "@/app/admin/actions";
import { Check, F, Panel } from "./ui";
import { PartnerToggle, SaveButton } from "./client-bits";

type Opt = { id: number; title: string; priceOpen: number | null };

export function TermForm({ term, courses, courseId, back }: { term?: Term; courses: Opt[]; courseId?: number; back: string }) {
  const t = term;
  return (
    <form action={saveTerm}>
      {t && <input type="hidden" name="id" value={t.id} />}
      <input type="hidden" name="back" value={back} />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <F label="Kurz" className="sm:col-span-2 lg:col-span-4">
            <select name="courseId" required defaultValue={t?.courseId ?? courseId ?? ""} className="input">
              <option value="" disabled>— vyberte kurz —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </F>
          <F label="Datum od"><input type="date" name="startDate" required defaultValue={t?.startDate} className="input" /></F>
          <F label="Datum do" hint="jen u vícedenních"><input type="date" name="endDate" defaultValue={t?.endDate ?? ""} className="input" /></F>
          <F label="Čas od"><input type="time" name="timeFrom" defaultValue={t?.timeFrom ?? "09:00"} className="input" /></F>
          <F label="Čas do"><input type="time" name="timeTo" defaultValue={t?.timeTo ?? "16:00"} className="input" /></F>
          <F label="Místo konání" className="sm:col-span-2"><input name="location" defaultValue={t?.location ?? "Praha"} className="input" /></F>
          <F label="Kapacita"><input type="number" name="capacity" min={1} defaultValue={t?.capacity ?? 10} className="input" /></F>
          <F label="Cena za osobu (Kč)" hint="prázdné = cena kurzu"><input name="price" inputMode="numeric" defaultValue={t?.price ?? ""} className="input" /></F>
          <F label="Stav">
            <select name="status" defaultValue={t?.status ?? "open"} className="input">
              {Object.entries(TERM_STATUSES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </F>
          <div className="flex items-end pb-2.5"><Check name="isOnline" label="Online termín" defaultChecked={t?.isOnline} /></div>
          <F label="Poznámka na webu" className="sm:col-span-2"><input name="note" defaultValue={t?.note} className="input" /></F>
          <div className="sm:col-span-2 lg:col-span-4">
            <PartnerToggle defaultChecked={t?.isPartner ?? false}>
              <F label="Název partnera"><input name="partnerName" defaultValue={t?.partnerName} className="input" placeholder="např. školicí centrum" /></F>
              <F label="Odkaz na přihlášku u partnera" hint="Pokud vyplníte, tlačítko na webu povede k partnerovi."><input name="partnerUrl" type="url" defaultValue={t?.partnerUrl} className="input" placeholder="https://" /></F>
            </PartnerToggle>
          </div>
        </div>
        <div className="mt-6">
          <SaveButton>{t ? "Uložit termín" : "Přidat termín"}</SaveButton>
        </div>
      </Panel>
    </form>
  );
}
