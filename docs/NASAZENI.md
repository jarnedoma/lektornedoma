# Nasazení nového webu (varianta 2)

**Princip:** u WEDOSu zůstane doména, DNS, e-maily a ostatní weby. Nový web poběží
na hostingu s podporou Node.js. Na WEDOSu se změní jen 2 DNS záznamy (`@` a `www`)
a e-maily ani ostatní weby se nezmění.

```
                 ┌──────────── WEDOS ────────────┐
návštěvník ──►   │ DNS lektornedoma.cz            │
                 │  ├─ A / CNAME  ──────────────► │──► nový web (Roští.cz nebo Vercel)
                 │  └─ MX (e-maily) ── beze změny │
                 │ ostatní weby ───── beze změny  │
                 └────────────────────────────────┘
```

> ⚠️ **Než cokoli zrušíte:** e-mailové schránky na WEDOSu bývají součástí webhostingu.
> Webhosting pro lektornedoma.cz nerušte, dokud neověříte, že schránky zůstanou zachované
> (případně je převeďte na samostatnou e-mailovou službu WEDOS).
>
> ⚠️ **Premium sekce s videokurzy** na starém webu po přepnutí domény na adrese
> www.lektornedoma.cz přestane být dostupná. Do spuštění nového portálu ji nechte běžet
> na subdoméně u WEDOSu (např. `premium.lektornedoma.cz`) – staré adresy pak přesměrujeme.

---

## Doporučená varianta: Roští.cz

Český hosting pro Node.js, platba v Kč, denní zálohy v ceně. Databáze je jednoduše soubor
na disku, takže nepotřebujete žádnou další službu. Na start stačí nejmenší tarif.

1. **Účet a aplikace** – na [rosti.cz](https://rosti.cz) vytvořte aplikaci typu **Node.js**
   (verze 22.9 nebo novější).
2. **Kód** – v aplikaci nastavte nasazování z GitHubu (repozitář `jarnedoma/lektornedoma`,
   hlavní větev), nebo kód nahrajte přes SSH/git podle
   [dokumentace Roští](https://docs.rosti.cz/cs/).
3. **Proměnné prostředí** (soubor `.env` v kořeni aplikace – vzor je v `.env.example`):
   ```
   DATABASE_URL=file:./data/lektornedoma.db
   ADMIN_EMAIL=skoleni@lektornedoma.cz
   ADMIN_PASSWORD_HASH=b64:…    # viz krok 4
   AUTH_SECRET=…                # viz krok 4
   SITE_URL=https://www.lektornedoma.cz
   SMTP_HOST=…  SMTP_PORT=465  SMTP_USER=web@lektornedoma.cz  SMTP_PASS=…
   NOTIFY_FROM=web@lektornedoma.cz
   NOTIFY_TO=skoleni@lektornedoma.cz
   ```
4. **Heslo a tajný klíč** – v terminálu aplikace:
   ```bash
   node scripts/hash-password.mjs "VaseSilneHeslo"     # vypíše řádek ADMIN_PASSWORD_HASH=b64:…
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # → AUTH_SECRET
   ```
5. **Instalace, databáze, build:**
   ```bash
   npm ci
   npm run db:push        # vytvoří tabulky
   npm run db:katalog     # oblasti a kurzy bez ukázkových dat (videokurzy skryté)
   npm run build
   ```
6. **Spuštění** – jako příkaz aplikace nastavte `npm start`. Port převezme z proměnné
   `PORT`, kterou nastaví Roští.
7. **Zálohy navíc** (kromě denních záloh Roští) – nastavte v cronu jednou denně:
   ```bash
   cd ~/app && npm run db:zaloha     # ukládá do data/zalohy, drží posledních 30
   ```
8. **Vyzkoušení** na dočasné adrese, kterou Roští přidělí: přihlášení do `/admin`, poptávka,
   rezervace v kalendáři, přihláška na termín (přijde e-mail?).

## Alternativa: Vercel Pro + Turso

Bezplatný tarif Vercelu je jen pro nekomerční weby, takže pro lektorský web je potřeba
tarif **Pro** (≈ 20 USD/měs.). Databáze pak běží v [Turso](https://turso.tech).

1. Turso: vytvořte databázi v Evropě (Frankfurt), zkopírujte **URL** (`libsql://…`)
   a vytvořte **token**.
2. Na svém počítači do `.env` dejte `DATABASE_URL` a `DATABASE_AUTH_TOKEN` z Turso
   a spusťte `npm run db:push` a `npm run db:katalog`.
3. Vercel: *Add New → Project → Import* z GitHubu, region Frankfurt, vložte proměnné
   prostředí (jako výše, `DATABASE_URL` + `DATABASE_AUTH_TOKEN` z Turso) a nasaďte.
4. Fotku lektora dejte do složky `public/` v repozitáři (na Vercelu nelze ukládat soubory
   za běhu) a v administraci uveďte cestu, např. `/foto-lektor.jpg`.

---

## Přepnutí domény (u WEDOSu)

1. Den předem v DNS u WEDOSu snižte **TTL** záznamů `@` a `www` (např. na 300 s),
   ať se změna projeví rychle.
2. U nového hostingu přidejte domény `lektornedoma.cz` a `www.lektornedoma.cz`.
   Hosting vám ukáže, jaké DNS záznamy nastavit.
3. Ve WEDOS DNS změňte **jen** záznam `A` (případně `AAAA`) pro `@` a záznam pro `www`
   na hodnoty z předchozího kroku.
   **MX, SPF (TXT), DKIM a ostatní záznamy neměňte** – na nich závisí e-maily.
4. Počkejte na SSL certifikát (hosting ho vystaví automaticky) a zkontrolujte web.
5. V [Google Search Console](https://search.google.com/search-console) odešlete
   `https://www.lektornedoma.cz/sitemap.xml`.

## Staré odkazy

Odkazy ze starého webu se trvale (301) přesměrují:

| Stará adresa | Nová adresa |
|---|---|
| `/detail-kurzu?id=…` (i `.php`) | detail kurzu podle pole **ID na starém webu** v administraci kurzu, jinak `/kurzy` |
| `/lektor` | `/o-lektorovi` |
| `/nabidka` | `/terminy` |
| `/reference-jednotlivci`, `/hodnoceni` | `/reference?typ=jednotlivci` |
| `/kurzy-excel` | `/kurzy#excel` |
| `/kurzy-word` a další `/kurzy-…` | `/kurzy#microsoft-365` |
| jakákoli `/stranka.php` | `/stranka` |

U 7 kurzů je ID ze starého webu už vyplněné (známé z vyhledávače). Ostatní doplníme
při importu dat ze staré databáze.

## Aktualizace webu

1. Nová verze se nahraje do GitHubu.
2. Roští / Vercel ji nasadí (automaticky nebo příkazem podle nastavení).
3. Pokud se měnila struktura databáze, spusťte `npm run db:push`. Data zůstanou zachovaná.
