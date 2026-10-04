import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "../ui";
import type { Tone } from "@/lib/constants";

export function AdminHeader({ title, subtitle, actions, back }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-block text-sm text-slate-500 hover:text-ink-950">← {back.label}</Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, children, actions, className = "" }: { title?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-display text-base font-bold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusBadge({ map, value }: { map: Record<string, { label: string; tone: Tone }>; value: string }) {
  const m = map[value] ?? { label: value, tone: "slate" as Tone };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function F({ label, children, className = "", hint }: { label: string; children: ReactNode; className?: string; hint?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-sm text-slate-500">Zatím tu nic není.</p>}
    </div>
  );
}

export function FilterTabs({ base, current, tabs, param = "stav" }: { base: string; current?: string; tabs: [string | undefined, string, number?][]; param?: string }) {
  return (
    <div className="mb-5 flex flex-wrap gap-1.5">
      {tabs.map(([key, label, count]) => (
        <Link
          key={label}
          href={key ? `${base}?${param}=${key}` : base}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${current === key ? "bg-ink-950 text-white ring-ink-950" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"}`}
        >
          {label}
          {count != null && <span className="ml-1 opacity-60">{count}</span>}
        </Link>
      ))}
    </div>
  );
}
