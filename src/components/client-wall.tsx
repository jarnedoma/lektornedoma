/* eslint-disable @next/next/no-img-element */
import type { Client } from "@/lib/schema";

export function ClientWall({ clients }: { clients: Client[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {clients.map((c) => (
        <li key={c.id} className="grid h-20 place-items-center rounded-2xl bg-white px-4 text-center ring-1 ring-slate-200" title={c.sector || c.name}>
          {c.logoUrl ? (
            <img src={c.logoUrl} alt={c.name} className="max-h-10 max-w-full object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
          ) : (
            <span className="font-display text-sm font-bold leading-tight text-slate-600">{c.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
