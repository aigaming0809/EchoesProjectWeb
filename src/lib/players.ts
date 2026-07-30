import { desc } from "drizzle-orm";
import { db, isDbConfigured } from "@/db";
import { players } from "@/db/schema";
import { getCard, isMonster, type FmCard } from "@/lib/fm";
import {
  DECK_SIZE,
  FALLBACK_PLAYERS,
  type BoardRow,
  type DeckSlot,
} from "@/lib/fallbackBoard";
import { STAGES, TOTAL_STAGES } from "@/data/stages";

export type DeckCard = DeckSlot & { card: FmCard };

export type DeckStats = {
  /** total kartu (sudah dikali count) */
  total: number;
  monsters: number;
  magics: number;
  traps: number;
  equips: number;
  rituals: number;
  /** kartu ATK tertinggi — dipakai sebagai avatar/ace */
  aceId: number;
  aceName: string;
  avgAtk: number;
  maxAtk: number;
  /** distribusi tipe monster, terurut menurun */
  types: { name: string; count: number }[];
  /** distribusi attribute */
  attributes: { name: string; count: number }[];
  /** field card yang dipakai */
  fields: string[];
};

export type LeaderRow = Omit<BoardRow, "deck"> & {
  rank: number;
  totalDuels: number;
  winRate: number;
  progress: number;
  deck: DeckSlot[];
  deckStats: DeckStats;
};

export type BoardSummary = {
  duelists: number;
  avgWinRate: number;
  totalDuels: number;
  finished: number;
  totalStages: number;
};

export { STAGES, TOTAL_STAGES, DECK_SIZE };

const FIELD_NAMES = ["Umi", "Yami", "Forest", "Wasteland", "Mountain", "Sogen"];

/** Gabungkan deck slot dengan data kartu lengkap. */
export function resolveDeck(deck: DeckSlot[]): DeckCard[] {
  return deck
    .map((s) => {
      const card = getCard(s.id);
      return card ? { ...s, card } : null;
    })
    .filter((x): x is DeckCard => x !== null);
}

/** Hitung statistik deck. */
export function analyzeDeck(deck: DeckSlot[]): DeckStats {
  const resolved = resolveDeck(deck);
  const empty: DeckStats = {
    total: 0, monsters: 0, magics: 0, traps: 0, equips: 0, rituals: 0,
    aceId: 1, aceName: "—", avgAtk: 0, maxAtk: 0, types: [], attributes: [], fields: [],
  };
  if (!resolved.length) return empty;

  let total = 0, monsters = 0, magics = 0, traps = 0, equips = 0, rituals = 0;
  let atkSum = 0, atkCount = 0, maxAtk = -1, aceId = resolved[0].card.id;
  const typeMap = new Map<string, number>();
  const attrMap = new Map<string, number>();
  const fields = new Set<string>();

  for (const { card, count } of resolved) {
    total += count;
    if (isMonster(card)) {
      monsters += count;
      atkSum += card.atk * count;
      atkCount += count;
      if (card.atk > maxAtk) {
        maxAtk = card.atk;
        aceId = card.id;
      }
      typeMap.set(card.type, (typeMap.get(card.type) ?? 0) + count);
      attrMap.set(card.attribute, (attrMap.get(card.attribute) ?? 0) + count);
    } else if (card.type === "Equip") equips += count;
    else if (card.type === "Trap") traps += count;
    else if (card.type === "Ritual") rituals += count;
    else {
      magics += count;
      if (FIELD_NAMES.includes(card.name)) fields.add(card.name);
    }
  }

  const sortDesc = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  return {
    total,
    monsters,
    magics,
    traps,
    equips,
    rituals,
    aceId,
    aceName: getCard(aceId)?.name ?? "—",
    avgAtk: atkCount ? Math.round(atkSum / atkCount) : 0,
    maxAtk: Math.max(maxAtk, 0),
    types: sortDesc(typeMap),
    attributes: sortDesc(attrMap),
    fields: [...fields],
  };
}

/** Hitung metrik turunan + peringkat. */
export function decorate(rows: BoardRow[]): LeaderRow[] {
  return rows
    .map((p) => {
      const totalDuels = p.wins + p.losses;
      const deck = Array.isArray(p.deck) ? p.deck : [];
      return {
        ...p,
        deck,
        rank: 0,
        totalDuels,
        winRate: totalDuels > 0 ? Math.round((p.wins / totalDuels) * 1000) / 10 : 0,
        progress: Math.round((p.stagesCleared / TOTAL_STAGES) * 100),
        deckStats: analyzeDeck(deck),
      };
    })
    .sort(
      (a, b) =>
        b.stagesCleared - a.stagesCleared ||
        b.winRate - a.winRate ||
        b.totalDuels - a.totalDuels,
    )
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export function summarize(rows: LeaderRow[]): BoardSummary {
  if (!rows.length) {
    return { duelists: 0, avgWinRate: 0, totalDuels: 0, finished: 0, totalStages: TOTAL_STAGES };
  }
  const totalDuels = rows.reduce((a, r) => a + r.totalDuels, 0);
  const totalWins = rows.reduce((a, r) => a + r.wins, 0);
  return {
    duelists: rows.length,
    avgWinRate: totalDuels ? Math.round((totalWins / totalDuels) * 1000) / 10 : 0,
    totalDuels,
    finished: rows.filter((r) => r.stagesCleared >= TOTAL_STAGES).length,
    totalStages: TOTAL_STAGES,
  };
}

/** Ambil seluruh papan peringkat (DB → fallback demo). */
export async function getBoard(): Promise<{
  players: LeaderRow[];
  summary: BoardSummary;
  source: "live" | "demo";
}> {
  if (isDbConfigured()) {
    try {
      const raw = await db
        .select({
          id: players.id,
          handle: players.handle,
          title: players.title,
          region: players.region,
          wins: players.wins,
          losses: players.losses,
          stagesCleared: players.stagesCleared,
          lastStage: players.lastStage,
          starchips: players.starchips,
          deck: players.deck,
        })
        .from(players)
        .orderBy(desc(players.stagesCleared), desc(players.wins))
        .limit(200);

      if (raw.length) {
        const rows = decorate(raw as BoardRow[]);
        return { players: rows, summary: summarize(rows), source: "live" };
      }
    } catch {
      /* fallback di bawah */
    }
  }
  const rows = decorate(FALLBACK_PLAYERS);
  return { players: rows, summary: summarize(rows), source: "demo" };
}

/** URL-safe slug dari handle. */
export const toSlug = (handle: string) => encodeURIComponent(handle.toLowerCase());

/** Ambil satu duelist + tetangga peringkatnya. */
export async function getPlayerProfile(slug: string) {
  const board = await getBoard();
  const target = decodeURIComponent(slug).toLowerCase();
  const idx = board.players.findIndex((p) => p.handle.toLowerCase() === target);
  if (idx === -1) return null;

  return {
    player: board.players[idx],
    prev: idx > 0 ? board.players[idx - 1] : null,
    next: idx < board.players.length - 1 ? board.players[idx + 1] : null,
    summary: board.summary,
    source: board.source,
    total: board.players.length,
  };
}
