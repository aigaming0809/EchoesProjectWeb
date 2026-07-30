"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import HoloCard, { CardArt } from "./HoloCard";

export type DeckItem = {
  id: number;
  count: number;
  name: string;
  type: string;
  attribute: string;
  level: number;
  atk: number;
  def: number;
  zodiac: string[];
  img: string;
  monster: boolean;
};

type Group = "all" | "monster" | "magic" | "trap" | "equip" | "ritual";

const ATTR_COLORS: Record<string, string> = {
  Light: "#ffe36e", Dark: "#a855f7", Earth: "#b98b4e", Water: "#38bdf8",
  Fire: "#ff5a3c", Wind: "#4ade80", Magic: "#2dd4bf", Trap: "#f472b6",
};

const groupOf = (c: DeckItem): Group =>
  c.monster ? "monster"
  : c.type === "Trap" ? "trap"
  : c.type === "Equip" ? "equip"
  : c.type === "Ritual" ? "ritual"
  : "magic";

export default function DeckList({
  cards,
  accent,
}: {
  cards: DeckItem[];
  accent: string;
}) {
  const [group, setGroup] = useState<Group>("all");
  const [grid, setGrid] = useState(true);
  const [sort, setSort] = useState<"atk" | "name" | "id">("atk");

  const counts = useMemo(() => {
    const c = { all: 0, monster: 0, magic: 0, trap: 0, equip: 0, ritual: 0 };
    cards.forEach((x) => {
      c.all += x.count;
      c[groupOf(x)] += x.count;
    });
    return c;
  }, [cards]);

  const view = useMemo(() => {
    const list = group === "all" ? cards : cards.filter((c) => groupOf(c) === group);
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "id") return a.id - b.id;
      return b.atk - a.atk || a.id - b.id;
    });
  }, [cards, group, sort]);

  const TABS: [Group, string, string][] = [
    ["all", "SEMUA", accent],
    ["monster", "MONSTER", "#ff6b6b"],
    ["magic", "MAGIC", "#2dd4bf"],
    ["equip", "EQUIP", "#ffc857"],
    ["trap", "TRAP", "#f472b6"],
    ["ritual", "RITUAL", "#a855f7"],
  ];

  return (
    <div>
      {/* kontrol */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(([g, label, color]) => {
            const n = counts[g];
            if (g !== "all" && n === 0) return null;
            return (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className="clip-corner-sm border px-2.5 py-1.5 font-mono text-[9.5px] tracking-widest transition-all hover:-translate-y-0.5"
                style={
                  group === g
                    ? { borderColor: color, background: `${color}22`, color }
                    : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
                }
              >
                {label} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex gap-1.5">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="clip-corner-sm border border-white/10 bg-[#050914] px-2 py-1.5 font-mono text-[9.5px] tracking-widest text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="atk">ATK TERTINGGI</option>
            <option value="name">NAMA A-Z</option>
            <option value="id">NOMOR KARTU</option>
          </select>
          <button
            onClick={() => setGrid((v) => !v)}
            title={grid ? "Tampilan daftar" : "Tampilan grid"}
            className="clip-corner-sm border border-white/10 px-2.5 py-1.5 font-mono text-[9.5px] tracking-widest text-slate-300 transition-colors hover:border-cyan-400 hover:text-cyan-300"
          >
            {grid ? "☰ LIST" : "▦ GRID"}
          </button>
        </div>
      </div>

      {/* GRID */}
      {grid ? (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {view.map((c, i) => (
            <div key={c.id} className="relative">
              <HoloCard
                index={i}
                href={`/cards/${c.id}`}
                showStats={false}
                intensity={11}
                card={{
                  id: c.id,
                  name: c.name,
                  img: c.img,
                  type: c.type,
                  attribute: c.attribute,
                  level: c.level,
                  atk: c.atk,
                  def: c.def,
                  zodiac: c.zodiac,
                }}
              />
              {c.count > 1 && (
                <span
                  className="absolute -right-1.5 -top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-black text-black shadow-lg"
                  style={{ background: accent }}
                >
                  ×{c.count}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* LIST */
        <div className="mt-4 grid gap-1.5 md:grid-cols-2">
          {view.map((c, i) => {
            const col = ATTR_COLORS[c.attribute] ?? "#00f0ff";
            return (
              <Link
                key={c.id}
                href={`/cards/${c.id}`}
                className="group flex items-center gap-3 border border-white/8 bg-white/[0.02] p-2 transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/5"
                style={{ animation: `fadeIn 0.3s ${Math.min(i * 16, 320)}ms both` }}
              >
                <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-white/10">
                  <CardArt src={c.img} alt={c.name} className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-semibold text-slate-200 group-hover:text-cyan-300">
                      {c.name}
                    </span>
                    {c.count > 1 && (
                      <span
                        className="shrink-0 rounded px-1 font-mono text-[9px] font-bold text-black"
                        style={{ background: accent }}
                      >
                        ×{c.count}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 font-mono text-[9px] text-slate-600">
                    <span style={{ color: col }}>{c.attribute.toUpperCase()}</span>
                    <span>·</span>
                    <span>{c.type}</span>
                    {c.monster && (
                      <>
                        <span>·</span>
                        <span className="text-rose-400">{c.atk}</span>
                        <span className="text-slate-700">/</span>
                        <span className="text-sky-400">{c.def}</span>
                      </>
                    )}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[9px] text-slate-700">
                  #{String(c.id).padStart(3, "0")}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {view.length === 0 && (
        <p className="py-10 text-center font-mono text-[11px] tracking-widest text-slate-600">
          TIDAK ADA KARTU DI KATEGORI INI
        </p>
      )}
    </div>
  );
}
