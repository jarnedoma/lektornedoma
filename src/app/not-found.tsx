import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-slate-200">404</p>
        <h1 className="mt-4 text-2xl font-bold">Stránka nenalezena</h1>
        <Link href="/" className="btn-primary mt-6">Na úvodní stránku</Link>
      </div>
    </div>
  );
}
