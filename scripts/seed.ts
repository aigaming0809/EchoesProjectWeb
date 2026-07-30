/**
 * SEED LEADERBOARD — Yu-Gi-Oh! Eternal Echoes
 * Menyalin data demo (termasuk deck list 40 kartu) ke PostgreSQL.
 *
 * Jalankan:  npx tsx scripts/seed.ts
 */
import "dotenv/config";
import { db } from "../src/db";
import { feedEvents, players } from "../src/db/schema";
import { FALLBACK_EVENTS, FALLBACK_PLAYERS } from "../src/lib/fallbackBoard";
import { analyzeDeck } from "../src/lib/players";

async function main() {
  await db.delete(players);
  await db.delete(feedEvents);

  for (const p of FALLBACK_PLAYERS) {
    await db.insert(players).values({
      handle: p.handle,
      title: p.title,
      region: p.region,
      wins: p.wins,
      losses: p.losses,
      stagesCleared: p.stagesCleared,
      lastStage: p.lastStage,
      starchips: p.starchips,
      deck: p.deck,
    });
  }

  for (const e of FALLBACK_EVENTS) {
    await db.insert(feedEvents).values({ kind: e.kind, message: e.message });
  }

  console.log(`✓ ${FALLBACK_PLAYERS.length} duelist & ${FALLBACK_EVENTS.length} event tersimpan\n`);
  console.log("HANDLE               WR      DUEL  STAGE   DECK  ACE");
  console.log("-".repeat(72));
  for (const p of FALLBACK_PLAYERS) {
    const t = p.wins + p.losses;
    const wr = t ? ((p.wins / t) * 100).toFixed(1) : "0.0";
    const s = analyzeDeck(p.deck);
    const warn = s.total === 40 ? " " : "!";
    console.log(
      `${p.handle.padEnd(19)}${(wr + "%").padStart(6)}${String(t).padStart(10)}` +
        `${(p.stagesCleared + "/26").padStart(8)}${(warn + s.total).padStart(7)}  ${s.aceName}`,
    );
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
