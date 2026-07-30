import { NextResponse } from "next/server";
import { queryCards } from "@/lib/fm";
import { resolveCardThumb } from "@/lib/localCards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const res = queryCards({
    q: searchParams.get("q") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    attribute: searchParams.get("attribute") ?? undefined,
    star: searchParams.get("star") ?? undefined,
    level: searchParams.get("level") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    perPage: Number(searchParams.get("perPage") ?? 24),
  });
  return NextResponse.json({
    ...res,
    items: res.items.map((c) => ({ ...c, img: resolveCardThumb(c) })),
  });
}
