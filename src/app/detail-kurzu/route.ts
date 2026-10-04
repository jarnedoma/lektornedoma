import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/**
 * Staré adresy kurzů (/detail-kurzu?id=30&nazev=…; /detail-kurzu.php sem přesměruje next.config) trvale přesměruje
 * na nový detail kurzu podle „ID na starém webu“; neznámé ID vede do katalogu.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number((url.searchParams.get("id") ?? "").replace(/\D/g, ""));
  let target = "/kurzy";
  if (Number.isInteger(id) && id > 0) {
    const [c] = await db.select({ slug: schema.courses.slug, isPublished: schema.courses.isPublished }).from(schema.courses).where(eq(schema.courses.legacyId, id));
    if (c?.isPublished) target = `/kurzy/${c.slug}`;
  }
  return Response.redirect(new URL(target, url), 301);
}
