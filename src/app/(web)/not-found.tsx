import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="font-display text-7xl font-extrabold text-slate-200">404</p>
      <h1 className="mt-4 text-3xl font-bold">Stránka nenalezena</h1>
      <p className="mt-3 text-slate-600">Možná byla přesunuta. Zkuste katalog kurzů.</p>
      <Link href="/kurzy" className="btn-primary mt-8">Katalog kurzů</Link>
    </div>
  );
}
