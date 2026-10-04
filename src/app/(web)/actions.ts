"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getTermForOrder } from "@/lib/queries";
import { firstBookableDay, rangeIsFree } from "@/lib/calendar";
import { getSettings } from "@/lib/settings";
import { addDays, dateRange, price, todayISO } from "@/lib/format";
import { formatFields, notifyAdmin } from "@/lib/mail";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const str = (max = 500) => z.string().trim().max(max).default("");
const email = z.email({ error: "Zadejte platný e-mail." }).trim().max(200);
const name = z.string().trim().min(2, { error: "Vyplňte jméno." }).max(200);
const optInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().int().min(1).max(10000).optional(),
);

function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    out[k] ??= issue.message;
  }
  return out;
}

/** Jednoduchá ochrana proti robotům: skryté pole musí zůstat prázdné. */
function isSpam(fd: FormData) {
  return String(fd.get("website") ?? "") !== "";
}

const invalid = (err: z.ZodError): FormState => ({
  ok: false,
  message: "Zkontrolujte prosím zvýrazněná pole.",
  errors: fieldErrors(err),
});

// ————————————————————— Poptávka —————————————————————

const inquirySchema = z.object({
  name,
  email,
  phone: str(50),
  company: str(200),
  courseId: optInt,
  topic: str(300),
  kind: z.enum(["firemni", "individualni", "konzultace", "jine"]).default("firemni"),
  format: z.enum(["prezencne", "online", "nevim"]).default("nevim"),
  participants: optInt,
  level: str(100),
  preferredDate: str(200),
  location: str(200),
  message: z.string().trim().max(5000).default(""),
  consent: z.literal("on", { error: "Pro odeslání je nutný souhlas se zpracováním údajů." }),
});

export async function submitInquiry(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, message: "Děkuji, poptávka byla odeslána." };
  const parsed = inquirySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return invalid(parsed.error);
  const { consent: _c, ...data } = parsed.data;
  if (!data.courseId && !data.topic && !data.message) {
    return { ok: false, message: "Napište prosím, o jaké školení máte zájem.", errors: { message: "Vyberte kurz nebo popište téma." } };
  }

  let courseTitle = "";
  if (data.courseId) {
    const [c] = await db.select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, data.courseId));
    courseTitle = c?.title ?? "";
    if (!c) data.courseId = undefined;
  }

  await db.insert(schema.inquiries).values({ ...data, participants: data.participants ?? null, courseId: data.courseId ?? null });
  await notifyAdmin(
    `Nová poptávka – ${data.company || data.name}`,
    formatFields({
      Jméno: data.name,
      Firma: data.company,
      "E-mail": data.email,
      Telefon: data.phone,
      Kurz: courseTitle,
      Téma: data.topic,
      Účastníků: data.participants,
      Termín: data.preferredDate,
      Místo: data.location,
      Zpráva: data.message,
    }),
  );
  return { ok: true, message: "Děkuji za poptávku! Ozvu se vám obvykle do 24 hodin s návrhem obsahu a ceny." };
}

// ————————————————————— Objednávka termínu —————————————————————

const orderSchema = z.object({
  termId: z.coerce.number().int().positive(),
  name,
  email,
  phone: str(50),
  company: str(200),
  ico: str(20),
  dic: str(20),
  address: str(300),
  participants: z.coerce.number().int().min(1, { error: "Alespoň 1 účastník." }).max(50),
  participantNames: str(2000),
  message: z.string().trim().max(3000).default(""),
  consent: z.literal("on", { error: "Pro odeslání je nutný souhlas s podmínkami." }),
});

export async function submitTermOrder(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, message: "Děkuji, přihláška byla odeslána." };
  const parsed = orderSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return invalid(parsed.error);
  const { consent: _c, termId, ...data } = parsed.data;

  const row = await getTermForOrder(termId);
  if (!row || row.term.status !== "open" || row.term.startDate < todayISO()) {
    return { ok: false, message: "Tento termín už bohužel není možné objednat. Vyberte prosím jiný nebo mi napište." };
  }
  if (row.term.isPartner && row.term.partnerUrl) {
    return { ok: false, message: "Na partnerský termín se přihlašujete na webu partnera." };
  }
  const unit = row.term.price ?? row.course.priceOpen ?? 0;
  const detail = `${dateRange(row.term.startDate, row.term.endDate)}, ${row.term.timeFrom}–${row.term.timeTo}, ${row.term.location}`;

  await db.insert(schema.orders).values({
    kind: "term",
    termId,
    itemTitle: row.course.title,
    itemDetail: detail,
    ...data,
    unitPrice: unit,
    total: unit * data.participants,
  });
  await notifyAdmin(
    `Nová přihláška – ${row.course.title}`,
    formatFields({
      Kurz: row.course.title,
      Termín: detail,
      Jméno: data.name,
      Firma: data.company,
      IČO: data.ico,
      "E-mail": data.email,
      Telefon: data.phone,
      Účastníků: data.participants,
      Celkem: price(unit * data.participants),
      Zpráva: data.message,
    }),
  );
  return {
    ok: true,
    message: "Přihláška je odeslaná. Na e-mail vám pošlu potvrzení a podklady k platbě.",
  };
}

// ————————————————————— Objednávka videokurzu —————————————————————

const videoOrderSchema = z.object({
  videoCourseId: z.coerce.number().int().positive(),
  name,
  email,
  phone: str(50),
  company: str(200),
  ico: str(20),
  dic: str(20),
  address: str(300),
  message: z.string().trim().max(3000).default(""),
  consent: z.literal("on", { error: "Pro odeslání je nutný souhlas s podmínkami." }),
});

export async function submitVideoOrder(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, message: "Děkuji, objednávka byla odeslána." };
  const parsed = videoOrderSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return invalid(parsed.error);
  const { consent: _c, videoCourseId, ...data } = parsed.data;

  const [vc] = await db.select().from(schema.videoCourses).where(eq(schema.videoCourses.id, videoCourseId));
  if (!vc || !vc.isPublished) return { ok: false, message: "Videokurz není dostupný." };

  await db.insert(schema.orders).values({
    kind: "video",
    videoCourseId,
    itemTitle: vc.title,
    itemDetail: "Videokurz – přístup na vzdělávacím portálu",
    ...data,
    participants: 1,
    unitPrice: vc.price,
    total: vc.price,
  });
  await notifyAdmin(
    `Nová objednávka videokurzu – ${vc.title}`,
    formatFields({ Videokurz: vc.title, Cena: price(vc.price), Jméno: data.name, Firma: data.company, "E-mail": data.email, Telefon: data.phone }),
  );
  return {
    ok: true,
    message: "Objednávka je odeslaná. Po úhradě vám přijde e-mailem přístup do videokurzu na vzdělávacím portálu.",
  };
}

// ————————————————————— Rezervace z kalendáře —————————————————————

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Vyberte den v kalendáři." });

const bookingSchema = z.object({
  dateFrom: isoDate,
  days: z.coerce.number().int().min(1).max(10).default(1),
  courseId: optInt,
  courseTitle: str(300),
  contactName: name,
  company: str(200),
  email,
  phone: str(50),
  city: str(100),
  location: str(300),
  isOnline: z.preprocess((v) => v === "on", z.boolean()),
  participants: optInt,
  message: z.string().trim().max(3000).default(""),
  consent: z.literal("on", { error: "Pro odeslání je nutný souhlas se zpracováním údajů." }),
});

export async function submitBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  if (isSpam(fd)) return { ok: true, message: "Děkuji, termín je zablokovaný." };
  const parsed = bookingSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return invalid(parsed.error);
  const { consent: _c, days, ...data } = parsed.data;

  if (!data.isOnline && data.city.length < 2) {
    return { ok: false, message: "Uveďte město, kde školení proběhne.", errors: { city: "Uveďte město konání." } };
  }
  if (data.isOnline && !data.city) data.city = "online";
  if (data.dateFrom < firstBookableDay()) return { ok: false, message: "Termín je možné rezervovat nejpozději den předem. Vyberte prosím pozdější den." };
  const dateTo = addDays(data.dateFrom, days - 1);
  const settings = await getSettings();
  const weekendsOpen = settings.bookingWeekends === "1";
  if (!(await rangeIsFree(data.dateFrom, dateTo, weekendsOpen))) {
    return { ok: false, message: "Vybraný termín už mezitím někdo zablokoval nebo není celý volný. Zvolte prosím jiný den." };
  }

  let courseTitle = data.courseTitle;
  if (data.courseId) {
    const [c] = await db.select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, data.courseId));
    if (c) courseTitle = c.title;
    else data.courseId = undefined;
  }
  if (!courseTitle) return { ok: false, message: "Vyberte kurz nebo napište téma.", errors: { courseId: "Vyberte kurz nebo napište téma." } };

  await db.insert(schema.bookings).values({
    ...data,
    courseId: data.courseId ?? null,
    courseTitle,
    participants: data.participants ?? null,
    dateTo,
    status: "pending",
    source: "web",
  });
  await notifyAdmin(
    `Rezervace termínu ${dateRange(data.dateFrom, dateTo)} – ${data.company || data.contactName}`,
    formatFields({
      Termín: dateRange(data.dateFrom, dateTo),
      Kurz: courseTitle,
      Město: data.city,
      Místo: data.location + (data.isOnline ? " (online)" : ""),
      Kontakt: data.contactName,
      Firma: data.company,
      "E-mail": data.email,
      Telefon: data.phone,
      Účastníků: data.participants,
      Zpráva: data.message,
    }),
  );
  return {
    ok: true,
    message: `Termín ${dateRange(data.dateFrom, dateTo)} je pro vás předběžně zablokovaný. Ozvu se s potvrzením a domluvíme detaily.`,
  };
}
