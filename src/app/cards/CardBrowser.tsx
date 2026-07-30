"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HoloCard from "@/components/HoloCard";
import { ALL_TYPES, ATTRIBUTES, ATTR_COLORS as FM_ATTR_COLORS, GUARDIAN_STARS } from "@/lib/fm";

export type SlimCard = [
  number, string, string, string, number, number, number, string[], string,
];

type Card = {
  id: number; name: string; type: string; attribute: string; level: number;
  atk: number; def: number; zodiac: string[]; category: string;
};

// Sumber kebenaran untuk pilihan filter adalah lib/fm.ts, supaya selalu
// sinkron dengan nilai yang benar-benar ada di data/cards.json.
const TYPES = ALL_TYPES;
const ATTRS = ATTRIBUTES;
const STARS = GUARDIAN_STARS;
const SORTS: [string, string][] = [
  ["id", "ID / NOMOR"], ["atk", "ATK TERTINGGI"], ["def", "DEF TERTINGGI"],
  ["level", "LEVEL"], ["name", "NAMA A-Z"],
];
const ATTR_COLORS: Record<string, string> = {
  ...FM_ATTR_COLORS,
  Divine: "#fff2b8",
};
const PER_PAGE = 48;
const EFFECT_TYPES = ["Magic", "Trap", "Equip", "Field"];
const EFFECT_CATEGORIES = ["EFFECT_MONSTER", "RITUAL_MONSTER"];

export default function CardBrowser({ index }: { index: SlimCard[] }) {
  const cards = useMemo<Card[]>(
    () =>
      index.map(([id, name, type, attribute, level, atk, def, zodiac, category]) => ({
        id, name, type, attribute, level, atk, def, zodiac, category,
      })),
    [index],
  );

  // Lazy state initialization from URL search params (runs once on mount, linter-approved)
  const [q, setQ] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("q") ?? "" : ""));
  const [type, setType] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("type") ?? "all" : "all"));
  const [attribute, setAttribute] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("attribute") ?? "all" : "all"));
  const [star, setStar] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("star") ?? "all" : "all"));
  const [level, setLevel] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("level") ?? "all" : "all"));
  const [sort, setSort] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("sort") ?? "id" : "id"));
  const [page, setPage] = useState(() => (typeof window !== "undefined" ? Math.max(Number(new URLSearchParams(window.location.search).get("page") ?? 1) || 1, 1) : 1));
  const [onlyEffect, setOnlyEffect] = useState(() => (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("effect") === "1" : false));

  const [open, setOpen] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (type !== "all") sp.set("type", type);
    if (attribute !== "all") sp.set("attribute", attribute);
    if (star !== "all") sp.set("star", star);
    if (level !== "all") sp.set("level", level);
    if (sort !== "id") sp.set("sort", sort);
    if (page > 1) sp.set("page", String(page));
    if (onlyEffect) sp.set("effect", "1");
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, type, attribute, star, level, sort, page, onlyEffect]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    let list = cards;
    if (key) {
      list = list.filter(
        (c) => c.name.toLowerCase().includes(key) || String(c.id) === key,
      );
    }
    if (type !== "all") list = list.filter((c) => c.type === type);
    if (attribute !== "all") list = list.filter((c) => c.attribute === attribute);
    if (star !== "all") list = list.filter((c) => c.zodiac.includes(star));
    if (level !== "all") list = list.filter((c) => c.level === Number(level));
    if (onlyEffect) list = list.filter((c) => EFFECT_TYPES.includes(c.type) || EFFECT_CATEGORIES.includes(c.category));

    const out = [...list];
    out.sort((a, b) => {
      switch (sort) {
        case "atk": return b.atk - a.atk || a.id - b.id;
        case "def": return b.def - a.def || a.id - b.id;
        case "name": return a.name.localeCompare(b.name);
        case "level": return b.level - a.level || b.atk - a.atk;
        default: return a.id - b.id;
      }
    });
    return out;
  }, [cards, q, type, attribute, star, level, sort, onlyEffect]);

  const pages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1);
  const safePage = Math.min(page, pages);
  const items = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const reset = useCallback(() => {
    setType("all"); setAttribute("all"); setStar("all"); setLevel("all");
    setOnlyEffect(false); setPage(1);
  }, []);

  const activeCount =
    [type, attribute, star, level].filter((v) => v !== "all").length + (onlyEffect ? 1 : 0);

  const go = (n: number) => {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const nums: number[] = [];
  for (let i = Math.max(1, safePage - 2); i <= Math.min(pages, safePage + 2); i++) nums.push(i);

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="panel clip-corner p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nama kartu atau nomor…"
              className="clip-corner-sm w-full border border-cyan-500/30 bg-[#050914] px-4 py-3 pl-10 font-mono text-[13px] text-cyan-100 outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:shadow-[0_0_22px_-6px_rgba(0,240,255,0.8)]"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500">⌕</span>
            {q && (
              <button
                onClick={() => { setQ(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500 hover:text-fuchsia-400"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="clip-corner-sm border border-white/10 bg-[#050914] px-3 py-3 font-mono text-[11px] tracking-widest text-slate-300 outline-none focus:border-cyan-400"
          >
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <button
            onClick={() => setOpen((v) => !v)}
            className={`clip-corner-sm border px-4 py-3 font-mono text-[11px] tracking-widest transition-colors ${
              open || activeCount
                ? "border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-300"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            FILTER{activeCount ? ` (${activeCount})` : ""} {open ? "▲" : "▼"}
          </button>

          <button
            onClick={() => { setOnlyEffect((v) => !v); setPage(1); }}
            title="Hanya tampilkan kartu yang punya efek (Magic / Trap / Equip / Ritual)"
            className={`clip-corner-sm border px-4 py-3 font-mono text-[11px] tracking-widest transition-all ${
              onlyEffect
                ? "border-teal-400/60 bg-teal-400/15 text-teal-300"
                : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            ⚡ EFEK
          </button>

          <div className="clip-corner-sm border border-lime-500/25 bg-lime-500/5 px-4 py-3 font-mono text-[11px] tracking-widest text-lime-300">
            {filtered.length.toLocaleString("id-ID")} HASIL
          </div>
        </div>

        <div
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
            open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 space-y-4">
            <Row label="ATTRIBUTE">
              <Chip on={attribute === "all"} onClick={() => { setAttribute("all"); setPage(1); }}>ALL</Chip>
              {ATTRS.map((a) => (
                <Chip key={a} on={attribute === a} color={ATTR_COLORS[a]}
                  onClick={() => { setAttribute(attribute === a ? "all" : a); setPage(1); }}>
                  {a.toUpperCase()}
                </Chip>
              ))}
            </Row>
            <Row label="TYPE">
              <Chip on={type === "all"} onClick={() => { setType("all"); setPage(1); }}>ALL</Chip>
              {TYPES.map((t) => (
                <Chip key={t} on={type === t}
                  onClick={() => { setType(type === t ? "all" : t); setPage(1); }}>
                  {t.toUpperCase()}
                </Chip>
              ))}
            </Row>
            <Row label="GUARDIAN STAR">
              <Chip on={star === "all"} onClick={() => { setStar("all"); setPage(1); }}>ALL</Chip>
              {STARS.map((s) => (
                <Chip key={s} on={star === s} color="#8b5cf6"
                  onClick={() => { setStar(star === s ? "all" : s); setPage(1); }}>
                  {s.toUpperCase()}
                </Chip>
              ))}
            </Row>
            <Row label="LEVEL">
              <Chip on={level === "all"} onClick={() => { setLevel("all"); setPage(1); }}>ALL</Chip>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((l) => (
                <Chip key={l} on={level === String(l)} color="#ffc857"
                  onClick={() => { setLevel(level === String(l) ? "all" : String(l)); setPage(1); }}>
                  ★{l}
                </Chip>
              ))}
            </Row>
            {activeCount > 0 && (
              <button
                onClick={reset}
                className="clip-corner-sm border border-rose-500/40 bg-rose-500/10 px-4 py-2 font-mono text-[10px] tracking-widest text-rose-300 hover:bg-rose-500/20"
              >
                ✕ RESET SEMUA FILTER
              </button>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="panel clip-corner mt-8 flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-5xl opacity-40">🃏</span>
          <p className="font-display text-lg text-slate-300">TIDAK ADA KARTU DITEMUKAN</p>
          <p className="text-sm text-slate-500">Coba ubah kata kunci atau reset filter.</p>
          <button
            onClick={() => { setQ(""); reset(); }}
            className="clip-corner-sm mt-2 border border-cyan-500/40 px-4 py-2 font-mono text-[11px] tracking-widest text-cyan-300"
          >
            RESET
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {items.map((c, i) => (
            <HoloCard
              key={c.id}
              index={i % 16}
              href={`/cards/${c.id}`}
              card={{
                id: c.id, name: c.name, img: `/api/card-image/${c.id}?size=small`,
                type: c.type, attribute: c.attribute, level: c.level,
                atk: c.atk, def: c.def, zodiac: c.zodiac,
              }}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {safePage > 1 && (
            <button onClick={() => go(safePage - 1)} className={pgBtn}>◂ PREV</button>
          )}
          {nums[0] > 1 && (
            <>
              <button onClick={() => go(1)} className={pgBtn}>1</button>
              <span className="px-1 font-mono text-xs text-slate-600">…</span>
            </>
          )}
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => go(n)}
              className={`clip-corner-sm border px-3.5 py-2 font-mono text-[11px] tracking-widest transition-all ${
                n === safePage
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-300 shadow-[0_0_18px_-6px_rgba(0,240,255,0.9)]"
                  : "border-white/10 text-slate-400 hover:border-cyan-400/50 hover:text-cyan-300"
              }`}
            >
              {n}
            </button>
          ))}
          {nums[nums.length - 1] < pages && (
            <>
              <span className="px-1 font-mono text-xs text-slate-600">…</span>
              <button onClick={() => go(pages)} className={pgBtn}>{pages}</button>
            </>
          )}
          {safePage < pages && (
            <button onClick={() => go(safePage + 1)} className={pgBtn}>NEXT ▸</button>
          )}
        </nav>
      )}
    </div>
  );
}

const pgBtn =
  "clip-corner-sm border border-white/10 px-4 py-2 font-mono text-[11px] tracking-widest text-slate-300 transition-colors hover:border-cyan-400 hover:text-cyan-300";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-2 border-t border-white/5 pt-3">
      <span className="mt-1.5 w-[110px] shrink-0 font-mono text-[9px] tracking-[0.24em] text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  children, on, color = "#00f0ff", onClick,
}: {
  children: React.ReactNode; on: boolean; color?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="clip-corner-sm border px-2.5 py-1 font-mono text-[10px] tracking-wider transition-all duration-200 hover:-translate-y-0.5"
      style={
        on
          ? { borderColor: color, background: `${color}22`, color, boxShadow: `0 0 14px -4px ${color}` }
          : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
      }
    >
      {children}
    </button>
  );
}