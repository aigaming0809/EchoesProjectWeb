# 🚀 Deploy Yu-Gi-Oh! Eternal Echoes ke Vercel

## ❌ Error yang kamu alami

```
Error: DATABASE_URL is required
    at <unknown> (.next/server/chunks/[root-of-the-server]__1131t7t._.js:8:47561)
> Build error occurred
Error: Failed to collect page data for /api/health
Error: Command "npm run build" exited with 1
```

### Penyebab

File `src/db/index.ts` versi lama melempar error **di module scope**:

```ts
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required"); // ⛔ jalan saat BUILD
export const db = drizzle(new Pool({ connectionString: databaseUrl }));
```

Saat `next build`, Next.js meng-**import** setiap Route Handler (`/api/health`,
`/api/live`, `/api/leaderboard`) untuk *"collect page data"*. Karena modul
tersebut throw seketika saat di-import — dan di tahap build Vercel belum tentu
menyuntikkan env var — build langsung gagal.

---

## ✅ Perbaikan yang sudah diterapkan (Option B — Lazy Initialization)

| Perubahan | File |
|---|---|
| Pool & Drizzle dibuat **saat query pertama** (runtime), bukan saat import. Tidak ada `throw` di top-level. | `src/db/index.ts` |
| Helper `isDbConfigured()` untuk deteksi env sebelum menyentuh DB | `src/db/index.ts` |
| SSL otomatis aktif untuk host non-localhost (Neon/Supabase/Vercel PG) | `src/db/index.ts` |
| `max: 1` connection saat berjalan di Vercel (serverless-friendly) | `src/db/index.ts` |
| `/api/health` mengembalikan **200** walau DB belum diset | `src/app/api/health/route.ts` |
| `/api/live` & `/api/leaderboard` punya fallback data demo | `src/app/api/*/route.ts` |
| Banner "MODE DEMO" di halaman leaderboard | `src/components/LeaderboardClient.tsx` |
| `outputFileTracingIncludes` agar `/public/image/arworks` ikut bundle serverless | `next.config.ts` |

Hasilnya: **build selalu sukses**, dengan atau tanpa `DATABASE_URL`.

---

## 📋 Langkah deploy

### 1. Siapkan Postgres (gratis)

Pilih salah satu:

- **Neon** → https://neon.tech (rekomendasi, serverless)
- **Supabase** → https://supabase.com
- **Vercel Postgres** → Vercel Dashboard → Storage → Create Database

Salin connection string, contoh Neon:

```
postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Set Environment Variable di Vercel

Project → **Settings** → **Environment Variables** → Add:

| Key | Value | Environments |
|---|---|---|
| `DATABASE_URL` | `postgresql://...?sslmode=require` | Production, Preview, Development |

> Kalau pakai **Vercel Postgres**, variabel `POSTGRES_URL` dibuat otomatis —
> kode ini sudah membacanya sebagai fallback, jadi tidak perlu setting manual.

### 3. Redeploy

Deployments → titik tiga → **Redeploy**.

### 4. Buat tabel di database

Jalankan dari komputer lokal (sekali saja):

```bash
# 1. isi .env dengan DATABASE_URL produksi
echo 'DATABASE_URL=postgresql://...?sslmode=require' > .env

# 2. push schema
npx drizzle-kit push
```

Tabel yang dibuat: `players`, `presence`, `feed_events`.

### 5. (Opsional) Seed data awal

```bash
psql "postgresql://...?sslmode=require" -c "
INSERT INTO players (handle,title,region,wins,losses,starchips,best_combo,favorite_card_id)
VALUES ('YamiNoGamer','Nitemare Slayer','Domino City',612,41,184320,'Sanga + Kazejin + Suijin',374)
ON CONFLICT (handle) DO NOTHING;"
```

### 6. Verifikasi

Buka `https://<domain-kamu>.vercel.app/api/health`:

```json
{ "ok": true, "app": "up", "db": "connected" }
```

Kalau muncul `"db": "not-configured"` → env var belum ter-apply, redeploy lagi.

---

## 🖼️ Catatan gambar kartu di Vercel

- Taruh gambar di `public/image/arworks/` dengan nama **ID kartu**: `001.png`, `035.jpg`, `722.webp`.
- `next.config.ts` sudah menyertakan folder itu ke bundle serverless.
- File yang tidak ada otomatis fallback ke CDN `images.ygoprodeck.com`.
- Setelah menambah gambar, **commit + push** supaya ikut ter-deploy.

---

## 🧪 Cek lokal sebelum push

```bash
npx next typegen
npm exec tsc -- --noEmit
npm run build

# simulasi Vercel tanpa DB (harus tetap sukses):
env -u DATABASE_URL npm run build
```


---

## 🚨 Troubleshooting: `Module not found: Can't resolve '@/data/xxx.json'`

Contoh error saat deploy:

```
./src/app/leaderboard/page.tsx:3:1
Module not found: Can't resolve '@/data/stages.json'
> Build error occurred
Error: Command "npm run build" exited with 1
```

### Penyebab

File **ada di komputermu** tapi **tidak ikut ter-push ke GitHub**.
Vercel hanya membangun dari isi repo — kalau file tidak ada di sana, build gagal.

Ciri khasnya: hanya SATU file yang error, sementara file JSON lain di folder
yang sama berhasil di-resolve.

### Cara memastikan

```bash
# 1. Apakah Git melacak seluruh isi src/data?
git ls-files src/data/

# Harus muncul 9 file .json + stages.ts. Kalau ada yang hilang:

# 2. Cek apakah ada aturan gitignore yang memblokirnya
git check-ignore -v src/data/*.json

# 3. Paksa tambahkan
git add -f src/data/ public/image/arworks/
git commit -m "fix: sertakan seluruh file data"
git push
```

Lalu **Redeploy** di Vercel.

### Pencegahan yang sudah dipasang

| Proteksi | Lokasi |
|---|---|
| Preflight validation — build berhenti dengan pesan jelas kalau ada file data hilang | `next.config.ts` |
| Aturan `!src/data/**` — memaksa Git melacak folder data | `.gitignore` |
| Data stage dipindah ke modul TypeScript (bukan JSON) | `src/data/stages.ts` |

Coba sendiri simulasinya:

```bash
mv src/data/downloads.json /tmp/ && npm run build   # -> error jelas + solusi
mv /tmp/downloads.json src/data/                    # kembalikan
```

### Checklist sebelum push

```bash
git ls-files src/data/ | wc -l     # harus 10
npm run build                       # harus sukses lokal dulu
```
