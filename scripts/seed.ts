/**
 * Naplní prázdnou databázi výchozími daty (kategorie, katalog kurzů, ukázkové termíny,
 * videokurzy a ukázkové reference). Spouští se: npm run db:seed
 * Pokud už databáze obsahuje kurzy, seed nic neudělá (použijte --force pro smazání a nové naplnění).
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../src/lib/schema.ts";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/lektornedoma.db",
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});
const db = drizzle(client, { schema });

const force = process.argv.includes("--force");

const existing = await db.select({ id: schema.courses.id }).from(schema.courses).limit(1);
if (existing.length && !force) {
  console.log("Databáze už obsahuje data – seed přeskočen (použijte --force pro přepsání).");
  process.exit(0);
}

if (force) {
  for (const t of [
    schema.orders,
    schema.bookings,
    schema.calendarDays,
    schema.terms,
    schema.inquiries,
    schema.courses,
    schema.categories,
    schema.videoCourses,
    schema.testimonials,
    schema.clients,
  ]) {
    await db.delete(t);
  }
}

const cats = await db
  .insert(schema.categories)
  .values([
    {
      slug: "excel",
      name: "Microsoft Excel",
      accent: "excel",
      sortOrder: 1,
      description: "Od prvních vzorců po Power Query, kontingenční tabulky a makra. Moje hlavní specializace.",
    },
    {
      slug: "copilot-ai",
      name: "Copilot & AI",
      accent: "copilot",
      sortOrder: 2,
      description: "Microsoft 365 Copilot v praxi – jak psát zadání, kde AI opravdu šetří čas a jak ji používat bezpečně.",
    },
    {
      slug: "microsoft-365",
      name: "Microsoft 365",
      accent: "m365",
      sortOrder: 3,
      description: "Teams, Outlook, OneDrive, SharePoint, Word, PowerPoint a automatizace. Moderní spolupráce v týmu.",
    },
    {
      slug: "power-bi",
      name: "Power BI & data",
      accent: "powerbi",
      sortOrder: 4,
      description: "Reporting a vizualizace dat pro manažery i analytiky.",
    },
  ])
  .returning();

const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

type C = typeof schema.courses.$inferInsert;
const course = (c: Omit<C, "slug"> & { slug: string }) => c;

const courseRows: C[] = [
  // ——— Excel ———
  course({
    slug: "excel-zaklady",
    title: "Excel – základy",
    subtitle: "Bezpečný start s tabulkami, vzorci a formátováním",
    categoryId: cat.excel,
    level: "zacatecnik",
    durationDays: 1,
    priceOpen: 2900,
    perex: "Pro všechny, kdo s Excelem začínají nebo v něm „jen přežívají“. Naučíte se pracovat rychle a bez chyb.",
    syllabus:
      "Prostředí Excelu a efektivní ovládání\nZadávání a úpravy dat, automatické vyplňování\nFormátování buněk a podmíněné formátování\nZákladní vzorce a funkce SUMA, PRŮMĚR, MIN, MAX\nRelativní a absolutní odkazy\nŘazení a filtrování dat\nPříprava k tisku",
    audience: "Začátečníci a uživatelé, kteří chtějí mít jisté základy.",
    sortOrder: 1,
  }),
  course({
    slug: "excel-mirne-pokrocily",
    title: "Excel – mírně pokročilý",
    subtitle: "Funkce, tabulky a práce s většími daty",
    categoryId: cat.excel,
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 2900,
    perex: "Krok od základů k efektivní každodenní práci: tabulky, logické a vyhledávací funkce, přehledné výstupy.",
    syllabus:
      "Formát tabulky a strukturované odkazy\nFunkce KDYŽ, SUMIFS, COUNTIFS\nXLOOKUP a SVYHLEDAT\nOvěření dat a rozevírací seznamy\nPodmíněné formátování s vzorcem\nÚvod do kontingenčních tabulek",
    sortOrder: 2,
  }),
  course({
    slug: "excel-pro-pokrocile",
    title: "Excel pro pokročilé",
    subtitle: "Pokročilé funkce, analýza a automatizace",
    categoryId: cat.excel,
    level: "pokrocily",
    durationDays: 1,
    priceOpen: 3200,
    isFeatured: true,
    perex: "Pro uživatele, kteří Excel denně používají a chtějí z něj dostat maximum.",
    syllabus:
      "Dynamická pole: FILTER, SORT, UNIQUE, LET\nVnořené a kombinované funkce\nPokročilé kontingenční tabulky a průřezy\nScénáře, hledání řešení, citlivostní analýza\nOchrana a sdílení sešitů\nTipy pro rychlou práci s klávesnicí",
    sortOrder: 3,
  }),
  course({
    slug: "excel-funkce-a-vzorce",
    title: "Excel – funkce a vzorce",
    subtitle: "Jednoduché i složité funkce pochopitelně",
    categoryId: cat.excel,
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 2900,
    perex: "Naučíte se plně využívat důležité funkce MS Excel ve vzorcích a pochopíte, jak je kombinovat.",
    syllabus:
      "Matematické a statistické funkce\nLogické funkce a jejich vnořování\nTextové funkce a čištění dat\nDatum a čas ve vzorcích\nVyhledávací funkce XLOOKUP, INDEX + POZVYHLEDAT\nOšetření chyb ve vzorcích",
    sortOrder: 4,
  }),
  course({
    slug: "excel-kontingencni-tabulky",
    title: "Excel – kontingenční tabulky",
    subtitle: "Přehledné reporty jedním z nejsilnějších nástrojů Excelu",
    categoryId: cat.excel,
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 2900,
    isFeatured: true,
    perex: "Z tisíců řádků přehledný report za pár minut. Kontingenční tabulky a grafy od základu po pokročilé triky.",
    syllabus:
      "Příprava zdrojových dat\nTvorba a úpravy kontingenční tabulky\nSeskupování, výpočtová pole a položky\nPrůřezy a časové osy\nKontingenční grafy\nDashboard z více kontingenčních tabulek",
    sortOrder: 5,
  }),
  course({
    slug: "excel-grafy-a-diagramy",
    title: "Excel – jak na poutavé grafy a diagramy",
    subtitle: "Vizualizace, které čtenáři pochopí na první pohled",
    categoryId: cat.excel,
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 2900,
    perex: "Naučíte se pracovat se všemi nástroji, které Excel pro grafy nabízí, a dělat z nich srozumitelné příběhy.",
    syllabus:
      "Výběr správného typu grafu\nKombinované grafy a vedlejší osa\nMinigrafy a podmíněné formátování jako vizualizace\nDynamické grafy\nŠablony grafů a firemní vzhled",
    sortOrder: 6,
  }),
  course({
    slug: "excel-ziskavani-analyza-prezentace-dat",
    title: "Excel – získávání, analýza a prezentace dat",
    subtitle: "Power Query, datový model a reporting",
    categoryId: cat.excel,
    level: "pokrocily",
    durationDays: 1,
    priceOpen: 3400,
    perex: "Načtěte data z různých zdrojů, automaticky je vyčistěte a připravte z nich report, který se sám aktualizuje.",
    syllabus:
      "Power Query – import ze souborů, složek a databází\nTransformace a čištění dat bez vzorců\nSlučování a připojování dotazů\nDatový model a Power Pivot\nZáklady DAX\nPrezentace výsledků",
    sortOrder: 7,
  }),
  course({
    slug: "excel-v-prikladech",
    title: "Excel v příkladech aneb příklady z praxe",
    subtitle: "Řešíme reálné úlohy z firem",
    categoryId: cat.excel,
    level: "pokrocily",
    durationDays: 1,
    priceOpen: 3200,
    perex: "Žádná suchá teorie – celý den řešíme konkrétní úlohy, se kterými se ve firmách potkávám nejčastěji.",
    sortOrder: 8,
  }),
  course({
    slug: "excel-makra-a-vba",
    title: "Excel – makra a VBA",
    subtitle: "Automatizace opakujících se činností",
    categoryId: cat.excel,
    level: "expert",
    durationDays: 2,
    priceOpen: 6400,
    perex: "Od záznamu makra po vlastní procedury ve VBA. Ušetřete hodiny opakované práce.",
    syllabus:
      "Záznam a úprava maker\nEditor VBA, proměnné a podmínky\nCykly a práce s oblastmi\nFormuláře a ovládací prvky\nOšetření chyb\nBezpečnost maker",
    sortOrder: 9,
  }),
  course({
    slug: "excel-krizem-krazem",
    title: "Excel křížem krážem (od A po Z)",
    subtitle: "Ucelený 10denní program od začátečníka po pokročilého",
    categoryId: cat.excel,
    level: "vsichni",
    durationDays: 10,
    priceOpen: 24900,
    perex: "Komplexní program pro ty, kdo chtějí Excel opravdu ovládat. Probíhá v modulech rozložených do několika týdnů.",
    sortOrder: 10,
  }),
  // ——— Copilot & AI ———
  course({
    slug: "microsoft-365-copilot-prakticky",
    title: "Microsoft 365 Copilot prakticky",
    subtitle: "Umělá inteligence v Outlooku, Teams, Wordu, Excelu i PowerPointu",
    categoryId: cat["copilot-ai"],
    level: "vsichni",
    durationDays: 1,
    priceOpen: 3900,
    isNew: true,
    isFeatured: true,
    perex: "Celodenní praktický workshop: kde vám Copilot ušetří čas, jak psát dobré zadání a na co si dát pozor.",
    syllabus:
      "Co je Microsoft 365 Copilot a jak pracuje s firemními daty\nCopilot Chat vs. Copilot v aplikacích\nOutlook: shrnutí vláken, návrhy odpovědí\nTeams: shrnutí schůzek a úkoly\nWord a PowerPoint: návrhy, úpravy, prezentace z dokumentu\nExcel: analýza dat přirozeným jazykem\nBezpečnost, citlivá data a firemní pravidla",
    audience: "Uživatelé s licencí Microsoft 365 Copilot i ti, kdo se na nasazení teprve chystají.",
    sortOrder: 1,
  }),
  course({
    slug: "copilot-v-excelu",
    title: "Copilot v Excelu – analýza dat s AI",
    subtitle: "Vzorce, přehledy a grafy pomocí přirozeného jazyka",
    categoryId: cat["copilot-ai"],
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 3900,
    isNew: true,
    isFeatured: true,
    perex: "Spojení mé hlavní specializace s AI. Jak nechat Copilota navrhnout vzorce, najít trendy a připravit report – a jak výsledek zkontrolovat.",
    syllabus:
      "Příprava dat pro Copilota\nGenerování a vysvětlení vzorců\nAnalýza a hledání trendů\nKontingenční tabulky a grafy pomocí AI\nPython v Excelu s Copilotem\nOvěřování výsledků a limity AI",
    sortOrder: 2,
  }),
  course({
    slug: "prompting-pro-firemni-praxi",
    title: "Prompting pro firemní praxi",
    subtitle: "Jak psát zadání pro Copilot, aby výsledky dávaly smysl",
    categoryId: cat["copilot-ai"],
    level: "vsichni",
    durationDays: 1,
    priceOpen: 3400,
    isNew: true,
    perex: "Půldenní nebo celodenní workshop o tom, jak s AI komunikovat. Knihovna osvědčených promptů pro vaši práci.",
    sortOrder: 3,
  }),
  course({
    slug: "copilot-pro-manazery",
    title: "Copilot pro manažery a vedoucí týmů",
    subtitle: "Strategie nasazení, adopce a měření přínosu",
    categoryId: cat["copilot-ai"],
    level: "vsichni",
    durationDays: 1,
    isNew: true,
    perex: "Pro vedení firem a IT: jak připravit organizaci na Copilot, nastavit pravidla a dostat tým do každodenního používání.",
    sortOrder: 4,
  }),
  // ——— Microsoft 365 ———
  course({
    slug: "microsoft-365-efektivni-spoluprace",
    title: "Microsoft 365 – efektivní spolupráce v týmu",
    subtitle: "Teams, OneDrive, SharePoint a Planner v jednom celku",
    categoryId: cat["microsoft-365"],
    level: "vsichni",
    durationDays: 1,
    priceOpen: 3200,
    isFeatured: true,
    perex: "Konec posílání příloh e-mailem. Naučte se sdílet, spolupracovat a mít ve verzích dokumentů pořádek.",
    syllabus:
      "Kde ukládat: OneDrive vs. SharePoint vs. Teams\nSdílení a oprávnění\nSpolečná editace a historie verzí\nTýmy a kanály v Teams\nPlanner a To Do pro řízení úkolů\nLoop komponenty",
    sortOrder: 1,
  }),
  course({
    slug: "microsoft-teams-v-praxi",
    title: "Microsoft Teams v praxi",
    subtitle: "Schůzky, chat, kanály a soubory",
    categoryId: cat["microsoft-365"],
    level: "zacatecnik",
    durationDays: 1,
    priceOpen: 2900,
    sortOrder: 2,
  }),
  course({
    slug: "outlook-efektivne",
    title: "Outlook – e-maily a čas pod kontrolou",
    subtitle: "Pravidla, kategorie, kalendář a úkoly",
    categoryId: cat["microsoft-365"],
    level: "vsichni",
    durationDays: 1,
    priceOpen: 2900,
    sortOrder: 3,
  }),
  course({
    slug: "word-profesionalni-dokumenty",
    title: "Word – profesionální dokumenty",
    subtitle: "Styly, šablony, dlouhé dokumenty a hromadná korespondence",
    categoryId: cat["microsoft-365"],
    level: "mirne-pokrocily",
    durationDays: 1,
    priceOpen: 2900,
    sortOrder: 4,
  }),
  course({
    slug: "powerpoint-prezentace-ktere-zaujmou",
    title: "PowerPoint – prezentace, které zaujmou",
    subtitle: "Předlohy, vizuální příběh a práce s daty",
    categoryId: cat["microsoft-365"],
    level: "vsichni",
    durationDays: 1,
    priceOpen: 2900,
    sortOrder: 5,
  }),
  course({
    slug: "power-automate-zaklady",
    title: "Power Automate – automatizace bez programování",
    subtitle: "Toky mezi Outlookem, Teams, SharePointem a Excelem",
    categoryId: cat["microsoft-365"],
    level: "pokrocily",
    durationDays: 1,
    priceOpen: 3400,
    isNew: true,
    sortOrder: 6,
  }),
  // ——— Power BI ———
  course({
    slug: "power-bi-zaklady",
    title: "Power BI – základy reportingu",
    subtitle: "Od dat v Excelu k interaktivnímu dashboardu",
    categoryId: cat["power-bi"],
    level: "mirne-pokrocily",
    durationDays: 2,
    priceOpen: 6400,
    perex: "Načtení dat, datový model, základní DAX a publikace reportu kolegům.",
    sortOrder: 1,
  }),
];

const insertedCourses = await db.insert(schema.courses).values(courseRows).returning();
const cid = Object.fromEntries(insertedCourses.map((c) => [c.slug, c.id]));

// Ukázkové termíny v budoucnu (relativně k dnešku)
const iso = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

await db.insert(schema.terms).values([
  { courseId: cid["excel-kontingencni-tabulky"], startDate: iso(14), location: "Praha – Karlín", capacity: 10 },
  { courseId: cid["microsoft-365-copilot-prakticky"], startDate: iso(21), location: "Online (Microsoft Teams)", isOnline: true, capacity: 15 },
  { courseId: cid["excel-pro-pokrocile"], startDate: iso(28), location: "Brno", capacity: 10 },
  {
    courseId: cid["excel-ziskavani-analyza-prezentace-dat"],
    startDate: iso(35),
    location: "Praha",
    isPartner: true,
    partnerName: "Partnerské školicí centrum",
    partnerUrl: "https://example.com",
    note: "Termín realizovaný u partnera, přihláška probíhá na jeho webu.",
  },
  { courseId: cid["copilot-v-excelu"], startDate: iso(42), location: "Praha – Karlín", capacity: 10 },
  { courseId: cid["microsoft-365-efektivni-spoluprace"], startDate: iso(49), location: "Online (Microsoft Teams)", isOnline: true },
  { courseId: cid["excel-makra-a-vba"], startDate: iso(56), endDate: iso(57), location: "Praha", capacity: 8 },
]);

await db.insert(schema.videoCourses).values([
  {
    slug: "excel-od-zakladu",
    title: "Excel od základů",
    perex: "Kompletní videokurz pro začátečníky – vlastním tempem, kdykoli a kdekoli.",
    highlights: "Ovládání a formátování\nVzorce a základní funkce\nŘazení a filtrování\nTisk a sdílení",
    level: "zacatecnik",
    accent: "excel",
    lessonsCount: 32,
    durationMinutes: 240,
    price: 1490,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "kontingencni-tabulky-video",
    title: "Kontingenční tabulky krok za krokem",
    perex: "Reporty z velkých dat bez složitých vzorců.",
    highlights: "Příprava dat\nSeskupování a výpočty\nPrůřezy a časové osy\nDashboard",
    level: "mirne-pokrocily",
    accent: "excel",
    lessonsCount: 18,
    durationMinutes: 150,
    price: 1290,
    sortOrder: 2,
  },
  {
    slug: "copilot-pro-kazdy-den",
    title: "Copilot pro každý den",
    perex: "Krátké praktické lekce, jak využít Microsoft 365 Copilot v běžné práci.",
    highlights: "Psaní promptů\nOutlook a Teams s AI\nWord a PowerPoint s AI\nExcel s AI",
    level: "vsichni",
    accent: "copilot",
    lessonsCount: 24,
    durationMinutes: 180,
    price: 1690,
    isFeatured: true,
    sortOrder: 3,
  },
]);

await db.insert(schema.testimonials).values([
  {
    kind: "individual",
    authorName: "Ukázková reference",
    authorRole: "účastník kurzu",
    courseName: "Excel – kontingenční tabulky",
    text: "Toto je ukázkový text reference. Skutečné reference od účastníků přidáte nebo naimportujete v administraci v sekci Reference.",
    isFeatured: true,
    sortOrder: 1,
  },
  {
    kind: "individual",
    authorName: "Ukázková reference",
    authorRole: "účastnice kurzu",
    courseName: "Microsoft 365 Copilot prakticky",
    text: "Ukázka hodnocení od účastnice. Text, jméno, pozici i firmu upravíte v administraci.",
    isFeatured: true,
    sortOrder: 2,
  },
  {
    kind: "company",
    authorName: "Ukázková firemní reference",
    authorRole: "HR / vzdělávání",
    company: "Název firmy",
    text: "Ukázka firemní reference – např. vyjádření HR manažera k sérii školení pro zaměstnance.",
    isFeatured: true,
    sortOrder: 3,
  },
]);

// Ukázka kalendáře: jedna potvrzená a jedna nepotvrzená rezervace + ručně obsazený den
await db.insert(schema.bookings).values([
  {
    dateFrom: iso(9),
    dateTo: iso(9),
    status: "confirmed",
    courseId: cid["excel-pro-pokrocile"],
    courseTitle: "Excel pro pokročilé",
    contactName: "Ukázkový klient",
    company: "Ukázková firma s.r.o.",
    location: "Praha – sídlo klienta",
    participants: 8,
    fee: 14000,
    feeNote: "bez DPH, včetně materiálů",
    adminNote: "Ukázková rezervace – můžete smazat.",
    confirmedAt: new Date(),
    source: "admin",
  },
  {
    dateFrom: iso(16),
    dateTo: iso(16),
    status: "pending",
    courseId: cid["microsoft-365-copilot-prakticky"],
    courseTitle: "Microsoft 365 Copilot prakticky",
    contactName: "Ukázková poptávka z kalendáře",
    company: "Firma a.s.",
    email: "klient@example.com",
    location: "Brno",
    participants: 12,
    message: "Ukázková rezervace z webu, čeká na potvrzení.",
  },
]);

await db.insert(schema.calendarDays).values([{ date: iso(11), status: "busy", note: "Dovolená (ukázka)" }]);

console.log(`Hotovo: ${cats.length} kategorií, ${insertedCourses.length} kurzů, ukázkové termíny, videokurzy, reference a rezervace.`);
