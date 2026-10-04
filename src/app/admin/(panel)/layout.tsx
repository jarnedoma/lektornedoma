import { Suspense } from "react";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { AdminNav } from "@/components/admin/nav";
import { SavedToast } from "@/components/admin/client-bits";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [[orders], [inquiries], [bookings]] = await Promise.all([
    db.select({ n: count() }).from(schema.orders).where(eq(schema.orders.status, "new")),
    db.select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new")),
    db.select({ n: count() }).from(schema.bookings).where(eq(schema.bookings.status, "pending")),
  ]);
  const items = [
    { href: "/admin", label: "Přehled" },
    { href: "/admin/kalendar", label: "Kalendář lektora", badge: bookings.n },
    { href: "/admin/poptavky", label: "Poptávky", badge: inquiries.n },
    { href: "/admin/objednavky", label: "Objednávky", badge: orders.n },
    { href: "/admin/kurzy", label: "Kurzy" },
    { href: "/admin/terminy", label: "Termíny" },
    { href: "/admin/videokurzy", label: "Videokurzy" },
    { href: "/admin/reference", label: "Reference" },
    { href: "/admin/nastaveni", label: "Nastavení webu" },
  ];
  return (
    <>
      <AdminNav
        items={items}
        logout={
          <form action={logout}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50">Odhlásit</button>
          </form>
        }
      />
      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
      <Suspense>
        <SavedToast />
      </Suspense>
    </>
  );
}
