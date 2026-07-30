import fsp from "node:fs/promises";
import path from "node:path";
import { getCard, getCharacter } from "@/lib/fm";
import { getDuelistScan } from "@/lib/localDuelists";
import { getScan } from "@/lib/localCards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ════════════════════════════════════════════════════════════════
 *  DUELIST IMAGE  —  /api/duelist-image/[slug]?v=avatar
 * ════════════════════════════════════════════════════════════════
 *
 *  Urutan sumber (semua LOKAL, tidak ada domain luar):
 *    1. public/duelists/<slug>-avatar.*   (khusus mode avatar)
 *    2. public/duelists/<slug>.*          (potret)
 *    3. public/image/arworks/<idKartuAndalan>.*   (fallback artwork kartu)
 *    4. Placeholder SVG bergaya cyberpunk
 */

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function sendFile(publicUrl: string, source: string) {
  const abs = path.join(process.cwd(), "public", publicUrl.replace(/^\/+/, ""));
  const buf = await fsp.readFile(abs);
  const type = MIME[path.extname(abs).toLowerCase()] ?? "image/png";
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=0, must-revalidate",
      "x-image-source": source,
      "x-local-file": publicUrl,
    },
  });
}

function placeholder(name: string, accent: string, slug: string, avatar: boolean) {
  const W = avatar ? 240 : 480;
  const H = avatar ? 240 : 640;
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const body = avatar
    ? `<circle cx="120" cy="120" r="72" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="6 8"/>
       <text x="120" y="142" font-family="monospace" font-size="54" font-weight="bold" fill="${accent}" fill-opacity="0.75" text-anchor="middle">${initials}</text>`
    : `<circle cx="240" cy="250" r="88" fill="none" stroke="${accent}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="6 9"/>
       <text x="240" y="278" font-family="monospace" font-size="66" font-weight="bold" fill="${accent}" fill-opacity="0.7" text-anchor="middle">${initials}</text>
       <text x="240" y="400" font-family="monospace" font-size="19" font-weight="bold" fill="#e8eef8" text-anchor="middle">${esc(name.slice(0, 26))}</text>
       <text x="240" y="428" font-family="monospace" font-size="11" fill="#ff2bd6" text-anchor="middle" letter-spacing="3">POTRET BELUM ADA</text>
       <rect x="96" y="452" width="288" height="28" fill="#000" fill-opacity="0.45" stroke="${accent}" stroke-opacity="0.28"/>
       <text x="240" y="470" font-family="monospace" font-size="11.5" fill="${accent}" text-anchor="middle">public/duelists/${esc(slug)}.png</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${avatar ? "240 240" : "480 640"}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#070b18"/><stop offset="0.55" stop-color="#0d1030"/><stop offset="1" stop-color="#1a0a2e"/>
  </linearGradient>
  <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse">
    <path d="M26 0H0V26" fill="none" stroke="${accent}" stroke-opacity="0.09" stroke-width="1"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#bg)"/>
<rect width="100%" height="100%" fill="url(#g)"/>
<rect x="6" y="6" width="${avatar ? 228 : 468}" height="${avatar ? 228 : 628}" fill="none" stroke="${accent}" stroke-opacity="0.3" stroke-width="1.5"/>
${body}
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
      "x-image-source": "placeholder",
      "x-expected-file": `public/duelists/${slug}.png`,
    },
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const ch = getCharacter(slug);
  if (!ch) return new Response("Duelist not found", { status: 404 });

  const avatar = new URL(req.url).searchParams.get("v") === "avatar";
  const scan = getDuelistScan();

  // 1. avatar khusus
  if (avatar) {
    const a = scan.avatar.get(slug);
    if (a) {
      try {
        return await sendFile(a, "duelist-avatar");
      } catch {
        /* lanjut */
      }
    }
  }

  // 2. potret duelist
  const p = scan.portrait.get(slug);
  if (p) {
    try {
      return await sendFile(p, "duelist-portrait");
    } catch {
      /* lanjut */
    }
  }

  // 3. fallback: artwork kartu andalan
  const cardId = avatar ? ch.avatarCardId : ch.portraitCardId;
  const cardUrl = getScan().byId.get(cardId);
  if (cardUrl) {
    try {
      return await sendFile(cardUrl, "card-fallback");
    } catch {
      /* lanjut */
    }
  }

  // 4. placeholder
  const card = getCard(cardId);
  return placeholder(ch.name, ch.accent, slug, avatar || Boolean(card && false));
}
