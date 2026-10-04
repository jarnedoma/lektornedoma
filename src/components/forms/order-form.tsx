"use client";

import { useState } from "react";
import { submitTermOrder, submitVideoOrder } from "@/app/(web)/actions";
import { price } from "@/lib/format";
import { Consent, Field, FormAlert, FormSuccess, Honeypot, SubmitButton, useFormAction } from "./fields";

function BillingFields({ e }: { e: Record<string, string> }) {
  const [isCompany, setIsCompany] = useState(true);
  return (
    <>
      <Field label="Jméno a příjmení" name="name" required autoComplete="name" error={e.name} />
      <Field label="E-mail" name="email" type="email" required autoComplete="email" error={e.email} />
      <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
      <div className="flex items-end">
        <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={isCompany} onChange={(ev) => setIsCompany(ev.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Fakturovat na firmu
        </label>
      </div>
      {isCompany && (
        <>
          <Field label="Firma" name="company" autoComplete="organization" className="sm:col-span-2" />
          <Field label="IČO" name="ico" inputMode="numeric" />
          <Field label="DIČ" name="dic" />
        </>
      )}
      <Field label="Fakturační adresa" name="address" autoComplete="street-address" className="sm:col-span-2" />
    </>
  );
}

export function TermOrderForm({ termId, unitPrice, maxParticipants }: { termId: number; unitPrice: number | null; maxParticipants: number }) {
  const { state, onSubmit, pending } = useFormAction(submitTermOrder);
  const [count, setCount] = useState(1);
  if (state?.ok) return <FormSuccess title="Přihláška odeslána" message={state.message} />;
  const e = state?.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <input type="hidden" name="termId" value={termId} />
      <Field
        label="Počet účastníků"
        name="participants"
        type="number"
        min={1}
        max={Math.max(1, maxParticipants)}
        value={count}
        onChange={(ev) => setCount(Math.max(1, Number(ev.currentTarget.value) || 1))}
        required
        error={e.participants}
      />
      <div className="flex flex-col justify-end">
        <p className="text-sm text-slate-500">Cena celkem (bez DPH)</p>
        <p className="font-display text-2xl font-bold text-ink-950">{unitPrice ? price(unitPrice * count) : "dle dohody"}</p>
      </div>
      {count > 1 && (
        <Field label="Jména účastníků" name="participantNames" className="sm:col-span-2">
          <textarea id="participantNames" name="participantNames" rows={3} className="input" placeholder="Jedno jméno na řádek" />
        </Field>
      )}
      <BillingFields e={e} />
      <Field label="Poznámka" name="message" className="sm:col-span-2">
        <textarea id="message" name="message" rows={3} className="input" />
      </Field>
      <div className="sm:col-span-2">
        <Consent error={e.consent}>Souhlasím s obchodními podmínkami a zpracováním osobních údajů za účelem vyřízení objednávky.</Consent>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormAlert state={state} />
        <SubmitButton pending={pending} className="btn-accent w-full sm:w-auto sm:self-start">Závazně objednat</SubmitButton>
      </div>
    </form>
  );
}

export function VideoOrderForm({ videoCourseId }: { videoCourseId: number }) {
  const { state, onSubmit, pending } = useFormAction(submitVideoOrder);
  if (state?.ok) return <FormSuccess title="Objednávka odeslána" message={state.message} />;
  const e = state?.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <input type="hidden" name="videoCourseId" value={videoCourseId} />
      <BillingFields e={e} />
      <Field label="Poznámka" name="message" className="sm:col-span-2">
        <textarea id="message" name="message" rows={2} className="input" />
      </Field>
      <div className="sm:col-span-2">
        <Consent error={e.consent}>Souhlasím s obchodními podmínkami a zpracováním osobních údajů za účelem vyřízení objednávky.</Consent>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormAlert state={state} />
        <SubmitButton pending={pending} className="btn-accent w-full sm:w-auto sm:self-start">Objednat videokurz</SubmitButton>
      </div>
    </form>
  );
}
