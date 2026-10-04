import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";
import { connection } from "next/server";

export default async function WebLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const s = await getSettings();
  return (
    <>
      <SiteHeader name={s.lecturerName} />
      <main>{children}</main>
      <SiteFooter s={s} />
    </>
  );
}
