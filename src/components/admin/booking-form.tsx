import type { Booking } from "@/lib/schema";
import { BOOKING_STATUSES } from "@/lib/constants";
import { dateTime } from "@/lib/format";
import { saveBooking } from "@/app/admin/actions";
import { Check, F, Panel } from "./ui";
import { SaveButton } from "./client-bits";

type Opt = { id: number; title: string };

export function BookingForm({ booking, courses, defaults }: { booking?: Booking; courses: Opt[]; defaults?: { dateFrom?: string } }) {
  const b = booking;
  return (
    <form action={saveBooking} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {b && <input type="hidden" name="id" value={b.id} />}
      <div className="space-y-6">
        <Panel title="Termín a kurz">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Od"><input type="date" name="dateFrom" required defaultValue={b?.dateFrom ?? defaults?.dateFrom} className="input" /></F>
            <F label="Do" hint="U jednodenního školení nechte stejné nebo prázdné."><input type="date" name="dateTo" defaultValue={b?.dateTo} className="input" /></F>
            <F label="Kurz z nabídky" className="sm:col-span-2">
              <select name="courseId" defaultValue={b?.courseId ?? ""} className="input">
                <option value="">— jiné / na míru —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </F>
            <F label="Název / téma školení" className="sm:col-span-2" hint="Pokud necháte prázdné, použije se název vybraného kurzu.">
              <input name="courseTitle" defaultValue={b?.courseTitle} className="input" />
            </F>
            <F label="Město" hint="Zobrazí se veřejně v kalendáři (bez jména klienta)."><input name="city" defaultValue={b?.city} className="input" placeholder="např. Ostrava" /></F>
            <F label="Adresa / místo konání"><input name="location" defaultValue={b?.location} className="input" placeholder="Firma, ulice" /></F>
            <Check name="isOnline" label="Online" defaultChecked={b?.isOnline} />
            <F label="Počet účastníků"><input name="participants" type="number" min={1} defaultValue={b?.participants ?? ""} className="input" /></F>
          </div>
        </Panel>
        <Panel title="Klient">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Kontaktní osoba"><input name="contactName" required defaultValue={b?.contactName} className="input" /></F>
            <F label="Firma"><input name="company" defaultValue={b?.company} className="input" /></F>
            <F label="E-mail"><input name="email" type="email" defaultValue={b?.email} className="input" /></F>
            <F label="Telefon"><input name="phone" defaultValue={b?.phone} className="input" /></F>
            <F label="Zpráva od klienta" className="sm:col-span-2"><textarea name="message" rows={3} defaultValue={b?.message} className="input" /></F>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Stav a honorář">
          <div className="space-y-4">
            <F label="Stav">
              <select name="status" defaultValue={b?.status ?? "confirmed"} className="input">
                {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </F>
            {b?.confirmedAt && <p className="text-xs text-slate-500">Potvrzeno {dateTime(b.confirmedAt)}</p>}
            <F label="Domluvený honorář (Kč)"><input name="fee" inputMode="numeric" defaultValue={b?.fee ?? ""} className="input" placeholder="např. 14000" /></F>
            <F label="Poznámka k honoráři"><input name="feeNote" defaultValue={b?.feeNote} className="input" placeholder="bez DPH, + cestovné…" /></F>
            <F label="Interní poznámky"><textarea name="adminNote" rows={6} defaultValue={b?.adminNote} className="input" placeholder="Domluva, potvrzení, technika, kontakt na místě…" /></F>
            <SaveButton className="btn-primary w-full">{b ? "Uložit změny" : "Vytvořit rezervaci"}</SaveButton>
          </div>
        </Panel>
        {b && (
          <p className="text-xs text-slate-500">
            Zdroj: {b.source === "web" ? "rezervace z webu" : "vytvořeno v adminu"} · vytvořeno {dateTime(b.createdAt)} · upraveno {dateTime(b.updatedAt)}
          </p>
        )}
      </div>
    </form>
  );
}
