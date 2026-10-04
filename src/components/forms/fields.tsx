"use client";

import { useFormStatus } from "react-dom";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import type { FormState } from "@/app/(web)/actions";
import { IconCheck } from "../icons";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  children,
  ...input
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children?: ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children ?? <input id={name} name={name} required={required} className="input" aria-invalid={!!error} {...input} />}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

/**
 * Jako useActionState, ale formulář se po odeslání nevymaže (React 19 jinak resetuje
 * pole i při chybě validace a uživatel by přišel o vyplněná data).
 */
export function useFormAction(fn: (prev: FormState, fd: FormData) => Promise<FormState>) {
  const [state, action, pending] = useActionState(fn, null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
  return { state, onSubmit, pending };
}

export function SubmitButton({ children, className = "btn-primary", pending }: { children: ReactNode; className?: string; pending?: boolean }) {
  const status = useFormStatus();
  const busy = pending ?? status.pending;
  return (
    <button type="submit" className={className} disabled={busy}>
      {busy ? "Odesílám…" : children}
    </button>
  );
}

/** Skryté pole proti spamu – roboti ho vyplní, lidé ne. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Web
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function Consent({ error, children }: { error?: string; children?: ReactNode }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-m365-600" required />
        <span>{children ?? "Souhlasím se zpracováním osobních údajů za účelem vyřízení mé žádosti."}</span>
      </label>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (!state || state.ok) return null;
  return <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">{state.message}</div>;
}

export function FormSuccess({ title, message, children }: { title: string; message: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-4 p-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-excel-50 text-excel-600 ring-1 ring-excel-200">
        <IconCheck width={28} height={28} />
      </span>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="max-w-md text-slate-600">{message}</p>
      {children}
    </div>
  );
}
