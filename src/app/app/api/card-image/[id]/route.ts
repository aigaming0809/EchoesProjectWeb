import fsp from "node:fs/promises";
import path from "node:path";
import { getCard } from "@/lib/fm";
import { getScan } from "@/lib/localCards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ════════════════════════════════════════════════════════════════
 *  IMAGE SERVER  —  /api/card-image/[id]?size=full|small
 * ════════════════════════════════════════════════════════════════
 *
 *  ⚠️ 100% LOKAL — TIDAK ADA SUMBER GAMBAR DARI LUAR.
 *
 *  Sumber gambar HANYA folder:  public/image/arworks/
 *
 *  Urutan:
 *    1. File lokal di /public/image/arworks   →  gambar milikmu
 *    2. Placeholder SVG cyberpunk     →  jika file belum ada
 *
 *  Placeholder secara eksplisit menampilkan nama file yang harus dibuat,
 *  jadi kamu tinggal melihat kartu mana yang belum punya artwork.
 */

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const ATTR_COLOR: Record<string, string> = {
  Light: "#ffe36e",
  Dark: "#a855f7",
  Earth: "#b98b4e",
  Water: "#38bdf8",
  Fire: "#ff5a3c",
  Wind: "#4ade80",
  Magic: "#2dd4bf",
  Trap: "#f472b6",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Placeholder yang informatif: nomor, nama, tipe, dan nama file yang dibutuhkan. */
function placeholder(
  id: number,
  name: string,
  type: string,
  attribute: string,
  atk: number,
  def: number,
  monster: boolean,
  small: boolean,
): Response {
  const accent = ATTR_COLOR[attribute] ?? "#00f0ff";
  const W = small ? 210 : 421;
  const H = small ? 307 : 614;
  const k = small ? 0.5 : 1;
  const file = `${String(id).padStart(3, "0")}.png`;

  // Pecah nama panjang jadi 2 baris
  const words = name.split(" ");
  let l1 = name;
  let l2 = "";
  if (name.length > 18) {
    let acc = "";
    for (const w of words) {
      if ((acc + " " + w).trim().length > 18 && acc) break;
      acc = (acc + " " + w).trim();
    }
    l1 = acc;
    l2 = name.slice(acc.length).trim();
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 421 614">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#070b18"/><stop offset="0.55" stop-color="#0d1030"/><stop offset="1" stop-color="#1a0a2e"/>
  </linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${accent}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="${accent}" stop-opacity="1"/>
    <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </linearGradient>
  <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
    <path d="M26 0H0V26" fill="none" stroke="${accent}" stroke-opacity="0.09" stroke-width="1"/>
  </pattern>
</defs>

<rect width="421" height="614" fill="url(#bg)"/>
<rect width="421" height="614" fill="url(#grid)"/>

<rect x="12" y="12" width="397" height="590" fill="none" stroke="${accent}" stroke-opacity="0.30" stroke-width="1.5"/>
<rect x="0" y="0" width="421" height="4" fill="url(#edge)"/>
<rect x="0" y="610" width="421" height="4" fill="url(#edge)"/>

<path d="M12 40 L12 12 L40 12" fill="none" stroke="${accent}" stroke-width="3"/>
<path d="M381 12 L409 12 L409 40" fill="none" stroke="${accent}" stroke-width="3"/>
<path d="M12 574 L12 602 L40 602" fill="none" stroke="${accent}" stroke-width="3"/>
<path d="M381 602 L409 602 L409 574" fill="none" stroke="${accent}" stroke-width="3"/>

<circle cx="210" cy="232" r="62" fill="none" stroke="${accent}" stroke-opacity="0.28" stroke-width="1.5" stroke-dasharray="5 7"/>
<circle cx="210" cy="232" r="44" fill="none" stroke="${accent}" stroke-opacity="0.16" stroke-width="1"/>
<text x="210" y="248" font-family="monospace" font-size="42" font-weight="bold" fill="${accent}" fill-opacity="0.55" text-anchor="middle">?</text>

<rect x="150" y="316" width="121" height="22" fill="${accent}" fill-opacity="0.14"/>
<text x="210" y="332" font-family="monospace" font-size="14" font-weight="bold" fill="${accent}" text-anchor="middle" letter-spacing="3">#${String(id).padStart(3, "0")}</text>

<text x="210" y="372" font-family="monospace" font-size="17" font-weight="bold" fill="#e8eef8" text-anchor="middle">${esc(l1)}</text>
${l2 ? `<text x="210" y="394" font-family="monospace" font-size="17" font-weight="bold" fill="#e8eef8" text-anchor="middle">${esc(l2)}</text>` : ""}

<text x="210" y="${l2 ? 424 : 402}" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle" letter-spacing="2">${esc(type.toUpperCase())} · ${esc(attribute.toUpperCase())}</text>
${monster ? `<text x="210" y="${l2 ? 446 : 424}" font-family="monospace" font-size="12" fill="#94a3b8" text-anchor="middle" letter-spacing="1"><tspan fill="#fb7185">ATK ${atk}</tspan>   <tspan fill="#38bdf8">DEF ${def}</tspan></text>` : ""}

<line x1="70" y1="492" x2="351" y2="492" stroke="${accent}" stroke-opacity="0.22" stroke-width="1"/>
<text x="210" y="522" font-family="monospace" font-size="10" fill="#ff2bd6" text-anchor="middle" letter-spacing="3">ARTWORK BELUM ADA</text>
<rect x="86" y="536" width="249" height="26" fill="#000000" fill-opacity="0.45" stroke="${accent}" stroke-opacity="0.25"/>
<text x="210" y="553" font-family="monospace" font-size="11" fill="${accent}" text-anchor="middle">public/image/arworks/${file}</text>
<text x="210" y="580" font-family="monospace" font-size="9" fill="#475569" text-anchor="middle" letter-spacing="1">TARUH GAMBARMU DI FOLDER TERSEBUT</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
      "x-image-source": "placeholder",
      "x-expected-file": `public/image/arworks/${file}`,
      "x-scale": String(k),
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  const card = getCard(id);
  if (!card) return new Response("Card not found", { status: 404 });

  const small = new URL(req.url).searchParams.get("size") === "small";
  const monster = !["Magic", "Trap", "Ritual", "Equip"].includes(card.type);

  // ── SATU-SATUNYA SUMBER: file lokal di public/image/arworks ──────────
  const localUrl = getScan().byId.get(id);
  if (localUrl) {
    try {
      const abs = path.join(process.cwd(), "public", localUrl.replace(/^\/+/, ""));
      const buf = await fsp.readFile(abs);
      const type = MIME[path.extname(abs).toLowerCase()] ?? "image/png";
      return new Response(new Uint8Array(buf), {
        headers: {
          "content-type": type,
          // no-cache supaya kamu bisa mengganti file dan langsung lihat hasilnya
          "cache-control": "public, max-age=0, must-revalidate",
          "x-image-source": "local",
          "x-local-file": localUrl,
        },
      });
    } catch {
      /* file terhapus di tengah jalan → jatuh ke placeholder */
    }
  }

  return placeholder(id, card.name, card.type, card.attribute, card.atk, card.def, monster, small);
}
