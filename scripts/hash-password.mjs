import bcrypt from "bcryptjs";

const pwd = process.argv[2];
if (!pwd) {
  console.error('Použití: node scripts/hash-password.mjs "heslo"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pwd, 12);
console.log(hash);
console.log("\nDo .env vložte (včetně uvozovek, kvůli znakům $):");
console.log(`ADMIN_PASSWORD_HASH='${hash}'`);
