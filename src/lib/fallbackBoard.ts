import { TOTAL_STAGES } from "@/data/stages";

export { TOTAL_STAGES };

/**
 * Data DEMO leaderboard.
 * Dipakai kalau DATABASE_URL belum diset ATAU tabel players masih kosong,
 * supaya kamu bisa langsung melihat tampilan akhirnya.
 */
export type DeckSlot = { id: number; count: number };

export type BoardRow = {
  id: number;
  handle: string;
  title: string;
  region: string;
  wins: number;
  losses: number;
  stagesCleared: number;
  lastStage: string;
  starchips: number;
  deck: DeckSlot[];
};

/** Ukuran deck resmi Forbidden Memories. */
export const DECK_SIZE = 40;

const d = (id: number, count = 1): DeckSlot => ({ id, count });

/* ── DECK LIST 40 KARTU PER DUELIST ─────────────────────────── */

/** God-tier: Gate Guardian + ritual terkuat. */
const DECK_NITEMARE: DeckSlot[] = [
  d(374), d(371), d(372), d(373), d(380), d(713, 2), d(705, 2), d(706, 2),
  d(364), d(722), d(721), d(708, 2), d(709), d(720), d(707, 2), d(22, 3),
  d(35, 2), d(1, 3), d(337), d(336), d(348), d(661), d(686, 2), d(657),
  d(335), d(332), d(315, 2), d(314),
];

/** Dragon murni ala Kaiba. */
const DECK_DRAGON_KAIBA: DeckSlot[] = [
  d(1, 3), d(380), d(705, 2), d(427, 3), d(706, 2), d(713), d(82, 2), d(39, 2),
  d(31, 3), d(168, 2), d(94, 2), d(7, 2), d(425, 2), d(613), d(22, 2),
  d(332), d(315, 3), d(314, 2), d(337), d(336), d(661), d(348),
];

/** Ritual summon spesialis. */
const DECK_RITUAL: DeckSlot[] = [
  d(722), d(721), d(364), d(365), d(703), d(704), d(705), d(709), d(710),
  d(716), d(717), d(718), d(719), d(702), d(356), d(360), d(35, 3), d(2, 2),
  d(551, 2), d(531, 2), d(42, 2), d(708, 2), d(323, 3), d(348), d(337),
  d(336), d(335), d(320), d(686, 2), d(657),
];

/** Fusion-oriented, material murah ATK besar. */
const DECK_FUSION: DeckSlot[] = [
  d(713), d(392), d(391, 2), d(378, 2), d(377, 2), d(370), d(369), d(368),
  d(509, 2), d(69, 2), d(4, 3), d(16, 2), d(32, 2), d(81, 2), d(26, 3),
  d(15, 2), d(38, 2), d(39, 2), d(22, 2), d(332), d(330), d(337), d(336), d(348),
];

/** Guardian Star specialist — balance LIGHT/DARK. */
const DECK_GUARDIAN: DeckSlot[] = [
  d(1, 2), d(2, 3), d(35, 2), d(551, 2), d(531, 2), d(42, 2), d(22, 2),
  d(707, 2), d(708), d(84, 2), d(62, 2), d(38, 2), d(39, 2), d(26, 2),
  d(30, 2), d(323, 3), d(302, 2), d(348), d(337), d(336), d(335), d(320),
];

/** Harpie / Winged Beast. */
const DECK_HARPIE: DeckSlot[] = [
  d(386, 2), d(63, 2), d(62, 3), d(317, 3), d(318, 2), d(465, 2), d(466, 2),
  d(555, 2), d(7, 2), d(458, 2), d(538, 2), d(31, 2), d(82), d(22, 2),
  d(332), d(315, 2), d(316, 2), d(314), d(337), d(336), d(348), d(657), d(320),
];

/** Warrior / Sogen. */
const DECK_WARRIOR: DeckSlot[] = [
  d(38, 3), d(382, 2), d(15, 2), d(26, 3), d(33, 2), d(30, 2), d(378, 2),
  d(362, 2), d(356), d(704), d(716), d(22, 2), d(39, 2), d(84),
  d(333), d(302, 3), d(651, 2), d(314, 2), d(668), d(337), d(336), d(348), d(686, 2),
];

/** Zombie / Yami. */
const DECK_ZOMBIE: DeckSlot[] = [
  d(99, 2), d(97, 3), d(139, 2), d(24, 3), d(30, 3), d(719), d(707, 2),
  d(22, 3), d(84, 2), d(385), d(95, 2), d(368), d(23, 2),
  d(335), d(331), d(302, 3), d(336), d(337), d(348), d(686), d(657), d(320, 3),
];

/** Machine deck. */
const DECK_MACHINE: DeckSlot[] = [
  d(407, 2), d(390, 2), d(512, 3), d(417, 2), d(370, 2), d(392), d(391, 2),
  d(639, 2), d(14, 2), d(325, 3), d(22, 2), d(26, 2), d(31, 2), d(1),
  d(337), d(336), d(348), d(661), d(686, 2), d(657), d(315, 2), d(320, 3),
];

/** Dragon menengah. */
const DECK_DRAGON_MID: DeckSlot[] = [
  d(82, 3), d(69, 2), d(4, 3), d(16, 2), d(39, 3), d(31, 3), d(168, 2),
  d(94, 2), d(81, 2), d(7, 2), d(427), d(705), d(22, 2), d(26, 2),
  d(332), d(315, 3), d(314, 2), d(337), d(336), d(348), d(320),
];

/** Insect / Forest. */
const DECK_INSECT: DeckSlot[] = [
  d(67), d(57, 2), d(52, 3), d(50, 3), d(501, 3), d(717), d(295, 2),
  d(23, 3), d(5, 2), d(642, 2), d(26, 2), d(30, 2), d(22),
  d(330), d(323, 2), d(302, 2), d(337), d(336), d(348), d(686, 2), d(320, 3),
];

/** Baby Dragon + Time Wizard ala Jono. */
const DECK_JONO: DeckSlot[] = [
  d(4, 3), d(16, 2), d(69, 2), d(15, 2), d(26, 3), d(82), d(31, 2),
  d(30, 2), d(23, 3), d(24, 3), d(642, 2), d(538, 2), d(94, 2), d(22),
  d(302, 3), d(315, 2), d(332), d(336), d(348), d(320), d(2),
];

/** Spellcaster ala Teana. */
const DECK_SPELLCASTER: DeckSlot[] = [
  d(531, 2), d(2, 3), d(42, 3), d(551, 2), d(35), d(62, 2), d(24, 3),
  d(23, 3), d(642, 3), d(26, 2), d(30, 2), d(4, 2),
  d(323, 3), d(302, 2), d(318), d(320, 2), d(336), d(348), d(330), d(2),
];

/** Starter deck pemula. */
const DECK_ROOKIE: DeckSlot[] = [
  d(24, 3), d(23, 3), d(642, 3), d(2, 3), d(4, 2), d(26, 2), d(30, 2),
  d(538, 2), d(50, 2), d(97, 2), d(31, 2), d(94, 2), d(80, 2), d(42),
  d(302, 2), d(315, 2), d(323), d(320, 2), d(333), d(336),
];

export const FALLBACK_PLAYERS: BoardRow[] = [
  { id: 1,  handle: "YamiNoGamer",      title: "Nitemare Slayer",    region: "Domino City",     wins: 612, losses: 41,  stagesCleared: 26, lastStage: "Nitemare",            starchips: 184320, deck: DECK_NITEMARE },
  { id: 2,  handle: "SetoKaibaID",      title: "Millennium Keeper",  region: "Jakarta",         wins: 488, losses: 77,  stagesCleared: 26, lastStage: "Nitemare",            starchips: 151002, deck: DECK_DRAGON_KAIBA },
  { id: 3,  handle: "RitualMaster88",   title: "Millennium Keeper",  region: "Bandung",         wins: 364, losses: 120, stagesCleared: 25, lastStage: "DarkNite",            starchips: 98750,  deck: DECK_RITUAL },
  { id: 4,  handle: "FusionAdeptX",     title: "Labyrinth Breaker",  region: "Surabaya",        wins: 221, losses: 143, stagesCleared: 24, lastStage: "Priest Seto 3rd",     starchips: 64100,  deck: DECK_FUSION },
  { id: 5,  handle: "GuardianStarSage", title: "Mage Slayer",        region: "Ancient Egypt",   wins: 142, losses: 61,  stagesCleared: 22, lastStage: "Guardian Neku",       starchips: 42980,  deck: DECK_GUARDIAN },
  { id: 6,  handle: "HarpieQueen",      title: "Mage Slayer",        region: "Bali",            wins: 118, losses: 90,  stagesCleared: 20, lastStage: "Labyrinth Mage",      starchips: 37500,  deck: DECK_HARPIE },
  { id: 7,  handle: "MeadowFarmer",     title: "Guardian Star Sage", region: "Medan",           wins: 86,  losses: 52,  stagesCleared: 19, lastStage: "High Mage Kepura",    starchips: 25400,  deck: DECK_WARRIOR },
  { id: 8,  handle: "ZombieLordID",     title: "Guardian Star Sage", region: "Makassar",        wins: 63,  losses: 88,  stagesCleared: 17, lastStage: "High Mage Martis",    starchips: 19870,  deck: DECK_ZOMBIE },
  { id: 9,  handle: "MachineKingKeith", title: "Fusion Adept",       region: "Kaiba Land",      wins: 44,  losses: 39,  stagesCleared: 15, lastStage: "High Mage Atenza",    starchips: 12030,  deck: DECK_MACHINE },
  { id: 10, handle: "DragonTamer_99",   title: "Fusion Adept",       region: "Yogyakarta",      wins: 38,  losses: 25,  stagesCleared: 13, lastStage: "High Mage Anubisius", starchips: 10400,  deck: DECK_DRAGON_MID },
  { id: 11, handle: "InsectHaga",       title: "Card Hunter",        region: "Semarang",        wins: 24,  losses: 46,  stagesCleared: 11, lastStage: "High Mage Secmeton",  starchips: 6800,   deck: DECK_INSECT },
  { id: 12, handle: "RookieJono",       title: "Card Hunter",        region: "Duelist Kingdom", wins: 18,  losses: 74,  stagesCleared: 8,  lastStage: "Jono",                starchips: 4200,   deck: DECK_JONO },
  { id: 13, handle: "TeanaFanboy",      title: "Rookie Duelist",     region: "Palembang",       wins: 9,   losses: 33,  stagesCleared: 6,  lastStage: "Priest Seto 1st",     starchips: 2100,   deck: DECK_SPELLCASTER },
  { id: 14, handle: "NewDuelistID",     title: "Rookie Duelist",     region: "Depok",           wins: 3,   losses: 19,  stagesCleared: 3,  lastStage: "Villager 1",          starchips: 640,    deck: DECK_ROOKIE },
];

export const FALLBACK_EVENTS = [
  { id: 5, kind: "amber",   message: "🏆 YamiNoGamer MENAMATKAN SELURUH 26 STAGE — WIN RATE 93.7%" },
  { id: 4, kind: "win",     message: "⚔️ SetoKaibaID MENGALAHKAN NITEMARE DENGAN 565 TOTAL DUEL" },
  { id: 3, kind: "info",    message: "📡 DATABASE UPDATE — 722 KARTU & 25.131 RESEP FUSION TERSINKRONISASI" },
  { id: 2, kind: "magenta", message: "🔥 RitualMaster88 MENCAPAI STAGE 25/26 — TERSISA NITEMARE" },
  { id: 1, kind: "info",    message: "🎴 TAMBAHKAN GAMBAR KARTUMU SENDIRI DI FOLDER /public/image/arworks" },
];
