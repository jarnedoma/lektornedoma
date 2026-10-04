import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, F, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton, SaveButton } from "@/components/admin/client-bits";
import { ORDER_STATUSES } from "@/lib/constants";
import { dateTime, price } from "@/lib/format";
import { deleteOrder, updateOrder } from "../../../actions";

export const metadata = { title: "Objednávka" };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [o] = Number.isInteger(id) ? await db.select().from(schema.orders).where(eq(schema.orders.id, id)) : [];
  if (!o) notFound();
  let portalUrl = "";
  if (o.videoCourseId) {
    const [v] = await db.select({ portalUrl: schema.videoCourses.portalUrl }).from(schema.videoCourses).where(eq(schema.videoCourses.id, o.videoCourseId));
    portalUrl = v?.portalUrl ?? "";
  }
  const rows: [string, React.ReactNode][] = [
    ["Jméno", o.name],
    ["E-mail", <a key="e" href={`mailto:${o.email}`} className="text-m365-700 hover:underline">{o.email}</a>],
    ["Telefon", o.phone ? <a key="p" href={`tel:${o.phone}`} className="text-m365-700 hover:underline">{o.phone}</a> : "—"],
    ["Firma", o.company || "—"],
    ["IČO / DIČ", [o.ico, o.dic].filter(Boolean).join(" / ") || "—"],
    ["Adresa", o.address || "—"],
  ];
  return (
    <>
      <AdminHeader
        title={<span className="flex flex-wrap items-center gap-3">Objednávka #{o.id} <StatusBadge map={ORDER_STATUSES} value={o.status} /></span>}
        subtitle={`Přijato ${dateTime(o.createdAt)}`}
        back={{ href: "/admin/objednavky", label: "Objednávky" }}
        actions={
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={o.id} />
            <ConfirmButton>Smazat</ConfirmButton>
          </form>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel title={o.kind === "video" ? "Videokurz" : "Kurz"}>
            <p className="font-display text-lg font-bold text-ink-950">{o.itemTitle}</p>
            <p className="text-sm text-slate-600">{o.itemDetail}</p>
            {o.termId && <Link href={`/admin/terminy/${o.termId}`} className="mt-2 inline-block text-sm text-m365-700 hover:underline">Otevřít termín →</Link>}
            {portalUrl && <a href={portalUrl} target="_blank" rel="noopener" className="mt-2 inline-block text-sm text-m365-700 hover:underline">Vzdělávací portál ↗</a>}
            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div><dt className="text-slate-500">Účastníků</dt><dd className="font-semibold">{o.participants}</dd></div>
              <div><dt className="text-slate-500">Cena/os.</dt><dd className="font-semibold">{price(o.unitPrice)}</dd></div>
              <div><dt className="text-slate-500">Celkem</dt><dd className="font-semibold">{price(o.total)}</dd></div>
            </dl>
            {o.participantNames && (
              <div className="mt-4">
                <p className="text-sm font-semibold">Účastníci</p>
                <p className="whitespace-pre-line text-sm text-slate-600">{o.participantNames}</p>
              </div>
            )}
          </Panel>
          <Panel title="Zákazník a fakturace">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-ink-950">{v}</dd></div>
              ))}
            </dl>
            {o.message && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="mb-1 font-semibold">Zpráva</p>
                <p className="whitespace-pre-line text-slate-600">{o.message}</p>
              </div>
            )}
          </Panel>
        </div>
        <form action={updateOrder}>
          <input type="hidden" name="id" value={o.id} />
          <Panel title="Zpracování">
            <div className="space-y-4">
              <F label="Stav">
                <select name="status" defaultValue={o.status} className="input">
                  {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </F>
              <F label="Celková částka (Kč)" hint="Upravte např. po slevě."><input name="total" inputMode="numeric" defaultValue={o.total} className="input" /></F>
              <F label="Interní poznámka"><textarea name="adminNote" rows={6} defaultValue={o.adminNote} className="input" placeholder="Číslo faktury, platba, přístup do portálu…" /></F>
              <SaveButton className="btn-primary w-full">Uložit</SaveButton>
            </div>
          </Panel>
        </form>
      </div>
    </>
  );
}
