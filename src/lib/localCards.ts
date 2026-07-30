import fs from "node:fs";
import path from "node:path";
import { cards, type FmCard } from "./fm";

/**
 * ════════════════════════════════════════════════════════════════
 *  TEMPAT MENGGANTI GAMBAR KARTU  ->  /public/image/arworks/
 * ════════════════════════════════════════════════════════════════
 *
 * Folder ini dipindai otomatis saat server start. Kalau file untuk sebuah
 * kartu ditemukan, gambar lokal kamu MENANG atas CDN.
 *
 * Tiga cara penamaan yang didukung (pilih salah satu):
 *
 *  1) ID kartu (ID berapa pun yang ada di cards.json) — PALING DIREKOMENDASIKAN
 *       001.png · 1.png · card-001.jpg · 035.webp · 722.png · 9000.png
 *
 *  2) Nama kartu (spasi/tanda baca bebas, case-insensitive)
 *       blue-eyes-white-dragon.png
 *       Dark Magician.jpg
 *       gate_guardian.webp
 *
 * Subfolder juga dipindai, jadi kamu boleh merapikan seperti:
 *       public/image/arworks/dragons/001.png
 *       public/image/arworks/ritual/722.png
 *
 * Format: .png .jpg .jpeg .webp .gif .avif
 */

const EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const CARDS_DIR = path.join(process.cwd(), "public", "image", "arworks");

/** "Blue-eyes White Dragon" -> "blueeyeswhitedragon" */
function slugKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type ScanResult = {
  /** cardId -> public URL */
  byId: Map<number, string>;
  /** daftar file yang tidak cocok dengan kartu mana pun */
  unmatched: string[];
  /** total file gambar yang ditemukan */
  totalFiles: number;
};

function scan(): ScanResult {
  const byId = new Map<number, string>();
  const unmatched: string[] = [];
  let totalFiles = 0;

  const nameIndex = new Map<string, number>();
  const validIds = new Set<number>();
  for (const c of cards) {
    nameIndex.set(slugKey(c.name), c.id);
    validIds.add(c.id);
  }

  const walk = (dir: string, depth = 0) => {
    if (depth > 3) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!EXT.test(entry.name)) continue;
      totalFiles++;

      const url =
        "/image/arworks/" + path.relative(CARDS_DIR, full).split(path.sep).join("/");
      const base = entry.name.replace(EXT, "");

      // 1) ID kartu — "001", "1", "card-001", "fm_035", "9000"
      const idMatch = /^(?:card[-_ ]?|fm[-_ ]?|#)?(\d{1,5})$/i.exec(base);
      if (idMatch) {
        const id = Number(idMatch[1]);
        if (validIds.has(id) && !byId.has(id)) {
          byId.set(id, url);
          continue;
        }
      }

      // 2) Nama kartu
      const id = nameIndex.get(slugKey(base));
      if (id && !byId.has(id)) {
        byId.set(id, url);
        continue;
      }

      unmatched.push(entry.name);
    }
  };

  walk(CARDS_DIR);
  return { byId, unmatched, totalFiles };
}

const globalForScan = globalThis as typeof globalThis & {
  __fmScan?: ScanResult;
  __fmScanAt?: number;
};

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Interval scan ulang folder.
 * Scan penuh folder <1000 file hanya butuh ~1-2ms, jadi aman dilakukan berkala
 * bahkan di production. Efeknya: cukup DROP FILE ke public/image/arworks, tunggu
 * sebentar, refresh browser — tanpa perlu restart server.
 */
const RESCAN_MS = IS_DEV ? 2_000 : 15_000;

/**
 * Ambil hasil scan folder `public/image/arworks` (auto-refresh).
 * - Development: scan ulang tiap 2 detik
 * - Production : scan ulang tiap 15 detik
 *
 * Catatan Vercel: filesystem serverless bersifat read-only & ephemeral, jadi di
 * sana gambar tetap harus di-commit ke repo lalu redeploy.
 */
export function getScan(): ScanResult {
  const now = Date.now();
  const stale =
    !globalForScan.__fmScan || now - (globalForScan.__fmScanAt ?? 0) > RESCAN_MS;

  if (stale) {
    globalForScan.__fmScan = scan();
    globalForScan.__fmScanAt = now;
  }
  return globalForScan.__fmScan!;
}

/** Paksa scan ulang folder gambar sekarang juga. */
export function forceRescan(): ScanResult {
  globalForScan.__fmScan = scan();
  globalForScan.__fmScanAt = Date.now();
  return globalForScan.__fmScan;
}

/** Snapshot saat modul dimuat. */
export const scanResult: ScanResult = getScan();

/**
 * Map cardId -> URL lokal.
 * Dibungkus Proxy agar di mode dev selalu memakai hasil scan TERBARU,
 * sementara di production tetap memakai map yang sudah di-cache.
 */
export const localCardMap: Map<number, string> = new Proxy(new Map(), {
  get(_t, prop) {
    const real = getScan().byId;
    const value = real[prop as keyof Map<number, string>];
    return typeof value === "function"
      ? (value as (...a: unknown[]) => unknown).bind(real)
      : value;
  },
}) as Map<number, string>;

/**
 * ⚠️ SUMBER GAMBAR 100% LOKAL — TIDAK ADA CDN / DOMAIN LUAR.
 *
 * Semua gambar disajikan `/api/card-image/[id]` yang hanya membaca folder
 * `public/image/arworks`. Kalau file belum ada, server mengirim placeholder SVG
 * berisi nama file yang harus kamu buat.
 */

/** Artwork besar (halaman detail kartu). */
export function resolveCardImage(card: Pick<FmCard, "id">): string {
  return `/api/card-image/${card.id}`;
}

/** Thumbnail (grid & list). */
export function resolveCardThumb(card: Pick<FmCard, "id">): string {
  return `/api/card-image/${card.id}?size=small`;
}

/** Apakah kartu ini sudah punya gambar lokal? */
export function hasLocalImage(id: number): boolean {
  return getScan().byId.has(id);
}

/** Nama file yang disarankan untuk sebuah kartu. */
export function suggestedFilename(id: number): string {
  return `${String(id).padStart(3, "0")}.png`;
}
