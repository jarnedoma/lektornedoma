import { connection } from "next/server";
import { and, asc, desc, eq, gte, or } from "drizzle-orm";
import { db, schema } from "./db";
import { todayISO } from "./format";

export async function getCategoriesWithCourses() {
  await connection();
  const [cats, courses] = await Promise.all([
    db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder)),
    db
      .select()
      .from(schema.courses)
      .where(eq(schema.courses.isPublished, true))
      .orderBy(asc(schema.courses.sortOrder), asc(schema.courses.title)),
  ]);
  const uncategorized = courses.filter((c) => !c.categoryId || !cats.some((k) => k.id === c.categoryId));
  return {
    categories: cats.map((cat) => ({ ...cat, courses: courses.filter((c) => c.categoryId === cat.id) })),
    uncategorized,
    all: courses,
  };
}

export async function getCourseBySlug(slug: string) {
  await connection();
  const [row] = await db
    .select({ course: schema.courses, category: schema.categories })
    .from(schema.courses)
    .leftJoin(schema.categories, eq(schema.courses.categoryId, schema.categories.id))
    .where(and(eq(schema.courses.slug, slug), eq(schema.courses.isPublished, true)));
  if (!row) return null;
  const terms = await db
    .select()
    .from(schema.terms)
    .where(and(eq(schema.terms.courseId, row.course.id), gte(schema.terms.startDate, todayISO())))
    .orderBy(asc(schema.terms.startDate));
  return { ...row, terms: terms.filter((t) => t.status !== "cancelled") };
}

export async function getUpcomingTerms(limit?: number) {
  await connection();
  const q = db
    .select({ term: schema.terms, course: schema.courses, category: schema.categories })
    .from(schema.terms)
    .innerJoin(schema.courses, eq(schema.terms.courseId, schema.courses.id))
    .leftJoin(schema.categories, eq(schema.courses.categoryId, schema.categories.id))
    .where(
      and(
        gte(schema.terms.startDate, todayISO()),
        eq(schema.courses.isPublished, true),
        or(eq(schema.terms.status, "open"), eq(schema.terms.status, "full")),
      ),
    )
    .orderBy(asc(schema.terms.startDate));
  return limit ? q.limit(limit) : q;
}

export async function getTermForOrder(id: number) {
  const [row] = await db
    .select({ term: schema.terms, course: schema.courses })
    .from(schema.terms)
    .innerJoin(schema.courses, eq(schema.terms.courseId, schema.courses.id))
    .where(eq(schema.terms.id, id));
  return row ?? null;
}

export async function getFeaturedCourses() {
  await connection();
  return db
    .select({ course: schema.courses, category: schema.categories })
    .from(schema.courses)
    .leftJoin(schema.categories, eq(schema.courses.categoryId, schema.categories.id))
    .where(and(eq(schema.courses.isPublished, true), eq(schema.courses.isFeatured, true)))
    .orderBy(asc(schema.categories.sortOrder), asc(schema.courses.sortOrder));
}

export async function getVideoCourses() {
  await connection();
  return db
    .select()
    .from(schema.videoCourses)
    .where(eq(schema.videoCourses.isPublished, true))
    .orderBy(asc(schema.videoCourses.sortOrder));
}

export async function getVideoCourseBySlug(slug: string) {
  await connection();
  const [row] = await db
    .select()
    .from(schema.videoCourses)
    .where(and(eq(schema.videoCourses.slug, slug), eq(schema.videoCourses.isPublished, true)));
  return row ?? null;
}

export async function getTestimonials(opts: { kind?: "individual" | "company"; featured?: boolean } = {}) {
  await connection();
  const conds = [eq(schema.testimonials.isPublished, true)];
  if (opts.kind) conds.push(eq(schema.testimonials.kind, opts.kind));
  if (opts.featured) conds.push(eq(schema.testimonials.isFeatured, true));
  return db
    .select()
    .from(schema.testimonials)
    .where(and(...conds))
    .orderBy(asc(schema.testimonials.sortOrder), desc(schema.testimonials.createdAt));
}

export async function getClients(featuredOnly = false) {
  await connection();
  const conds = [eq(schema.clients.isPublished, true)];
  if (featuredOnly) conds.push(eq(schema.clients.isFeatured, true));
  return db
    .select()
    .from(schema.clients)
    .where(and(...conds))
    .orderBy(asc(schema.clients.sortOrder), asc(schema.clients.name));
}

export async function getPublishedCourseOptions() {
  return db
    .select({ id: schema.courses.id, title: schema.courses.title, categoryId: schema.courses.categoryId })
    .from(schema.courses)
    .where(eq(schema.courses.isPublished, true))
    .orderBy(asc(schema.courses.categoryId), asc(schema.courses.sortOrder));
}

