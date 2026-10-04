import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE = "lnd_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dní

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET musí mít alespoň 32 znaků.");
    return new TextEncoder().encode("dev-only-secret-change-me-dev-only-secret");
  }
  return new TextEncoder().encode(s);
}

/** Hash ze scripts/hash-password.mjs je kvůli znakům „$“ v .env zakódovaný jako „b64:…“. */
function passwordHash(): string {
  const raw = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  return raw.startsWith("b64:") ? Buffer.from(raw.slice(4), "base64").toString("utf8") : raw;
}

/** V režimu vývoje bez nastaveného hesla lze použít admin / admin. */
export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const hash = passwordHash();
  if (!hash) {
    return process.env.NODE_ENV !== "production" && email === "admin" && password === "admin";
  }
  if (email.trim().toLowerCase() !== expectedEmail) {
    await bcrypt.compare(password, hash); // vyrovnání času odpovědi
    return false;
  }
  return bcrypt.compare(password, hash);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ sub: email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return { email: String(payload.sub) };
  } catch {
    return null;
  }
}

/** Volat na začátku každé admin stránky i server action. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/prihlaseni");
  return s;
}
