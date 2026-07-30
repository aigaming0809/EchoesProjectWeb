import { sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  // Aplikasi tetap "ok" walau DB belum dikonfigurasi: seluruh konten
  // (722 kartu, karakter, alur, fusion) berasal dari JSON statis.
  if (!isDbConfigured()) {
    return Response.json({
      ok: true,
      app: "up",
      db: "not-configured",
      hint: "Set DATABASE_URL di Environment Variables untuk mengaktifkan leaderboard & presence.",
    });
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, app: "up", db: "connected" });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        app: "up",
        db: "error",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 },
    );
  }
}
