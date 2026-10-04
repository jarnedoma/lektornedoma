import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { db, schema } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const site = process.env.SITE_URL ?? "https://www.lektornedoma.cz";
  const [courses, videos] = await Promise.all([
    db.select({ slug: schema.courses.slug, updatedAt: schema.courses.updatedAt }).from(schema.courses).where(eq(schema.courses.isPublished, true)),
    db.select({ slug: schema.videoCourses.slug, updatedAt: schema.videoCourses.updatedAt }).from(schema.videoCourses).where(eq(schema.videoCourses.isPublished, true)),
  ]);
  const pages = ["", "/kurzy", "/terminy", "/videokurzy", "/reference", "/o-lektorovi", "/poptavka", "/kalendar"];
  return [
    ...pages.map((p) => ({ url: `${site}${p}` })),
    ...courses.map((c) => ({ url: `${site}/kurzy/${c.slug}`, lastModified: c.updatedAt })),
    ...videos.map((v) => ({ url: `${site}/videokurzy/${v.slug}`, lastModified: v.updatedAt })),
  ];
}
