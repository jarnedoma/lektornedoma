"use client";

import { startTransition, useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Heslo</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state?.error && <p className="text-sm font-medium text-rose-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending ? "Přihlašuji…" : "Přihlásit"}</button>
    </form>
  );
}
