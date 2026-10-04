import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL ?? "https://www.lektornedoma.cz";
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/objednavka"] }], sitemap: `${site}/sitemap.xml` };
}
