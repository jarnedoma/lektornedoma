import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, Check, F, Panel } from "@/components/admin/ui";
import { ConfirmButton, SaveButton } from "@/components/admin/client-bits";
import type { Client } from "@/lib/schema";
import { deleteClient, importClients, saveClient } from "../../../actions";

export const metadata = { title: "Firmy – reference" };

function ClientForm({ c }: { c?: Client }) {
  return (
    <form action={saveClient} className="grid gap-3 sm:grid-cols-2">
      {c && <input type="hidden" name="id" value={c.id} />}
      <F label="Název firmy"><input name="name" required defaultValue={c?.name} className="input" /></F>
      <F label="Obor"><input name="sector" defaultValue={c?.sector} className="input" /></F>
      <F label="Logo (URL)" className="sm:col-span-2"><input name="logoUrl" defaultValue={c?.logoUrl} className="input" placeholder="https://… (prázdné = zobrazí se název)" /></F>
      <F label="Web"><input name="website" defaultValue={c?.website} className="input" /></F>
      <F label="Pořadí"><input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input" /></F>
      <div className="flex flex-wrap gap-5 sm:col-span-2">
        <Check name="isPublished" label="Zobrazit na webu" defaultChecked={c?.isPublished ?? true} />
        <Check name="isFeatured" label="Doporučená (stránka O lektorovi)" defaultChecked={c?.isFeatured} />
      </div>
      <div className="sm:col-span-2"><SaveButton className="btn-primary btn-sm">{c ? "Uložit" : "Přidat firmu"}</SaveButton></div>
    </form>
  );
}

export default async function ClientsAdmin({ searchParams }: { searchParams: Promise<{ upravit?: string }> }) {
  const { upravit } = await searchParams;
  const rows = await db.select().from(schema.clients).orderBy(asc(schema.clients.sortOrder), asc(schema.clients.name));
  const editing = upravit ? rows.find((r) => r.id === Number(upravit)) : undefined;
  return (
    <>
      <AdminHeader title="Firmy, pro které jsem školil" subtitle={`${rows.length} firem – zobrazují se jako „zeď“ log na webu.`} back={{ href: "/admin/reference", label: "Reference" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="card divide-y divide-slate-100">
          {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Zatím žádné firmy. Použijte hromadný import vpravo.</p>}
          {rows.map((c) => (
            <div key={c.id} className={`flex items-center justify-between gap-3 px-5 py-3 ${editing?.id === c.id ? "bg-m365-50" : ""}`}>
              <div className="min-w-0">
                <p className={`font-semibold ${c.isPublished ? "text-ink-950" : "text-slate-400 line-through"}`}>{c.name}</p>
                <p className="text-xs text-slate-500">{[c.sector, c.logoUrl ? "logo ✓" : "", c.isFeatured ? "doporučená" : ""].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/admin/reference/firmy?upravit=${c.id}`} className="btn-ghost btn-sm">Upravit</Link>
                <form action={deleteClient}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton>×</ConfirmButton>
                </form>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Panel title={editing ? "Upravit firmu" : "Přidat firmu"} actions={editing && <Link href="/admin/reference/firmy" className="text-xs text-slate-500">Zrušit</Link>}>
            <ClientForm key={editing?.id ?? "new"} c={editing} />
          </Panel>
          <Panel title="Hromadné přidání">
            <form action={importClients} className="space-y-3">
              <p className="text-xs text-slate-500">Jedna firma na řádek. Volitelně: <code>název; obor; URL loga</code></p>
              <textarea name="data" rows={8} className="input font-mono text-xs" />
              <SaveButton className="btn-ghost btn-sm w-full">Přidat vše</SaveButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
