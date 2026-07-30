import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/** Satu entri deck: id kartu Forbidden Memories + jumlah salinan. */
export type DeckSlot = { id: number; count: number };

/**
 * Leaderboard duelist.
 * Fokus statistik: WIN RATE · TOTAL DUEL · STAGE SELESAI.
 */
export const players = pgTable(
  "players",
  {
    id: serial("id").primaryKey(),
    handle: varchar("handle", { length: 32 }).notNull(),
    title: varchar("title", { length: 64 }).notNull().default("Rookie Duelist"),
    region: varchar("region", { length: 48 }).notNull().default("Domino City"),

    /** Statistik duel */
    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),

    /** Progres campaign (0 - 26 stage) */
    stagesCleared: integer("stages_cleared").notNull().default(0),
    lastStage: varchar("last_stage", { length: 64 }).notNull().default("-"),

    /** Deck list 40 kartu — [{ id, count }] */
    deck: jsonb("deck").$type<DeckSlot[]>().notNull().default([]),

    /** Pelengkap tampilan */
    starchips: integer("starchips").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("players_handle_idx").on(table.handle)],
);

/** Heartbeat untuk menghitung "online now". */
export const presence = pgTable("presence", {
  sessionId: varchar("session_id", { length: 64 }).primaryKey(),
  page: varchar("page", { length: 80 }).notNull().default("/"),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
});

/** Feed pengumuman untuk running text. */
export const feedEvents = pgTable("feed_events", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 24 }).notNull().default("info"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type FeedEvent = typeof feedEvents.$inferSelect;
