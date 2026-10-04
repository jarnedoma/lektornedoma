"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, requireAdmin, verifyCredentials } from "@/lib/auth";
import { SETTING_DEFAULTS } from "@/lib/settings";
import { addDays, slugify } from "@/lib/format";
import { isWeekend } from "@/lib/calendar";

// ————————————————— pomocníci pro čtení formulářů —————————————————

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const b = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "1";
const n = (fd: FormData, k: string): number | null => {
  const v = s(fd, k).replace(/\s/g, "").replace(",", ".");
  if (v === "") return null;
  const num = Number(v);
  return Number.isFinite(num) ? Math.round(num) : null;
};
const nn = (fd: FormData, k: string, def = 0) => n(fd, k) ?? def;
const date = (fd: FormData, k: string) => {
  const v = s(fd, k);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
};
const id = (fd: FormData) => {
  const v = Number(fd.get("id"));
  return Number.isInteger(v) && v > 0 ? v : null;
};
const oneOf = <T extends string>(v: string, allowed: readonly T[], def: T): T => ((allowed as readonly string[]).includes(v) ? (v as T) : def);

function done(path: string, to?: string): never {
  revalidatePath("/", "layout");
  redirect(`${to ?? path}${(to ?? path).includes("?") ? "&" : "?"}ulozeno=1`);
}

async function uniqueSlug(table: typeof schema.courses | typeof schema.videoCourses, base: string, selfId: number | null) {
  let slug = slugify(base) || "polozka";
  for (let i = 2; ; i++) {
    const [row] = await db.select({ id: table.id }).from(table).where(eq(table.slug, slug));
    if (!row || row.id === selfId) return slug;
    slug = `${slugify(base)}-${i}`;
  }
}

// ————————————————— přihlášení —————————————————

export async function login(_prev: { error: string; email: string } | null, fd: FormData) {
  const email = s(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!(await verifyCredentials(email, password))) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Nesprávný e-mail nebo heslo.", email };
  }
  await createSession(email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/prihlaseni");
}

// ————————————————— kurzy —————————————————

const LEVEL_KEYS = ["zacatecnik", "mirne-pokrocily", "pokrocily", "expert", "vsichni"] as const;

export async function saveCourse(fd: FormData) {
  await requireAdmin();
  const courseId = id(fd);
  const title = s(fd, "title");
  if (!title) throw new Error("Název kurzu je povinný.");
  const values = {
    title,
    slug: await uniqueSlug(schema.courses, s(fd, "slug") || title, courseId),
    subtitle: s(fd, "subtitle"),
    categoryId: n(fd, "categoryId"),
    level: oneOf(s(fd, "level"), LEVEL_KEYS, "vsichni"),
    durationDays: Math.max(1, nn(fd, "durationDays", 1)),
    hoursPerDay: Math.max(1, nn(fd, "hoursPerDay", 6)),
    priceOpen: n(fd, "priceOpen"),
    perex: s(fd, "perex"),
    description: s(fd, "description"),
    syllabus: s(fd, "syllabus"),
    audience: s(fd, "audience"),
    prerequisites: s(fd, "prerequisites"),
    isNew: b(fd, "isNew"),
    isFeatured: b(fd, "isFeatured"),
    isPublished: b(fd, "isPublished"),
    sortOrder: nn(fd, "sortOrder"),
    updatedAt: new Date(),
  };
  if (courseId) {
    await db.update(schema.courses).set(values).where(eq(schema.courses.id, courseId));
    done(`/admin/kurzy/${courseId}`);
  }
  const [row] = await db.insert(schema.courses).values(values).returning({ id: schema.courses.id });
  done(`/admin/kurzy/${row.id}`);
}

export async function deleteCourse(fd: FormData) {
  await requireAdmin();
  const courseId = id(fd);
  if (courseId) {
    await db.delete(schema.terms).where(eq(schema.terms.courseId, courseId));
    await db.delete(schema.courses).where(eq(schema.courses.id, courseId));
  }
  done("/admin/kurzy");
}

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const catId = id(fd);
  const name = s(fd, "name");
  if (!name) throw new Error("Název je povinný.");
  const values = {
    name,
    slug: slugify(s(fd, "slug") || name),
    description: s(fd, "description"),
    accent: oneOf(s(fd, "accent"), ["excel", "m365", "copilot", "powerbi", "neutral"] as const, "neutral"),
    sortOrder: nn(fd, "sortOrder"),
  };
  if (catId) await db.update(schema.categories).set(values).where(eq(schema.categories.id, catId));
  else await db.insert(schema.categories).values(values);
  done("/admin/kurzy/kategorie");
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const catId = id(fd);
  if (catId) await db.delete(schema.categories).where(eq(schema.categories.id, catId));
  done("/admin/kurzy/kategorie");
}

// ————————————————— termíny —————————————————

export async function saveTerm(fd: FormData) {
  await requireAdmin();
  const termId = id(fd);
  const courseId = n(fd, "courseId");
  const startDate = date(fd, "startDate");
  if (!courseId || !startDate) throw new Error("Kurz a datum jsou povinné.");
  const [course] = await db.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.id, courseId));
  if (!course) throw new Error("Vybraný kurz neexistuje.");
  const endDate = date(fd, "endDate");
  const isPartner = b(fd, "isPartner");
  const values = {
    courseId,
    startDate,
    endDate: endDate && endDate > startDate ? endDate : null,
    timeFrom: s(fd, "timeFrom") || "09:00",
    timeTo: s(fd, "timeTo") || "16:00",
    location: s(fd, "location"),
    isOnline: b(fd, "isOnline"),
    capacity: Math.max(1, nn(fd, "capacity", 10)),
    price: n(fd, "price"),
    isPartner,
    partnerName: isPartner ? s(fd, "partnerName") : "",
    partnerUrl: isPartner ? s(fd, "partnerUrl") : "",
    status: oneOf(s(fd, "status"), ["open", "full", "cancelled"] as const, "open"),
    note: s(fd, "note"),
    updatedAt: new Date(),
  };
  if (termId) await db.update(schema.terms).set(values).where(eq(schema.terms.id, termId));
  else await db.insert(schema.terms).values(values);
  done("/admin/terminy", s(fd, "back") || "/admin/terminy");
}

export async function deleteTerm(fd: FormData) {
  await requireAdmin();
  const termId = id(fd);
  if (termId) await db.delete(schema.terms).where(eq(schema.terms.id, termId));
  done("/admin/terminy", s(fd, "back") || "/admin/terminy");
}

// ————————————————— objednávky & poptávky —————————————————

export async function updateOrder(fd: FormData) {
  await requireAdmin();
  const orderId = id(fd);
  if (!orderId) return;
  const total = n(fd, "total");
  await db
    .update(schema.orders)
    .set({
      status: oneOf(s(fd, "status"), ["new", "confirmed", "invoiced", "paid", "cancelled"] as const, "new"),
      adminNote: s(fd, "adminNote"),
      ...(total != null ? { total } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.orders.id, orderId));
  done(`/admin/objednavky/${orderId}`);
}

export async function setOrderStatus(fd: FormData) {
  await requireAdmin();
  const orderId = id(fd);
  if (!orderId) return;
  await db
    .update(schema.orders)
    .set({ status: oneOf(s(fd, "status"), ["new", "confirmed", "invoiced", "paid", "cancelled"] as const, "new"), updatedAt: new Date() })
    .where(eq(schema.orders.id, orderId));
  done("/admin/objednavky", s(fd, "back") || "/admin/objednavky");
}

export async function deleteOrder(fd: FormData) {
  await requireAdmin();
  const orderId = id(fd);
  if (orderId) await db.delete(schema.orders).where(eq(schema.orders.id, orderId));
  done("/admin/objednavky");
}

const INQ = ["new", "in_progress", "offer_sent", "won", "lost", "archived"] as const;

export async function updateInquiry(fd: FormData) {
  await requireAdmin();
  const inqId = id(fd);
  if (!inqId) return;
  await db
    .update(schema.inquiries)
    .set({ status: oneOf(s(fd, "status"), INQ, "new"), adminNote: s(fd, "adminNote"), updatedAt: new Date() })
    .where(eq(schema.inquiries.id, inqId));
  done(`/admin/poptavky/${inqId}`);
}

export async function deleteInquiry(fd: FormData) {
  await requireAdmin();
  const inqId = id(fd);
  if (inqId) await db.delete(schema.inquiries).where(eq(schema.inquiries.id, inqId));
  done("/admin/poptavky");
}

/** Z poptávky vytvoří nepotvrzenou rezervaci v kalendáři a otevře ji k doplnění. */
export async function inquiryToBooking(fd: FormData) {
  await requireAdmin();
  const inqId = id(fd);
  const day = date(fd, "date");
  if (!inqId || !day) throw new Error("Vyberte datum.");
  const [inq] = await db.select().from(schema.inquiries).where(eq(schema.inquiries.id, inqId));
  if (!inq) return;
  let courseTitle = inq.topic;
  if (inq.courseId) {
    const [c] = await db.select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, inq.courseId));
    courseTitle = c?.title ?? courseTitle;
  }
  const [row] = await db
    .insert(schema.bookings)
    .values({
      dateFrom: day,
      dateTo: day,
      status: "pending",
      courseId: inq.courseId,
      courseTitle: courseTitle || "Školení",
      contactName: inq.name,
      company: inq.company,
      email: inq.email,
      phone: inq.phone,
      location: inq.location,
      isOnline: inq.format === "online",
      participants: inq.participants,
      message: inq.message,
      adminNote: `Vytvořeno z poptávky #${inq.id}`,
      source: "admin",
    })
    .returning({ id: schema.bookings.id });
  await db.update(schema.inquiries).set({ status: "in_progress", updatedAt: new Date() }).where(eq(schema.inquiries.id, inqId));
  done(`/admin/rezervace/${row.id}`);
}

// ————————————————— kalendář & rezervace —————————————————

const BOOKING = ["pending", "confirmed", "done", "cancelled"] as const;

export async function saveBooking(fd: FormData) {
  await requireAdmin();
  const bookingId = id(fd);
  const dateFrom = date(fd, "dateFrom");
  if (!dateFrom) throw new Error("Datum je povinné.");
  let dateTo = date(fd, "dateTo") || dateFrom;
  if (dateTo < dateFrom) dateTo = dateFrom;
  const status = oneOf(s(fd, "status"), BOOKING, "pending");
  const courseId = n(fd, "courseId");
  let courseTitle = s(fd, "courseTitle");
  if (courseId && !courseTitle) {
    const [c] = await db.select({ title: schema.courses.title }).from(schema.courses).where(eq(schema.courses.id, courseId));
    courseTitle = c?.title ?? "";
  }
  let confirmedAt: Date | null = null;
  if (bookingId) {
    const [prev] = await db.select({ status: schema.bookings.status, confirmedAt: schema.bookings.confirmedAt }).from(schema.bookings).where(eq(schema.bookings.id, bookingId));
    confirmedAt = prev?.confirmedAt ?? null;
  }
  if ((status === "confirmed" || status === "done") && !confirmedAt) confirmedAt = new Date();
  if (status === "pending" || status === "cancelled") confirmedAt = null;

  const values = {
    dateFrom,
    dateTo,
    status,
    courseId,
    courseTitle,
    contactName: s(fd, "contactName") || "—",
    company: s(fd, "company"),
    email: s(fd, "email"),
    phone: s(fd, "phone"),
    location: s(fd, "location"),
    isOnline: b(fd, "isOnline"),
    participants: n(fd, "participants"),
    message: s(fd, "message"),
    fee: n(fd, "fee"),
    feeNote: s(fd, "feeNote"),
    adminNote: s(fd, "adminNote"),
    confirmedAt,
    updatedAt: new Date(),
  };
  if (bookingId) {
    await db.update(schema.bookings).set(values).where(eq(schema.bookings.id, bookingId));
    done(`/admin/rezervace/${bookingId}`);
  }
  const [row] = await db.insert(schema.bookings).values({ ...values, source: "admin" }).returning({ id: schema.bookings.id });
  done(`/admin/rezervace/${row.id}`);
}

export async function setBookingStatus(fd: FormData) {
  await requireAdmin();
  const bookingId = id(fd);
  if (!bookingId) return;
  const status = oneOf(s(fd, "status"), BOOKING, "pending");
  await db
    .update(schema.bookings)
    .set({
      status,
      confirmedAt: status === "confirmed" || status === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, bookingId));
  done("/admin/kalendar", s(fd, "back") || "/admin/kalendar");
}

export async function deleteBooking(fd: FormData) {
  await requireAdmin();
  const bookingId = id(fd);
  if (bookingId) await db.delete(schema.bookings).where(eq(schema.bookings.id, bookingId));
  done("/admin/kalendar");
}

/** Ruční označení jednoho dne nebo rozsahu dnů. status "auto" = smazat ruční označení. */
export async function setDayStatus(fd: FormData) {
  await requireAdmin();
  const from = date(fd, "from");
  if (!from) throw new Error("Chybí datum.");
  let to = date(fd, "to") || from;
  if (to < from) to = from;
  if (to > addDays(from, 366)) to = addDays(from, 366);
  const status = oneOf(s(fd, "status"), ["auto", "free", "busy", "pending"] as const, "auto");
  const note = s(fd, "note");
  const skipWeekends = b(fd, "skipWeekends");

  if (status === "auto") {
    await db.delete(schema.calendarDays).where(and(gte(schema.calendarDays.date, from), lte(schema.calendarDays.date, to)));
  } else {
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (skipWeekends && isWeekend(d)) continue;
      await db
        .insert(schema.calendarDays)
        .values({ date: d, status, note, updatedAt: new Date() })
        .onConflictDoUpdate({ target: schema.calendarDays.date, set: { status, note, updatedAt: new Date() } });
    }
  }
  done("/admin/kalendar", s(fd, "back") || `/admin/kalendar?mesic=${from.slice(0, 7)}&den=${from}`);
}

// ————————————————— videokurzy —————————————————

export async function saveVideoCourse(fd: FormData) {
  await requireAdmin();
  const vId = id(fd);
  const title = s(fd, "title");
  if (!title) throw new Error("Název je povinný.");
  const values = {
    title,
    slug: await uniqueSlug(schema.videoCourses, s(fd, "slug") || title, vId),
    perex: s(fd, "perex"),
    description: s(fd, "description"),
    highlights: s(fd, "highlights"),
    level: oneOf(s(fd, "level"), LEVEL_KEYS, "vsichni"),
    accent: oneOf(s(fd, "accent"), ["excel", "m365", "copilot", "powerbi", "neutral"] as const, "excel"),
    lessonsCount: nn(fd, "lessonsCount"),
    durationMinutes: nn(fd, "durationMinutes"),
    price: nn(fd, "price"),
    priceOld: n(fd, "priceOld"),
    portalUrl: s(fd, "portalUrl"),
    imageUrl: s(fd, "imageUrl"),
    isPublished: b(fd, "isPublished"),
    isFeatured: b(fd, "isFeatured"),
    sortOrder: nn(fd, "sortOrder"),
    updatedAt: new Date(),
  };
  if (vId) {
    await db.update(schema.videoCourses).set(values).where(eq(schema.videoCourses.id, vId));
    done(`/admin/videokurzy/${vId}`);
  }
  const [row] = await db.insert(schema.videoCourses).values(values).returning({ id: schema.videoCourses.id });
  done(`/admin/videokurzy/${row.id}`);
}

export async function deleteVideoCourse(fd: FormData) {
  await requireAdmin();
  const vId = id(fd);
  if (vId) await db.delete(schema.videoCourses).where(eq(schema.videoCourses.id, vId));
  done("/admin/videokurzy");
}

// ————————————————— reference & klienti —————————————————

export async function saveTestimonial(fd: FormData) {
  await requireAdmin();
  const tId = id(fd);
  const values = {
    kind: oneOf(s(fd, "kind"), ["individual", "company"] as const, "individual"),
    authorName: s(fd, "authorName") || "Anonym",
    authorRole: s(fd, "authorRole"),
    company: s(fd, "company"),
    courseName: s(fd, "courseName"),
    text: s(fd, "text"),
    rating: Math.min(5, Math.max(0, nn(fd, "rating", 5))),
    date: s(fd, "date"),
    isPublished: b(fd, "isPublished"),
    isFeatured: b(fd, "isFeatured"),
    sortOrder: nn(fd, "sortOrder"),
    updatedAt: new Date(),
  };
  if (!values.text) throw new Error("Text reference je povinný.");
  if (tId) await db.update(schema.testimonials).set(values).where(eq(schema.testimonials.id, tId));
  else await db.insert(schema.testimonials).values(values);
  done("/admin/reference");
}

export async function deleteTestimonial(fd: FormData) {
  await requireAdmin();
  const tId = id(fd);
  if (tId) await db.delete(schema.testimonials).where(eq(schema.testimonials.id, tId));
  done("/admin/reference");
}

/**
 * Hromadný import referencí – jeden záznam na řádek, sloupce oddělené středníkem nebo tabulátorem:
 * jméno; pozice; firma; kurz; hodnocení (1–5); text
 * Text je poslední sloupec a smí obsahovat středníky.
 */
export async function importTestimonials(fd: FormData) {
  await requireAdmin();
  const kind = oneOf(s(fd, "kind"), ["individual", "company"] as const, "individual");
  const values = s(fd, "data")
    .split(/\r?\n/)
    .map((l) => l.split(/\t|;/).map((c) => c.trim()))
    .filter((c) => c.length >= 6)
    .map(([authorName, authorRole, company, courseName, rating, ...text]) => ({
      kind,
      authorName: authorName || "Anonym",
      authorRole,
      company,
      courseName,
      rating: Math.min(5, Math.max(0, Number(rating) || 5)),
      text: text.join("; ").trim(),
      isPublished: true,
    }))
    .filter((v) => v.text);
  if (values.length) await db.insert(schema.testimonials).values(values);
  done("/admin/reference");
}

export async function saveClient(fd: FormData) {
  await requireAdmin();
  const cId = id(fd);
  const values = {
    name: s(fd, "name"),
    sector: s(fd, "sector"),
    logoUrl: s(fd, "logoUrl"),
    website: s(fd, "website"),
    isFeatured: b(fd, "isFeatured"),
    isPublished: b(fd, "isPublished"),
    sortOrder: nn(fd, "sortOrder"),
  };
  if (!values.name) throw new Error("Název firmy je povinný.");
  if (cId) await db.update(schema.clients).set(values).where(eq(schema.clients.id, cId));
  else await db.insert(schema.clients).values(values);
  done("/admin/reference/firmy");
}

export async function deleteClient(fd: FormData) {
  await requireAdmin();
  const cId = id(fd);
  if (cId) await db.delete(schema.clients).where(eq(schema.clients.id, cId));
  done("/admin/reference/firmy");
}

/** Hromadné přidání firem: jedna na řádek, volitelně „název; obor; logo URL“. */
export async function importClients(fd: FormData) {
  await requireAdmin();
  const values = s(fd, "data")
    .split(/\r?\n/)
    .map((l) => l.split(/\t|;/).map((c) => c.trim()))
    .filter((c) => c[0])
    .map(([name, sector = "", logoUrl = ""]) => ({ name, sector, logoUrl, isPublished: true }));
  if (values.length) await db.insert(schema.clients).values(values);
  done("/admin/reference/firmy");
}

// ————————————————— nastavení —————————————————

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  for (const key of Object.keys(SETTING_DEFAULTS)) {
    if (!fd.has(key) && key !== "bookingWeekends") continue;
    const value = key === "bookingWeekends" ? (b(fd, key) ? "1" : "0") : String(fd.get(key) ?? "").trim();
    await db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value } });
  }
  done("/admin/nastaveni");
}
