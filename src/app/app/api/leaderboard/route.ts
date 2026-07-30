import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { players } from "@/db/schema";
import { getBoard } from "@/lib/players";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * LEADERBOARD (read-only).
 * Metrik utama: WIN RATE · TOTAL DUEL · STAGE SELESAI.
 */
export async function GET() {
  return NextResponse.json(await getBoard());
}

export async function HEAD() {
  if (!isDbConfigured()) return new Response(null, { status: 204 });
  try {
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(players);
    return new Response(null, {
      status: 204,
      headers: { "x-duelists": String(row?.n ?? 0) },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
