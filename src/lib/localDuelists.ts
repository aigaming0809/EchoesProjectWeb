import fs from "node:fs";
import path from "node:path";
import { characters } from "./fm";

/**
 * ════════════════════════════════════════════════════════════════
 *  GAMBAR DUELIST  ->  /public/duelists/
 * ════════════════════════════════════════════════════════════════
 *
 * Folder TERPISAH dari /public/image/arworks karena isinya berbeda:
 *   • /public/image/arworks     -> artwork 722 KARTU        (nama file = ID kartu)
 *   • /public/duelists  -> potret 30 DUELIST/KARAKTER (nama file = slug)
 *
 * Dua varian gambar didukung (opsional, boleh salah satu saja):
 *
 *   1) POTRET / FULL — dipakai di banner besar & kartu dossier
 *        public/duelists/seto.png
 *        public/duelists/heishin.jpg
 *
 *   2) AVATAR — dipakai di ikon bulat/kotak kecil
 *        public/duelists/seto-avatar.png
 *        public/duelists/heishin_avatar.jpg
 *
 * Kalau avatar tidak ada -> otomatis memakai potret.
 * Kalau dua-duanya tidak ada -> fallback ke artwork kartu andalan
 * karakter tersebut (perilaku lama, jadi situs tidak pernah kosong).
 *
 * Subfolder juga dipindai (maks 3 level), jadi boleh dirapikan:
 *        public/duelists/mages/ocean-mage.png
 *        public/duelists/modern/kaiba.png
 *
 * Format: .png .jpg .jpeg .webp .gif .avif
 */

const EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const DIR = path.join(process.cwd(), "public", "duelists");

/** "Priest Seto" / "seto_avatar" -> "seto" */
function slugKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type DuelistScan = {
  /** slug -> URL potret */
  portrait: Map<string, string>;
  /** slug -> URL avatar */
  avatar: Map<string, string>;
  unmatched: string[];
  totalFiles: number;
};

function scan(): DuelistScan {
  const portrait = new Map<string, string>();
  const avatar = new Map<string, string>();
  const unmatched: string[] = [];
  let totalFiles = 0;

  // index pencarian: slug DAN nama karakter
  const index = new Map<string, string>();
  for (const c of characters) {
    index.set(slugKey(c.slug), c.slug);
    index.set(slugKey(c.name), c.slug);
    if (c.alias) index.set(slugKey(c.alias), c.slug);
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

      const url = "/duelists/" + path.relative(DIR, full).split(path.sep).join("/");
      let base = entry.name.replace(EXT, "");

      // deteksi suffix avatar: -avatar / _avatar / -icon / -ava
      const isAvatar = /[-_ ](avatar|ava|icon)$/i.test(base);
      if (isAvatar) base = base.replace(/[-_ ](avatar|ava|icon)$/i, "");

      const slug = index.get(slugKey(base));
      if (!slug) {
        unmatched.push(entry.name);
        continue;
      }

      const target = isAvatar ? avatar : portrait;
      if (!target.has(slug)) target.set(slug, url);
    }
  };

  walk(DIR);
  return { portrait, avatar, unmatched, totalFiles };
}

const g = globalThis as typeof globalThis & {
  __fmDuelistScan?: DuelistScan;
  __fmDuelistScanAt?: number;
};

const IS_DEV = process.env.NODE_ENV !== "production";
const RESCAN_MS = IS_DEV ? 2_000 : 15_000;

/** Hasil scan folder duelist (auto-refresh, sama seperti folder cards). */
export function getDuelistScan(): DuelistScan {
  const now = Date.now();
  if (!g.__fmDuelistScan || now - (g.__fmDuelistScanAt ?? 0) > RESCAN_MS) {
    g.__fmDuelistScan = scan();
    g.__fmDuelistScanAt = now;
  }
  return g.__fmDuelistScan;
}

export function forceRescanDuelists(): DuelistScan {
  g.__fmDuelistScan = scan();
  g.__fmDuelistScanAt = Date.now();
  return g.__fmDuelistScan;
}

/** Potret besar (banner & kartu dossier). */
export function resolveDuelistPortrait(slug: string): string {
  return `/api/duelist-image/${slug}`;
}

/** Avatar kecil (ikon bulat/kotak). */
export function resolveDuelistAvatar(slug: string): string {
  return `/api/duelist-image/${slug}?v=avatar`;
}

export function hasDuelistPortrait(slug: string): boolean {
  return getDuelistScan().portrait.has(slug);
}

export function hasDuelistAvatar(slug: string): boolean {
  return getDuelistScan().avatar.has(slug);
}

/** Nama file yang disarankan untuk seorang duelist. */
export function suggestedDuelistFiles(slug: string) {
  return { portrait: `${slug}.png`, avatar: `${slug}-avatar.png` };
}
