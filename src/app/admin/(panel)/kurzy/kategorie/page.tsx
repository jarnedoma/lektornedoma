import { asc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, F, Panel } from "@/components/admin/ui";
import { ConfirmButton, SaveButton } from "@/components/admin/client-bits";
import { ACCENTS } from "@/lib/constants";
import type { Category } from "@/lib/schema";
import { deleteCategory, saveCategory } from "../../../actions";

export const metadata = { title: "Oblasti kurzů" };

function CategoryRow({ c }: { c?: Category }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_10rem_6rem_auto] sm:items-end">
      <form id={`cat-${c?.id ?? "new"}`} action={saveCategory} className="contents">
        {c && <input type="hidden" name="id" value={c.id} />}
        <F label="Název"><input name="name" required defaultValue={c?.name} className="input" /></F>
        <F label="Popis"><input name="description" defaultValue={c?.description} className="input" /></F>
        <F label="Barva">
          <select name="accent" defaultValue={c?.accent ?? "neutral"} className="input">
            {Object.entries(ACCENTS).map(([k, a]) => (
              <option key={k} value={k}>{a.label}</option>
            ))}
          </select>
        </F>
        <F label="Pořadí"><input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input" /></F>
        <div className="flex gap-2">
          <SaveButton className="btn-primary btn-sm">{c ? "Uložit" : "Přidat"}</SaveButton>
        </div>
      </form>
    </div>
  );
}

export default async function CategoriesAdmin() {
  const cats = await db.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder));
  return (
    <>
      <AdminHeader title="Oblasti kurzů" subtitle="Oblasti tvoří strukturu katalogu na webu (Excel, Microsoft 365, Copilot…)." back={{ href: "/admin/kurzy", label: "Kurzy" }} />
      <div className="space-y-4">
        {cats.map((c) => (
          <Panel key={c.id}>
            <CategoryRow c={c} />
            <form action={deleteCategory} className="mt-3">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message="Smazat oblast? Kurzy v ní zůstanou bez zařazení.">Smazat oblast</ConfirmButton>
            </form>
          </Panel>
        ))}
        <Panel title="Nová oblast">
          <CategoryRow />
        </Panel>
      </div>
    </>
  );
}
