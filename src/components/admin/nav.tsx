"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { href: string; label: string; badge?: number };

export function AdminNav({ items, logout }: { items: Item[]; logout: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-display font-bold text-ink-950">Administrace</Link>
        <button onClick={() => setOpen((o) => !o)} className="btn-ghost btn-sm">{open ? "Zavřít" : "Menu"}</button>
      </div>
      <aside className={`${open ? "block" : "hidden"} border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-60 lg:border-b-0 lg:border-r`}>
        <div className="flex h-full flex-col p-4">
          <Link href="/admin" className="mb-6 hidden items-center gap-2 px-2 pt-2 lg:flex">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-950 text-xs font-extrabold text-white">LN</span>
            <span className="font-display font-bold text-ink-950">Administrace</span>
          </Link>
          <nav className="flex flex-col gap-0.5">
            {items.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${isActive(i.href) ? "bg-slate-100 text-ink-950" : "text-slate-600 hover:bg-slate-50 hover:text-ink-950"}`}
              >
                {i.label}
                {!!i.badge && <span className="rounded-full bg-m365-600 px-2 py-0.5 text-[11px] font-bold text-white">{i.badge}</span>}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
            <Link href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">Zobrazit web ↗</Link>
            {logout}
          </div>
        </div>
      </aside>
    </>
  );
}
