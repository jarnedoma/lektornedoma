"use client";

import { submitInquiry } from "@/app/(web)/actions";
import { FORMATS, INQUIRY_KINDS } from "@/lib/constants";
import { Consent, Field, FormAlert, FormSuccess, Honeypot, SubmitButton, useFormAction } from "./fields";

type Opt = { id: number; title: string; group: string };

export function InquiryForm({ courses, defaultCourseId }: { courses: Opt[]; defaultCourseId?: number }) {
  const { state, onSubmit, pending } = useFormAction(submitInquiry);
  if (state?.ok) return <FormSuccess title="Poptávka odeslána" message={state.message} />;
  const e = state?.errors ?? {};
  const groups = [...new Set(courses.map((c) => c.group))];

  return (
    <form onSubmit={onSubmit} className="card relative grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <Honeypot />
      <div className="sm:col-span-2">
        <p className="label">Co poptáváte</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(INQUIRY_KINDS).map(([k, label], i) => (
            <label key={k} className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-sm ring-1 ring-slate-200 has-[:checked]:bg-m365-50 has-[:checked]:ring-m365-500">
              <input type="radio" name="kind" value={k} defaultChecked={i === 0} className="text-m365-600" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <Field label="Kurz z nabídky" name="courseId" error={e.courseId} className="sm:col-span-2">
        <select id="courseId" name="courseId" className="input" defaultValue={defaultCourseId ?? ""}>
          <option value="">— vyberte kurz, nebo popište téma níže —</option>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {courses.filter((c) => c.group === g).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <Field label="Téma / zaměření na míru" name="topic" placeholder="např. Copilot pro obchodní tým, reporting v Excelu…" error={e.topic} className="sm:col-span-2" />

      <Field label="Forma" name="format">
        <select id="format" name="format" className="input" defaultValue="nevim">
          {Object.entries(FORMATS).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>
      </Field>
      <Field label="Počet účastníků" name="participants" type="number" min={1} inputMode="numeric" error={e.participants} />
      <Field label="Úroveň účastníků" name="level" placeholder="začátečníci, mix, pokročilí…" />
      <Field label="Představa o termínu" name="preferredDate" placeholder="např. listopad, úterky" />
      <Field label="Místo konání" name="location" placeholder="město / online" className="sm:col-span-2" />

      <Field label="Zpráva" name="message" error={e.message} className="sm:col-span-2">
        <textarea id="message" name="message" rows={4} className="input" placeholder="Co přesně potřebujete zlepšit, s jakými daty pracujete…" />
      </Field>

      <div className="h-px bg-slate-200 sm:col-span-2" />

      <Field label="Jméno a příjmení" name="name" required autoComplete="name" error={e.name} />
      <Field label="Firma" name="company" autoComplete="organization" />
      <Field label="E-mail" name="email" type="email" required autoComplete="email" error={e.email} />
      <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />

      <div className="sm:col-span-2">
        <Consent error={e.consent} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2">
        <FormAlert state={state} />
        <SubmitButton pending={pending} className="btn-primary w-full sm:w-auto sm:self-start">Odeslat nezávaznou poptávku</SubmitButton>
      </div>
    </form>
  );
}
