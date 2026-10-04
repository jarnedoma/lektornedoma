/**
 * Záloha SQLite databáze do data/zalohy/lektornedoma-RRRR-MM-DD-HHMM.db
 * Spuštění: node scripts/backup.mjs   (vhodné i pro cron, např. každou noc)
 * Ponechá posledních 30 záloh.
 */
import { createClient } from "@libsql/client";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const url = process.env.DATABASE_URL ?? "file:./data/lektornedoma.db";
if (!url.startsWith("file:")) {
  console.error("Záloha tímto skriptem funguje jen pro lokální soubor (DATABASE_URL=file:…). U Turso použijte jejich zálohy/export.");
  process.exit(1);
}
const dir = resolve("data/zalohy");
mkdirSync(dir, { recursive: true });
const iso = new Date().toISOString(); // 2026-10-04T21:37:…
const stamp = `${iso.slice(0, 10)}-${iso.slice(11, 13)}${iso.slice(14, 16)}`;
const target = join(dir, `lektornedoma-${stamp}.db`);

const db = createClient({ url });
// VACUUM INTO vytvoří konzistentní kopii i za běhu webu
await db.execute({ sql: "VACUUM INTO ?", args: [target] });
console.log(`Záloha uložena: ${target}`);

const files = readdirSync(dir).filter((f) => f.endsWith(".db")).sort();
for (const f of files.slice(0, Math.max(0, files.length - 30))) rmSync(join(dir, f));
