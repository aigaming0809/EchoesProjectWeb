import { NextResponse } from "next/server";
import { cards, fusionMap, getCard } from "@/lib/fm";
import { resolveCardThumb } from "@/lib/localCards";

export const dynamic = "force-dynamic";

function lookup(a: number, b: number): number | null {
  const listA = fusionMap[String(a)];
  if (listA) {
    const hit = listA.find(([partner]) => partner === b);
    if (hit) return hit[1];
  }
  const listB = fusionMap[String(b)];
  if (listB) {
    const hit = listB.find(([partner]) => partner === a);
    if (hit) return hit[1];
  }
  return null;
}

function pack(id: number) {
  const c = getCard(id);
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    type: c.type,
    attribute: c.attribute,
    level: c.level,
    atk: c.atk,
    def: c.def,
    zodiac: c.zodiac,
    img: resolveCardThumb(c),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "combine";

  if (mode === "search") {
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const list = (q
      ? cards.filter((c) => c.name.toLowerCase().includes(q) || String(c.id) === q)
      : cards.slice(0, 40)
    )
      .slice(0, 40)
      .map((c) => pack(c.id));
    return NextResponse.json({ results: list });
  }

  const a = Number(searchParams.get("a"));
  const b = Number(searchParams.get("b"));
  if (!getCard(a) || !getCard(b)) {
    return NextResponse.json({ error: "invalid cards" }, { status: 400 });
  }
  const resultId = lookup(a, b);
  const cardA = getCard(a)!;
  const cardB = getCard(b)!;

  if (resultId === null) {
    // In FM a failed fusion leaves the second material on the field.
    return NextResponse.json({
      success: false,
      a: pack(a),
      b: pack(b),
      result: pack(b),
      note: "Tidak ada resep fusion. Di game asli, kartu kedua tetap berada di field.",
    });
  }

  const result = getCard(resultId)!;
  return NextResponse.json({
    success: true,
    a: pack(a),
    b: pack(b),
    result: pack(resultId),
    gain: result.atk - Math.max(cardA.atk, cardB.atk),
  });
}
