"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconMenu, IconX } from "./icons";

const NAV = [
  { href: "/kurzy", label: "Kurzy" },
  { href: "/terminy", label: "Termíny" },
  { href: "/videokurzy", label: "Videokurzy" },
  { href: "/reference", label: "Reference" },
  { href: "/o-lektorovi", label: "O lektorovi" },
  { href: "/kalendar", label: "Volné termíny lektora" },
];

export function SiteHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const [first, ...rest] = name.split(" ");
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-950 font-display text-sm font-extrabold text-white">
            {first?.[0]}
            {rest.at(-1)?.[0]}
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold text-ink-950">{name}</span>
            <span className="block text-[11px] font-medium text-slate-500">Excel · Microsoft 365 · Copilot</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-slate-100 text-ink-950" : "text-slate-600 hover:text-ink-950"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/poptavka" className="btn-primary hidden sm:inline-flex">
            Poptat školení
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-slate-200 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Zavřít menu" : "Otevřít menu"}
            aria-expanded={open}
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-x flex flex-col py-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-slate-50">
                {n.label}
              </Link>
            ))}
            <Link href="/poptavka" className="btn-primary mt-2">
              Poptat školení
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
