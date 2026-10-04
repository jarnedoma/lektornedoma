"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

/** Krátké potvrzení „Uloženo“ po přesměrování z akce (?ulozeno=1). */
export function SavedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (params.get("ulozeno")) {
      setShow(true);
      const p = new URLSearchParams(params);
      p.delete("ulozeno");
      const qs = p.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      const t = setTimeout(() => setShow(false), 2500);
      return () => clearTimeout(t);
    }
  }, [params, pathname, router]);
  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-ink-950 px-4 py-3 text-sm font-medium text-white shadow-xl">✓ Uloženo</div>
  );
}

export function ConfirmButton({ children, message = "Opravdu smazat? Tuto akci nelze vrátit.", className = "" }: { children: React.ReactNode; message?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className || "btn btn-sm bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function SaveButton({ children = "Uložit", className = "btn-primary" }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "Ukládám…" : children}
    </button>
  );
}

/** Select, který po změně rovnou odešle formulář (rychlá změna stavu v tabulce). */
export function AutoSubmitSelect({ name, defaultValue, options, className = "" }: { name: string; defaultValue: string; options: [string, string][]; className?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className={className || "rounded-lg border-0 bg-white py-1 pl-2 pr-7 text-xs font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-m365-600"}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  );
}

/** Zobrazí pole partnera jen u partnerského termínu. */
export function PartnerToggle({ defaultChecked, children }: { defaultChecked: boolean; children: React.ReactNode }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" name="isPartner" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        Partnerský termín (realizuji u/s partnerem)
      </label>
      <div className={on ? "grid gap-4 rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-200 sm:grid-cols-2" : "hidden"}>{children}</div>
    </div>
  );
}
