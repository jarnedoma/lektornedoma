import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, FilterTabs, Table } from "@/components/admin/ui";
import { AutoSubmitSelect } from "@/components/admin/client-bits";
import { Badge } from "@/components/ui";
import { ORDER_STATUSES } from "@/lib/constants";
import { dateTime, price } from "@/lib/format";
import { setOrderStatus } from "../../actions";

export const metadata = { title: "Objednávky" };

export default async function OrdersAdmin({ searchParams }: { searchParams: Promise<{ stav?: string }> }) {
  const { stav } = await searchParams;
  const filter = stav && stav in ORDER_STATUSES ? stav : undefined;
  const [rows, counts] = await Promise.all([
    db.select().from(schema.orders).where(filter ? eq(schema.orders.status, filter) : undefined).orderBy(desc(schema.orders.createdAt)),
    db.select({ status: schema.orders.status, n: count() }).from(schema.orders).groupBy(schema.orders.status),
  ]);
  const cnt = Object.fromEntries(counts.map((c) => [c.status, c.n]));
  const back = filter ? `/admin/objednavky?stav=${filter}` : "/admin/objednavky";
  return (
    <>
      <AdminHeader title="Objednávky" subtitle="Přihlášky na veřejné termíny a nákupy videokurzů." />
      <FilterTabs base="/admin/objednavky" current={filter} tabs={[[undefined, "Vše"], ...Object.entries(ORDER_STATUSES).map(([k, v]) => [k, v.label, cnt[k] ?? 0] as [string, string, number])]} />
      <Table head={["#", "Přijato", "Položka", "Zákazník", "Částka", "Stav"]} empty={rows.length === 0}>
        {rows.map((o) => (
          <tr key={o.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 text-slate-400">{o.id}</td>
            <td className="px-4 py-3 whitespace-nowrap text-slate-600">{dateTime(o.createdAt)}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/objednavky/${o.id}`} className="font-semibold text-ink-950 hover:text-m365-700">{o.itemTitle}</Link>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <Badge tone={o.kind === "video" ? "violet" : "blue"}>{o.kind === "video" ? "Videokurz" : "Termín"}</Badge>
                {o.kind === "term" && o.itemDetail}
              </div>
            </td>
            <td className="px-4 py-3">
              {o.company || o.name}
              <div className="text-xs text-slate-500">{o.email}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">{price(o.total)}{o.participants > 1 && <div className="text-xs text-slate-500">{o.participants} os.</div>}</td>
            <td className="px-4 py-3">
              <form action={setOrderStatus}>
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="back" value={back} />
                <AutoSubmitSelect name="status" defaultValue={o.status} options={Object.entries(ORDER_STATUSES).map(([k, v]) => [k, v.label])} />
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
