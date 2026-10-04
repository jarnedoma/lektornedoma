import { db, schema } from "./db";

export const SETTING_DEFAULTS = {
  lecturerName: "Jaroslav Nedoma",
  lecturerTitle: "Lektor Microsoft Excel, Microsoft 365 a Copilot",
  heroHeadline: "Naučím váš tým pracovat s Excelem, Microsoft 365 a Copilotem tak, aby to šetřilo hodiny každý týden.",
  heroText:
    "Školím od roku 2009 – pro nadnárodní korporace, státní správu i malé firmy. Prakticky, na vašich datech a bez zbytečné teorie.",
  bioShort:
    "Lektor aplikací Microsoft Office se zaměřením na Excel a zakladatel vzdělávací společnosti Educio s.r.o. Školím od roku 2009 a mám za sebou tisíce odučených hodin napříč obory i úrovněmi účastníků.",
  bio:
    "Jmenuji se Jaroslav Nedoma a lektoruji aplikace Microsoft Office od roku 2009 – začínal jsem ještě na Office 2003. Od té doby jsem odučil tisíce hodin pro firmy všech velikostí, od nadnárodních korporací přes státní správu až po malé rodinné firmy.\n\nV roce 2015 jsem založil vzdělávací společnost Educio s.r.o., která se zaměřuje na IT konzultace a školení. Mým hlavním tématem je Microsoft Excel – od základů přes funkce, kontingenční tabulky a grafy až po Power Query, Power Pivot a makra.\n\nDnes se stále víc věnuji celému ekosystému Microsoft 365 – Teams, SharePoint, OneDrive, Outlook – a především Microsoft Copilotu. Pomáhám týmům pochopit, kde jim umělá inteligence skutečně ušetří čas a jak ji používat bezpečně.\n\nKaždé školení stavím na praxi: pracujeme na reálných úlohách, ideálně na vašich datech, a účastníci odcházejí s postupy, které hned druhý den použijí.",
  photoUrl: "",
  email: "skoleni@lektornedoma.cz",
  phone: "+420 724 782 336",
  companyName: "Educio s.r.o.",
  companyIco: "",
  companyAddress: "",
  linkedinUrl: "",
  statParticipants: "10 487",
  statCourses: "1 096",
  statDays: "1 310",
  statSince: "2009",
  priceCompanyDay: "Firemní školení (6 hodin) od 10 000 do 15 000 Kč za den bez ohledu na počet účastníků.",
  videoPortalUrl: "",
  videoPortalName: "vzdělávací portál",
  bookingIntro:
    "Vyberte volný den, kurz a místo konání. Termín pro vás předběžně zablokuji a do 24 hodin se ozvu s potvrzením.",
  bookingTravelNote:
    "U každého obsazeného dne vidíte město, kde zrovna školím. Při výběru termínu prosím zohledněte, kde jsem den předem – kvůli cestování. Při delším přejezdu se k honoráři připočítává cestovné.",
  bookingWeekends: "0",
} satisfies Record<string, string>;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(schema.settings);
  const out = { ...SETTING_DEFAULTS } as Settings;
  for (const r of rows) {
    if (r.key in out) out[r.key as SettingKey] = r.value;
  }
  return out;
}
