import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { AdminHeader, F, Panel, StatusBadge } from "@/components/admin/ui";
import { ConfirmButton, SaveButton } from "@/components/admin/client-bits";
import { FORMATS, INQUIRY_KINDS, INQUIRY_STATUSES } from "@/lib/constants";
import { dateTime } from "@/lib/format";
import { deleteInquiry, inquiryToBooking, updateInquiry } from "../../../actions";

export const metadata = { title: "Poptávka" };

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [row] = Number.isInteger(id)
    ? await db
        .select({ inq: schema.inquiries, courseTitle: schema.courses.title })
        .from(schema.inquiries)
        .leftJoin(schema.courses, eq(schema.inquiries.courseId, schema.courses.id))
        .where(eq(schema.inquiries.id, id))
    : [];
  if (!row) notFound();
  const i = row.inq;
  const details: [string, React.ReactNode][] = [
    ["Typ", INQUIRY_KINDS[i.kind] ?? i.kind],
    ["Kurz", row.courseTitle || "—"],
    ["Téma", i.topic || "—"],
    ["Forma", FORMATS[i.format] ?? i.format],
    ["Počet účastníků", i.participants ?? "—"],
    ["Úroveň", i.level || "—"],
    ["Termín", i.preferredDate || "—"],
    ["Místo", i.location || "—"],
  ];
  return (
    <>
      <AdminHeader
        title={<span className="flex flex-wrap items-center gap-3">{i.company || i.name} <StatusBadge map={INQUIRY_STATUSES} value={i.status} /></span>}
        subtitle={`Poptávka #${i.id} · přijato ${dateTime(i.createdAt)}`}
        back={{ href: "/admin/poptavky", label: "Poptávky" }}
        actions={
          <>
            <a href={`mailto:${i.email}?subject=${encodeURIComponent("Re: poptávka školení")}`} className="btn-ghost btn-sm">Odpovědět e-mailem</a>
            <form action={deleteInquiry}>
              <input type="hidden" name="id" value={i.id} />
              <ConfirmButton>Smazat</ConfirmButton>
            </form>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel title="Kontakt">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">Jméno</dt><dd className="font-medium">{i.name}</dd></div>
              <div><dt className="text-slate-500">Firma</dt><dd className="font-medium">{i.company || "—"}</dd></div>
              <div><dt className="text-slate-500">E-mail</dt><dd><a href={`mailto:${i.email}`} className="font-medium text-m365-700 hover:underline">{i.email}</a></dd></div>
              <div><dt className="text-slate-500">Telefon</dt><dd>{i.phone ? <a href={`tel:${i.phone}`} className="font-medium text-m365-700 hover:underline">{i.phone}</a> : "—"}</dd></div>
            </dl>
          </Panel>
          <Panel title="Požadavek">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {details.map(([k, v]) => (
                <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-ink-950">{v}</dd></div>
              ))}
            </dl>
            {i.message && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="mb-1 font-semibold">Zpráva</p>
                <p className="whitespace-pre-line text-slate-700">{i.message}</p>
              </div>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <form action={updateInquiry}>
            <input type="hidden" name="id" value={i.id} />
            <Panel title="Zpracování">
              <div className="space-y-4">
                <F label="Stav">
                  <select name="status" defaultValue={i.status} className="input">
                    {Object.entries(INQUIRY_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </F>
                <F label="Interní poznámka"><textarea name="adminNote" rows={6} defaultValue={i.adminNote} className="input" placeholder="Co bylo domluveno, nabídnutá cena…" /></F>
                <SaveButton className="btn-primary w-full">Uložit</SaveButton>
              </div>
            </Panel>
          </form>
          <form action={inquiryToBooking}>
            <input type="hidden" name="id" value={i.id} />
            <Panel title="Zablokovat termín v kalendáři">
              <div className="space-y-3">
                <input type="date" name="date" required className="input" />
                <SaveButton className="btn-ghost w-full">Vytvořit rezervaci z poptávky</SaveButton>
                <p className="text-xs text-slate-500">Vytvoří nepotvrzenou rezervaci s údaji klienta, kterou pak doplníte (honorář, poznámky) a potvrdíte.</p>
              </div>
            </Panel>
          </form>
        </div>
      </div>
    </>
  );
}
