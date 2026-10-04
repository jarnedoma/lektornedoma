import "server-only";
import nodemailer from "nodemailer";

/** Odešle upozornění lektorovi. Bez nastaveného SMTP jen zaloguje – web funguje i tak. */
export async function notifyAdmin(subject: string, body: string) {
  const host = process.env.SMTP_HOST;
  const to = process.env.NOTIFY_TO;
  if (!host || !to) {
    console.info(`[notify] ${subject}\n${body}`);
    return;
  }
  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    const site = process.env.SITE_URL ?? "";
    await transport.sendMail({
      from: process.env.NOTIFY_FROM ?? to,
      to,
      subject: `[lektornedoma.cz] ${subject}`,
      text: `${body}\n\nSpravovat v administraci: ${site}/admin`,
    });
  } catch (err) {
    console.error("[notify] odeslání e-mailu selhalo", err);
  }
}

export function formatFields(fields: Record<string, string | number | null | undefined>): string {
  return Object.entries(fields)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
