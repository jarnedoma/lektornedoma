/* eslint-disable @next/next/no-img-element */
export function LecturerPhoto({ url, name, className = "" }: { url: string; name: string; className?: string }) {
  if (url) {
    return (
      <div className={`overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-300/50 ring-1 ring-slate-200 ${className}`}>
        <img src={url} alt={name} className="aspect-[4/5] w-full object-cover" />
      </div>
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  // Zástupný vizuál, dokud v administraci nenahrajete fotografii
  return (
    <div
      className={`relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 via-copilot-800 to-m365-700 shadow-2xl shadow-slate-400/40 ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <span className="relative font-display text-8xl font-extrabold text-white/90">{initials}</span>
    </div>
  );
}
