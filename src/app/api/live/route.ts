import { NextResponse } from "next/server";
import { desc, gte, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { feedEvents, players, presence } from "@/db/schema";
import { FALLBACK_EVENTS, FALLBACK_PLAYERS, TOTAL_STAGES } from "@/lib/fallbackBoard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_SECONDS = 45;

function ambient() {
  return 17 + Math.floor(Math.abs(Math.sin(Date.now() / 900_000) * 26));
}

function demoOnlinePlayers() {
  return FALLBACK_PLAYERS.slice(0, 7).map((p, i) => ({
    handle: p.handle,
    title: p.title,
    region: p.region,
    stagesCleared: p.stagesCleared,
    lastStage: p.lastStage,
    progress: Math.round((p.stagesCleared / TOTAL_STAGES) * 100),
    page: i === 0 ? "/" : i === 1 ? "/cards" : i === 2 ? "/leaderboard" : "/characters",
    active: i < 4,
  }));
}

function fallbackSnapshot() {
  const online = ambient();
  return {
    online,
    peak: Math.max(online + 9, 48),
    duelists: FALLBACK_PLAYERS.length,
    onlinePlayers: demoOnlinePlayers(),
    events: FALLBACK_EVENTS,
    source: "demo" as const,
  };
}

async function snapshot() {
  const cutoff = new Date(Date.now() - WINDOW_SECONDS * 1000);

  const [onlineRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(presence)
    .where(gte(presence.lastSeen, cutoff));

  // Ambil player yang punya presence aktif
  const activeRows = await db
    .select({
      handle: players.handle,
      title: players.title,
      region: players.region,
      stagesCleared: players.stagesCleared,
      lastStage: players.lastStage,
      page: presence.page,
      lastSeen: presence.lastSeen,
    })
    .from(presence)
    .innerJoin(players, sql`lower(${players.handle}) = lower(split_part(${presence.sessionId}, '_', 1)) OR ${presence.sessionId} IS NOT NULL`)
    .where(gte(presence.lastSeen, cutoff))
    .orderBy(desc(presence.lastSeen))
    .limit(10);

  const topPlayers = await db
    .select({
      handle: players.handle,
      title: players.title,
      region: players.region,
      stagesCleared: players.stagesCleared,
      lastStage: players.lastStage,
    })
    .from(players)
    .orderBy(desc(players.stagesCleared), desc(players.wins))
    .limit(8);

  const [duelistRow] = await db.select({ n: sql<number>`count(*)::int` }).from(players);

  const events = await db
    .select({ id: feedEvents.id, kind: feedEvents.kind, message: feedEvents.message })
    .from(feedEvents)
    .orderBy(desc(feedEvents.id))
    .limit(8);

  const real = onlineRow?.n ?? 0;
  const online = real + ambient();

  // Jika presence table kosong, fallback ambil dari top players
  const list =
    activeRows.length > 0
      ? activeRows.map((r) => ({
          handle: r.handle,
          title: r.title,
          region: r.region,
          stagesCleared: r.stagesCleared,
          lastStage: r.lastStage,
          progress: Math.round((r.stagesCleared / TOTAL_STAGES) * 100),
          page: r.page,
          active: true,
        }))
      : topPlayers.slice(0, 6).map((p, i) => ({
          handle: p.handle,
          title: p.title,
          region: p.region,
          stagesCleared: p.stagesCleared,
          lastStage: p.lastStage,
          progress: Math.round((p.stagesCleared / TOTAL_STAGES) * 100),
          page: i % 2 === 0 ? "/" : "/cards",
          active: i < 3,
        }));

  return {
    online,
    peak: Math.max(online + 9, 48),
    duelists: duelistRow?.n ?? 0,
    onlinePlayers: list,
    events: events.length ? events : FALLBACK_EVENTS,
    source: "live" as const,
  };
}

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json(fallbackSnapshot());
  try {
    return NextResponse.json(await snapshot());
  } catch {
    return NextResponse.json(fallbackSnapshot());
  }
}

export async function POST(req: Request) {
  if (!isDbConfigured()) return NextResponse.json(fallbackSnapshot());

  try {
    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
      page?: string;
      handle?: string;
    };
    const id = (body.sessionId ?? "").slice(0, 64);
    const page = (body.page ?? "/").slice(0, 80);

    if (id) {
      await db
        .insert(presence)
        .values({ sessionId: id, page, lastSeen: new Date() })
        .onConflictDoUpdate({
          target: presence.sessionId,
          set: { lastSeen: new Date(), page },
        });

      if (Math.random() < 0.12) {
        await db
          .delete(presence)
          .where(sql`${presence.lastSeen} < now() - interval '10 minutes'`);
      }
    }
    return NextResponse.json(await snapshot());
  } catch {
    return NextResponse.json(fallbackSnapshot());
  }
}
