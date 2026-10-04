export const LEVELS: Record<string, string> = {
  zacatecnik: "Začátečník",
  "mirne-pokrocily": "Mírně pokročilý",
  pokrocily: "Pokročilý",
  expert: "Expert",
  vsichni: "Pro všechny",
};

export const ACCENTS: Record<string, { label: string; bg: string; text: string; ring: string; dot: string; grad: string }> = {
  excel: { label: "Excel", bg: "bg-excel-50", text: "text-excel-700", ring: "ring-excel-200", dot: "bg-excel-600", grad: "from-excel-600 to-excel-400" },
  m365: { label: "Microsoft 365", bg: "bg-m365-50", text: "text-m365-700", ring: "ring-m365-200", dot: "bg-m365-600", grad: "from-m365-600 to-m365-400" },
  copilot: { label: "Copilot & AI", bg: "bg-copilot-50", text: "text-copilot-700", ring: "ring-copilot-200", dot: "bg-copilot-600", grad: "from-copilot-600 via-fuchsia-500 to-m365-500" },
  powerbi: { label: "Power BI", bg: "bg-amber-50", text: "text-amber-800", ring: "ring-amber-200", dot: "bg-amber-500", grad: "from-amber-500 to-yellow-400" },
  neutral: { label: "Ostatní", bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-200", dot: "bg-slate-500", grad: "from-slate-600 to-slate-400" },
};

export const ORDER_STATUSES: Record<string, { label: string; tone: Tone }> = {
  new: { label: "Nová", tone: "blue" },
  confirmed: { label: "Potvrzená", tone: "green" },
  invoiced: { label: "Vyfakturovaná", tone: "violet" },
  paid: { label: "Zaplacená", tone: "emerald" },
  cancelled: { label: "Zrušená", tone: "slate" },
};

export const INQUIRY_STATUSES: Record<string, { label: string; tone: Tone }> = {
  new: { label: "Nová", tone: "blue" },
  in_progress: { label: "Řeším", tone: "amber" },
  offer_sent: { label: "Nabídka odeslána", tone: "violet" },
  won: { label: "Realizováno", tone: "green" },
  lost: { label: "Nerealizováno", tone: "rose" },
  archived: { label: "Archiv", tone: "slate" },
};

export const BOOKING_STATUSES: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Nepotvrzeno", tone: "amber" },
  confirmed: { label: "Potvrzeno", tone: "green" },
  done: { label: "Odškoleno", tone: "emerald" },
  cancelled: { label: "Zrušeno", tone: "slate" },
};

export const TERM_STATUSES: Record<string, { label: string; tone: Tone }> = {
  open: { label: "Volná místa", tone: "green" },
  full: { label: "Obsazeno", tone: "amber" },
  cancelled: { label: "Zrušeno", tone: "slate" },
};

export const INQUIRY_KINDS: Record<string, string> = {
  firemni: "Firemní školení na míru",
  individualni: "Individuální výuka",
  konzultace: "Konzultace / řešení konkrétního úkolu",
  jine: "Jiné",
};

export const FORMATS: Record<string, string> = {
  prezencne: "Prezenčně u vás",
  online: "Online (Teams)",
  nevim: "Zatím nevím",
};

export type Tone = "blue" | "green" | "amber" | "violet" | "emerald" | "rose" | "slate";
