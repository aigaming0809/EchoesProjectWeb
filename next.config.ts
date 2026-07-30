import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/* ══════════════════════════════════════════════════════════════
   PREFLIGHT — validasi file data sebelum build dimulai
   ══════════════════════════════════════════════════════════════
   Tanpa ini, file JSON yang lupa di-commit menghasilkan error
   samar "Module not found: Can't resolve '@/data/xxx.json'".
   Guard di bawah memberi pesan yang jelas + cara memperbaikinya. */

const REQUIRED_DATA = [
  "cards.json",
  "fusions.json",
  "equips.json",
  "rituals.json",
  "characters.json",
  "story.json",
  "downloads.json",
  "patchnotes.json",
  "announcements.json",
];

function preflight() {
  const dir = path.join(process.cwd(), "src", "data");
  const missing: string[] = [];
  const empty: string[] = [];

  for (const file of REQUIRED_DATA) {
    const full = path.join(dir, file);
    try {
      const stat = fs.statSync(full);
      if (stat.size < 8) empty.push(file);
    } catch {
      missing.push(file);
    }
  }

  if (missing.length === 0 && empty.length === 0) return;

  const lines = [
    "",
    "╔════════════════════════════════════════════════════════════════╗",
    "║  BUILD DIHENTIKAN — FILE DATA TIDAK LENGKAP                    ║",
    "╚════════════════════════════════════════════════════════════════╝",
    "",
  ];

  if (missing.length) {
    lines.push(`File HILANG di src/data/ (${missing.length}):`);
    missing.forEach((f) => lines.push(`   ✗ src/data/${f}`));
    lines.push("");
  }
  if (empty.length) {
    lines.push(`File KOSONG / rusak (${empty.length}):`);
    empty.forEach((f) => lines.push(`   ⚠ src/data/${f}`));
    lines.push("");
  }

  lines.push(
    "PENYEBAB PALING UMUM: file belum ter-commit ke Git.",
    "",
    "CARA MEMPERBAIKI:",
    "   1. Pastikan file ada di komputermu:  ls src/data/",
    "   2. Cek apakah Git mengabaikannya:    git check-ignore -v src/data/*.json",
    "   3. Paksa tambahkan lalu push:",
    "        git add -f src/data/",
    '        git commit -m "add data files"',
    "        git push",
    "   4. Redeploy di Vercel.",
    "",
  );

  throw new Error(lines.join("\n"));
}

preflight();

const nextConfig: NextConfig = {
  // Folder gambar kartu milik user (`/public/image/arworks`) dibaca lewat `fs`
  // di src/lib/localCards.ts. Di Vercel, file `public/` tidak otomatis ikut ke
  // dalam bundle serverless function, jadi kita sertakan secara eksplisit
  // supaya artwork lokal tetap terdeteksi oleh scanner.
  outputFileTracingIncludes: {
    "/**": ["./public/image/arworks/**", "./public/duelists/**"],
  },
};

export default nextConfig;
