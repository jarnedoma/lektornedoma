const czk = new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 });

export function price(value: number | null | undefined): string {
  if (value == null) return "na dotaz";
  return czk.format(value);
}

const MONTHS_GEN = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
export const MONTHS = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
export const WEEKDAYS_SHORT = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const WEEKDAYS = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];

export function parseISO(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  // Česká časová zóna, aby "dnes" sedělo i na serveru v UTC
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Prague" }).format(new Date());
}

export function addDays(date: string, n: number): string {
  const d = parseISO(date);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export function dateLong(date: string): string {
  const d = parseISO(date);
  return `${d.getUTCDate()}. ${MONTHS_GEN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function dateShort(date: string): string {
  const d = parseISO(date);
  return `${d.getUTCDate()}. ${d.getUTCMonth() + 1}. ${d.getUTCFullYear()}`;
}

export function weekday(date: string): string {
  return WEEKDAYS[parseISO(date).getUTCDay()];
}

export function dateRange(from: string, to?: string | null): string {
  if (!to || to === from) return dateLong(from);
  const a = parseISO(from);
  const b = parseISO(to);
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()}.–${b.getUTCDate()}. ${MONTHS_GEN[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
  }
  return `${dateShort(from)} – ${dateShort(to)}`;
}

export function dateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Prague" }).format(d);
}

export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return `${n} ${one}`;
  if (n >= 2 && n <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

export function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
