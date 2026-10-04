import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const devHint = process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD_HASH;
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="card w-full max-w-sm p-8">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-950 text-sm font-extrabold text-white">LN</span>
        <h1 className="mt-5 text-2xl font-bold">Přihlášení do administrace</h1>
        <LoginForm />
        {devHint && (
          <p className="mt-6 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
            Vývojový režim bez nastaveného hesla: přihlaste se jako <b>admin</b> / <b>admin</b>. V produkci nastavte ADMIN_EMAIL a ADMIN_PASSWORD_HASH.
          </p>
        )}
      </div>
    </div>
  );
}
