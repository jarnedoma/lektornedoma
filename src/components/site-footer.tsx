import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { IconLinkedIn, IconMail, IconPhone } from "./icons";

export function SiteFooter({ s }: { s: Settings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink-950 text-slate-300">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-xl font-bold text-white">{s.lecturerName}</p>
          <p className="mt-1 text-sm text-slate-400">{s.lecturerTitle}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400">{s.bioShort}</p>
        </div>
        <div className="md:col-span-3">
          <p className="mb-4 text-sm font-semibold text-white">Nabídka</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" href="/kurzy">Katalog kurzů</Link></li>
            <li><Link className="hover:text-white" href="/terminy">Veřejné termíny</Link></li>
            <li><Link className="hover:text-white" href="/videokurzy">Videokurzy</Link></li>
            <li><Link className="hover:text-white" href="/kalendar">Rezervace lektora</Link></li>
            <li><Link className="hover:text-white" href="/reference">Reference</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="mb-4 text-sm font-semibold text-white">Kontakt</p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <IconMail width={16} height={16} /> {s.email}
              </a>
            </li>
            <li>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-white">
                <IconPhone width={16} height={16} /> {s.phone}
              </a>
            </li>
            {s.linkedinUrl && (
              <li>
                <a href={s.linkedinUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-white">
                  <IconLinkedIn width={16} height={16} /> LinkedIn
                </a>
              </li>
            )}
          </ul>
          <Link href="/poptavka" className="btn mt-6 bg-white text-ink-950 hover:bg-slate-100">
            Nezávazně poptat školení
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>
            © {year} {s.lecturerName}
            {s.companyName && ` · ${s.companyName}`}
            {s.companyIco && ` · IČO ${s.companyIco}`}
          </p>
          <p>Microsoft, Excel, Microsoft 365 a Copilot jsou ochranné známky společnosti Microsoft.</p>
        </div>
      </div>
    </footer>
  );
}
