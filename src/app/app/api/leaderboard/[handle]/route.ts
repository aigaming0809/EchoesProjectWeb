import { NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/players";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Profil satu duelist berdasarkan handle. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ handle: string }> },
) {
  const { handle } = await ctx.params;
  const profile = await getPlayerProfile(handle);
  if (!profile) {
    return NextResponse.json({ error: "Duelist tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(profile);
}
