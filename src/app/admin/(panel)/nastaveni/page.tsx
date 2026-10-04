import { getSettings, type SettingKey } from "@/lib/settings";
import { AdminHeader, Check, F, Panel } from "@/components/admin/ui";
import { SaveButton } from "@/components/admin/client-bits";
import { saveSettings } from "../../actions";

export const metadata = { title: "Nastavení webu" };

type Field = { key: SettingKey; label: string; rows?: number; hint?: string; full?: boolean };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Lektor",
    fields: [
      { key: "lecturerName", label: "Jméno" },
      { key: "lecturerTitle", label: "Titulek pod jménem" },
      { key: "photoUrl", label: "Fotografie (URL)", hint: "Např. /foto-lektor.jpg (soubor do složky public) nebo https://…", full: true },
      { key: "bioShort", label: "Krátké bio (patička)", rows: 3, full: true },
      { key: "bio", label: "Text „O lektorovi“", rows: 12, hint: "Odstavce oddělte prázdným řádkem.", full: true },
    ],
  },
  {
    title: "Úvodní stránka",
    fields: [
      { key: "heroHeadline", label: "Hlavní nadpis", rows: 2, full: true },
      { key: "heroText", label: "Text pod nadpisem", rows: 3, full: true },
      { key: "statParticipants", label: "Počet účastníků" },
      { key: "statCourses", label: "Počet kurzů" },
      { key: "statDays", label: "Počet školicích dní" },
      { key: "statSince", label: "Lektoruji od roku" },
      { key: "priceCompanyDay", label: "Text o ceně firemního školení", rows: 2, full: true },
    ],
  },
  {
    title: "Kontakty a firma",
    fields: [
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefon" },
      { key: "companyName", label: "Firma" },
      { key: "companyIco", label: "IČO" },
      { key: "companyAddress", label: "Sídlo", full: true },
      { key: "linkedinUrl", label: "LinkedIn (URL)", full: true },
    ],
  },
  {
    title: "Kalendář a videokurzy",
    fields: [
      { key: "bookingIntro", label: "Úvodní text kalendáře", rows: 3, full: true },
      { key: "videoPortalName", label: "Název vzdělávacího portálu" },
      { key: "videoPortalUrl", label: "Adresa portálu (URL)" },
    ],
  },
];

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <>
      <AdminHeader title="Nastavení webu" subtitle="Texty, kontakty a čísla zobrazovaná na webu." />
      <form action={saveSettings} className="space-y-6">
        {GROUPS.map((g) => (
          <Panel key={g.title} title={g.title}>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.fields.map((f) => (
                <F key={f.key} label={f.label} hint={f.hint} className={f.full ? "sm:col-span-2" : ""}>
                  {f.rows ? (
                    <textarea name={f.key} rows={f.rows} defaultValue={s[f.key]} className="input" />
                  ) : (
                    <input name={f.key} defaultValue={s[f.key]} className="input" />
                  )}
                </F>
              ))}
              {g.title.startsWith("Kalendář") && (
                <div className="sm:col-span-2">
                  <Check name="bookingWeekends" label="Víkendy jsou ve výchozím stavu volné (jinak je musíte ručně označit jako volno)" defaultChecked={s.bookingWeekends === "1"} />
                </div>
              )}
            </div>
          </Panel>
        ))}
        <div className="sticky bottom-4 flex justify-end">
          <SaveButton className="btn-primary shadow-lg">Uložit nastavení</SaveButton>
        </div>
      </form>
    </>
  );
}
