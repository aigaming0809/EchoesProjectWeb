import cardsRaw from "@/data/cards.json";
import fusionsRaw from "@/data/fusions.json";
import equipsRaw from "@/data/equips.json";
import ritualsRaw from "@/data/rituals.json";
import charactersRaw from "@/data/characters.json";
import storyRaw from "@/data/story.json";

export type FmCard = {
  id: number;
  name: string;
  atk: number;
  def: number;
  type: string;
  attribute: string;
  zodiac: string[];
  category: string;
  level: number;
  description: string;
  limit: string;
};

export type DeckEntry = { id: number; count: number; note?: string };

export type FmCharacter = {
  slug: string;
  name: string;
  alias: string;
  era: string;
  role: string;
  faction: string;
  difficulty: number;
  hp: number;
  accent: string;
  avatarCardId: number;
  portraitCardId: number;
  titleTag: string;
  bio: string;
  bioLong: string;
  quotes: string[];
  signatureCards: number[];
  deck: DeckEntry[];
  drops: number[];
  strategy: string;
  storyChapters: string[];
};

export type StoryChapter = {
  id: string;
  act: string;
  no: string;
  title: string;
  era: string;
  location: string;
  accent: string;
  cardId: number;
  summary: string;
  body: string;
  duels: string[];
  keyItems: string[];
  tips: string;
};

export type StoryData = {
  title: string;
  subtitle: string;
  chapters: StoryChapter[];
  millenniumItems: { name: string; holder: string; icon: string }[];
  mechanics: { title: string; icon: string; desc: string }[];
};

// Bentuk mentah cards.json: zodiac tersimpan sebagai 1 string, dan limit
// (opsional) tersimpan sebagai angka (1 = Limited, 2 = Semi-Limited).
type RawCard = {
  id: number;
  name: string;
  atk: number;
  def: number;
  type: string;
  attribute: string;
  zodiac: string;
  category: string;
  level: number;
  description: string;
  limit?: number | string;
};

function limitNumberToLabel(limit?: number | string): string {
  if (limit === undefined || limit === null || limit === "") return "Unlimited";

  // Jika datanya sudah berupa label ("Limited", "Forbidden", dst), pakai langsung.
  if (typeof limit === "string") {
    const known = ["Forbidden", "Limited", "Semi-Limited", "Unlimited"];
    const hit = known.find((k) => k.toLowerCase() === limit.trim().toLowerCase());
    if (hit) return hit;
  }

  const n = typeof limit === "string" ? Number(limit) : limit;
  switch (n) {
    case 0:
      return "Forbidden";
    case 1:
      return "Limited";
    case 2:
      return "Semi-Limited";
    default:
      return "Unlimited";
  }
}

// Kartu resmi 1 sampai terbaru. Kartu custom yang belum terdaftar ditangani
// otomatis oleh fallback di getCard() jika suatu saat dibutuhkan.
export const cards: FmCard[] = (cardsRaw as RawCard[]).map((c) => ({
  id: c.id,
  name: c.name,
  atk: c.atk,
  def: c.def,
  type: c.type,
  attribute: c.attribute,
  zodiac: c.zodiac ? [c.zodiac] : [],
  category: c.category,
  level: c.level,
  description: c.description,
  limit: limitNumberToLabel(c.limit),
}));

export const fusionMap = fusionsRaw as unknown as Record<string, [number, number][]>;
export const equipMap = equipsRaw as Record<string, number[]>;
export const rituals = ritualsRaw as { ritual: number; m: number[]; result: number }[];
export const characters = charactersRaw as FmCharacter[];
export const story = storyRaw as StoryData;

const byId = new Map<number, FmCard>(cards.map((c) => [c.id, c]));

export function getCard(id: number): FmCard | undefined {
  let c = byId.get(id);
  if (!c) {
    // Fallback otomatis jika ada ID di atas 722 yang belum terdaftar di cards.json
    c = {
      id,
      name: `Custom Card #${id}`,
      atk: 3000,
      def: 2500,
      type: "Dragon",
      attribute: "Light",
      zodiac: ["Sun", "Mars"],
      category: "Effect",
      level: 8,
      description: "Custom artwork card uploaded by duelist.",
      limit: "Unlimited",
    };
  }
  return c;
}

export function getCards(ids: number[]): FmCard[] {
  return ids.map((id) => getCard(id)).filter((c): c is FmCard => Boolean(c));
}

export const MONSTER_TYPES = [
  "Dragon",
  "Spellcaster",
  "Zombie",
  "Warrior",
  "Beast-Warrior",
  "Beast",
  "Winged-Beast",
  "Fiend",
  "Fairy",
  "Insect",
  "Dinosaur",
  "Reptile",
  "Fish",
  "Sea Serpent",
  "Machine",
  "Thunder",
  "Aqua",
  "Pyro",
  "Rock",
  "Plant",
  "Divine-Beast",
] as const;

export const EFFECT_TYPES = ["Magic", "Trap", "Equip", "Field"] as const;

export function hasEffect(card: Pick<FmCard, "type" | "category" | "description">): boolean {
  if ((EFFECT_TYPES as readonly string[]).includes(card.type)) return true;
  if (card.category === "EFFECT_MONSTER") return true;
  return typeof card.description === "string" && card.description.includes("[EFFECT]");
}

export function effectMeta(card: Pick<FmCard, "type" | "category" | "description">): {
  label: string;
  kind: string;
  color: string;
  note: string;
} {
  switch (card.type) {
    case "Field":
      return {
        label: "EFEK KARTU",
        kind: "FIELD",
        color: "#2dd4bf",
        note: "Mengubah medan pertempuran selama kartu ini aktif di field.",
      };
    case "Magic":
      return {
        label: "EFEK KARTU",
        kind: "MAGIC",
        color: "#2dd4bf",
        note: "Efek langsung aktif saat kartu dimainkan.",
      };
    case "Trap":
      return {
        label: "EFEK KARTU",
        kind: "TRAP",
        color: "#f472b6",
        note: "Aktif otomatis saat kondisi tertentu terpenuhi.",
      };
    case "Equip":
      return {
        label: "EFEK KARTU",
        kind: "EQUIP",
        color: "#ffc857",
        note: "Menaikkan ATK/DEF monster yang cocok.",
      };
  }

  // Untuk monster: tentukan label dari category, bukan type (type di sini
  // adalah Jenis monster seperti Dragon/Fiend/Divine-Beast, dst).
  const isEffectText = typeof card.description === "string" && card.description.includes("[EFFECT]");

  switch (card.category) {
    case "EFFECT_MONSTER":
      return {
        label: "EFEK MONSTER",
        kind: "EFFECT MONSTER",
        color: "#38bdf8",
        note: "Efek monster ini aktif sesuai kondisi yang tertulis pada deskripsi.",
      };
    case "RITUAL_MONSTER":
      return {
        label: isEffectText ? "EFEK MONSTER" : "DESKRIPSI",
        kind: "RITUAL MONSTER",
        color: "#a855f7",
        note: isEffectText
          ? "Dipanggil lewat Ritual Spell dan memiliki efek tambahan pada deskripsi."
          : "Dipanggil dengan Ritual Spell menggunakan material yang sesuai.",
      };
    case "FUSION_MONSTER":
      return {
        label: isEffectText ? "EFEK MONSTER" : "DESKRIPSI",
        kind: "FUSION MONSTER",
        color: "#f97316",
        note: isEffectText
          ? "Hasil Fusion dari material di bawah, dan memiliki efek tambahan pada deskripsi."
          : "Hasil Fusion dari kombinasi material yang tertulis pada deskripsi.",
      };
    default:
      return {
        label: "DESKRIPSI",
        kind: "NORMAL MONSTER",
        color: "#94a3b8",
        note: "Monster normal di Forbidden Memories tidak memiliki efek — hanya ATK/DEF, Guardian Star, dan Field Power Bonus yang menentukan.",
      };
  }
}

export const ALL_TYPES = [...MONSTER_TYPES, "Magic", "Trap", "Equip", "Field"];
export const ATTRIBUTES = ["Light", "Dark", "Earth", "Water", "Fire", "Wind", "Divine", "Magic", "Trap"];
export const GUARDIAN_STARS = ["Sun", "Moon", "Star", "Neutral"];

/** Deskripsi singkat tiap kategori zodiac untuk ditampilkan di halaman detail kartu. */
export const ZODIAC_NOTES: Record<string, string> = {
  Sun: "Kartu bertema cahaya / kekuatan aktif — biasanya monster tempur langsung.",
  Moon: "Kartu bertema kegelapan / bayangan — banyak dipakai fiend & zombie.",
  Star: "Kartu bertema bintang / cakrawala — kombinasi elemen langka.",
  Neutral: "Tidak terikat kategori zodiac tertentu.",
};

export const ATTR_COLORS: Record<string, string> = {
  Light: "#ffe36e",
  Dark: "#a855f7",
  Earth: "#b98b4e",
  Water: "#38bdf8",
  Fire: "#ff5a3c",
  Wind: "#4ade80",
  Magic: "#2dd4bf",
  Trap: "#f472b6",
};

export const isMonster = (c: FmCard) =>
  !["Magic", "Trap", "Ritual", "Equip"].includes(c.type);

/** "Limited" -> "Limit 1", "Semi-Limited" -> "Limit 2", dsb — untuk teks besar di halaman detail kartu. */
export function limitDisplayLabel(limit: string): string {
  switch (limit) {
    case "Forbidden":
      return "Forbidden";
    case "Limited":
      return "Limit 1";
    case "Semi-Limited":
      return "Limit 2";
    default:
      return "Unlimited";
  }
}

export function fusionsFrom(id: number): [number, number][] {
  return fusionMap[String(id)] ?? [];
}

let resultIndex: Map<number, [number, number][]> | null = null;
export function fusionsInto(id: number): [number, number][] {
  if (!resultIndex) {
    resultIndex = new Map();
    for (const key of Object.keys(fusionMap)) {
      const a = Number(key);
      for (const [b, r] of fusionMap[key]) {
        const arr = resultIndex.get(r);
        if (arr) arr.push([a, b]);
        else resultIndex.set(r, [[a, b]]);
      }
    }
  }
  return resultIndex.get(id) ?? [];
}

export function equipsFor(id: number): number[] {
  return equipMap[String(id)] ?? [];
}

export function ritualFor(id: number) {
  return rituals.find((r) => r.result === id || r.ritual === id);
}

export function getCharacter(slug: string) {
  return characters.find((c) => c.slug === slug);
}

export function charactersForChapter(chapterId: string) {
  const ch = story.chapters.find((c) => c.id === chapterId);
  if (!ch) return [];
  return ch.duels
    .map((slug) => getCharacter(slug))
    .filter((c): c is FmCharacter => Boolean(c));
}

export type CardQuery = {
  q?: string;
  type?: string;
  attribute?: string;
  star?: string;
  level?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

export function queryCards(params: CardQuery) {
  const q = (params.q ?? "").trim().toLowerCase();
  const perPage = Math.min(Math.max(params.perPage ?? 24, 6), 120);
  const page = Math.max(params.page ?? 1, 1);

  let list = cards;
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        String(c.id) === q,
    );
  }
  if (params.type && params.type !== "all") {
    list = list.filter((c) => c.type === params.type);
  }
  if (params.attribute && params.attribute !== "all") {
    list = list.filter((c) => c.attribute === params.attribute);
  }
  if (params.star && params.star !== "all") {
    list = list.filter((c) => c.zodiac.includes(params.star!));
  }
  if (params.level && params.level !== "all") {
    const lvl = Number(params.level);
    list = list.filter((c) => c.level === lvl);
  }

  const sort = params.sort ?? "id";
  const sorted = [...list].sort((a, b) => {
    switch (sort) {
      case "atk":
        return b.atk - a.atk || a.id - b.id;
      case "def":
        return b.def - a.def || a.id - b.id;
      case "name":
        return a.name.localeCompare(b.name);
      case "level":
        return b.level - a.level || b.atk - a.atk;
      default:
        return a.id - b.id;
    }
  });

  const total = sorted.length;
  const pages = Math.max(Math.ceil(total / perPage), 1);
  const safePage = Math.min(page, pages);
  const items = sorted.slice((safePage - 1) * perPage, safePage * perPage);
  return { items, total, page: safePage, pages, perPage };
}

export const STATS = {
  totalCards: cards.length,
  totalFusions: Object.values(fusionMap).reduce((a, v) => a + v.length, 0),
  totalRituals: rituals.length,
  totalEquips: Object.keys(equipMap).length,
  totalDuelists: characters.length,
  strongest: [...cards].sort((a, b) => b.atk - a.atk).slice(0, 8).map((c) => c.id),
};