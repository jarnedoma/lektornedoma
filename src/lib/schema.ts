import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

/** Tematické oblasti kurzů (Excel, Microsoft 365, Copilot & AI, …). */
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  /** Barevný akcent: excel | m365 | copilot | powerbi | neutral */
  accent: text("accent").notNull().default("neutral"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const courses = sqliteTable(
  "courses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull().default(""),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    /** zacatecnik | mirne-pokrocily | pokrocily | expert | vsichni */
    level: text("level").notNull().default("vsichni"),
    durationDays: integer("duration_days").notNull().default(1),
    hoursPerDay: integer("hours_per_day").notNull().default(6),
    /** Cena za osobu na veřejném termínu (Kč bez DPH) */
    priceOpen: integer("price_open"),
    perex: text("perex").notNull().default(""),
    description: text("description").notNull().default(""),
    /** Osnova – jeden bod na řádek */
    syllabus: text("syllabus").notNull().default(""),
    audience: text("audience").notNull().default(""),
    prerequisites: text("prerequisites").notNull().default(""),
    isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("courses_category_idx").on(t.categoryId)],
);

/** Konkrétní termín kurzu – vlastní nebo partnerský. */
export const terms = sqliteTable(
  "terms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    startDate: text("start_date").notNull(), // YYYY-MM-DD
    endDate: text("end_date"), // YYYY-MM-DD, u vícedenních
    timeFrom: text("time_from").notNull().default("09:00"),
    timeTo: text("time_to").notNull().default("16:00"),
    location: text("location").notNull().default("Praha"),
    isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
    capacity: integer("capacity").notNull().default(10),
    /** Přepíše cenu kurzu, pokud je vyplněno */
    price: integer("price"),
    isPartner: integer("is_partner", { mode: "boolean" }).notNull().default(false),
    partnerName: text("partner_name").notNull().default(""),
    /** Registrace probíhá u partnera – odkaz na jeho stránku */
    partnerUrl: text("partner_url").notNull().default(""),
    /** open | full | cancelled */
    status: text("status").notNull().default("open"),
    note: text("note").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("terms_course_idx").on(t.courseId), index("terms_date_idx").on(t.startDate)],
);

export const videoCourses = sqliteTable("video_courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  perex: text("perex").notNull().default(""),
  description: text("description").notNull().default(""),
  /** Co se naučíte – jeden bod na řádek */
  highlights: text("highlights").notNull().default(""),
  level: text("level").notNull().default("vsichni"),
  accent: text("accent").notNull().default("excel"),
  lessonsCount: integer("lessons_count").notNull().default(0),
  durationMinutes: integer("duration_minutes").notNull().default(0),
  price: integer("price").notNull().default(0),
  priceOld: integer("price_old"),
  /** Odkaz na externí vzdělávací portál, kde kurz běží */
  portalUrl: text("portal_url").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** Objednávky – přihlášky na termín nebo nákup videokurzu. */
export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** term | video */
    kind: text("kind").notNull(),
    termId: integer("term_id").references(() => terms.id, { onDelete: "set null" }),
    videoCourseId: integer("video_course_id").references(() => videoCourses.id, { onDelete: "set null" }),
    /** Snapshot názvu a data, aby objednávka dávala smysl i po smazání kurzu */
    itemTitle: text("item_title").notNull(),
    itemDetail: text("item_detail").notNull().default(""),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    company: text("company").notNull().default(""),
    ico: text("ico").notNull().default(""),
    dic: text("dic").notNull().default(""),
    address: text("address").notNull().default(""),
    participants: integer("participants").notNull().default(1),
    participantNames: text("participant_names").notNull().default(""),
    unitPrice: integer("unit_price").notNull().default(0),
    total: integer("total").notNull().default(0),
    message: text("message").notNull().default(""),
    /** new | confirmed | invoiced | paid | cancelled */
    status: text("status").notNull().default("new"),
    adminNote: text("admin_note").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("orders_status_idx").on(t.status)],
);

/** Poptávky firemních / individuálních školení. */
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    company: text("company").notNull().default(""),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
    topic: text("topic").notNull().default(""),
    /** firemni | individualni | konzultace | jine */
    kind: text("kind").notNull().default("firemni"),
    /** prezencne | online | nevim */
    format: text("format").notNull().default("nevim"),
    participants: integer("participants"),
    level: text("level").notNull().default(""),
    preferredDate: text("preferred_date").notNull().default(""),
    location: text("location").notNull().default(""),
    message: text("message").notNull().default(""),
    /** new | in_progress | offer_sent | won | lost | archived */
    status: text("status").notNull().default("new"),
    adminNote: text("admin_note").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("inquiries_status_idx").on(t.status)],
);

/** Reference – hodnocení jednotlivců i firem. */
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** individual | company */
  kind: text("kind").notNull().default("individual"),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull().default(""),
  company: text("company").notNull().default(""),
  courseName: text("course_name").notNull().default(""),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  date: text("date").notNull().default(""),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** Firmy, pro které lektor školil (logo / jméno na webu). */
export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sector: text("sector").notNull().default(""),
  logoUrl: text("logo_url").notNull().default(""),
  website: text("website").notNull().default(""),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Ruční označení dne v kalendáři lektora.
 * free = volno (i o víkendu), busy = obsazeno / nedostupné, pending = zablokováno, čeká na potvrzení.
 * Lze zadat i jen město (status "auto") – např. „jsem v Ostravě“, aniž by se měnila dostupnost.
 */
export const calendarDays = sqliteTable("calendar_days", {
  date: text("date").primaryKey(), // YYYY-MM-DD
  status: text("status").notNull(),
  /** Město, kde lektor ten den je – zobrazuje se veřejně v kalendáři */
  city: text("city").notNull().default(""),
  note: text("note").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Rezervace lektora na konkrétní den/dny (z webového kalendáře nebo ručně z adminu). */
export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dateFrom: text("date_from").notNull(), // YYYY-MM-DD
    dateTo: text("date_to").notNull(), // YYYY-MM-DD
    /** pending | confirmed | cancelled | done */
    status: text("status").notNull().default("pending"),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
    courseTitle: text("course_title").notNull().default(""),
    contactName: text("contact_name").notNull(),
    company: text("company").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    /** Město konání – zobrazuje se veřejně v kalendáři (bez jména klienta) */
    city: text("city").notNull().default(""),
    /** Kde školení proběhne – adresa klienta / online */
    location: text("location").notNull().default(""),
    isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
    participants: integer("participants"),
    message: text("message").notNull().default(""),
    /** Domluvený honorář (Kč bez DPH) */
    fee: integer("fee"),
    feeNote: text("fee_note").notNull().default(""),
    adminNote: text("admin_note").notNull().default(""),
    confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
    /** web | admin */
    source: text("source").notNull().default("web"),
    ...timestamps,
  },
  (t) => [index("bookings_dates_idx").on(t.dateFrom, t.dateTo), index("bookings_status_idx").on(t.status)],
);

/** Jednoduché klíč–hodnota nastavení webu (kontakty, texty o lektorovi, statistiky). */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export type Category = typeof categories.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type VideoCourse = typeof videoCourses.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type CalendarDay = typeof calendarDays.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
