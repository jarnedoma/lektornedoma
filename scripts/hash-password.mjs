import bcrypt from "bcryptjs";

const pwd = process.argv[2];
if (!pwd) {
  console.error('Použití: node scripts/hash-password.mjs "heslo"');
  process.exit(1);
}
// bcrypt hash obsahuje znaky „$“, které Next.js v souboru .env rozbije (bere je jako proměnné),
// proto ho vypíšeme zakódovaný v base64 s předponou „b64:“.
const hash = "b64:" + Buffer.from(bcrypt.hashSync(pwd, 12)).toString("base64");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
