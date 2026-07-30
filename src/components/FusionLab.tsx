"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CardArt } from "./HoloCard";

type Pack = {
  id: number;
  name: string;
  type: string;
  attribute: string;
  level: number;
  atk: number;
  def: number;
  zodiac: string[];
  img: string;
};

type FuseResult = {
  success: boolean;
  a: Pack;
  b: Pack;
  result: Pack;
  gain?: number;
  note?: string;
};

function Slot({
  card,
  label,
  accent,
  onClear,
  onPick,
}: {
  card: Pack | null;
  label: string;
  accent: string;
  onClear: () => void;
  onPick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: accent }}>
        {label}
      </p>
      <button
        onClick={card ? onClear : onPick}
        className="holo-wrap group relative aspect-[59/86] w-full max-w-[190px]"
      >
        <div
          className="clip-corner-sm relative h-full w-full overflow-hidden border-2 border-dashed transition-all duration-300"
          style={{
            borderColor: card ? accent : "rgba(255,255,255,0.15)",
            borderStyle: card ? "solid" : "dashed",
            boxShadow: card ? `0 20px 50px -22px ${accent}` : "none",
          }}
        >
          {card ? (
            <>
              <CardArt src={card.img} alt={card.name} className="h-full w-full object-cover" />
              <div className="holo-layer" />
              <div className="holo-sparkle" />
              <div className="holo-glare" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent px-2 pb-1.5 pt-6">
                <p className="truncate font-display text-[10px] font-bold text-white">
                  {card.name}
                </p>
                <p className="font-mono text-[9px] text-slate-400">
                  {card.atk}/{card.def}
                </p>
              </div>
              <span className="absolute right-1 top-1 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[8px] text-rose-400 opacity-0 transition-opacity group-hover:opacity-100">
                ✕ HAPUS
              </span>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
              <span className="text-3xl opacity-50">+</span>
              <span className="font-mono text-[9px] tracking-widest">PILIH KARTU</span>
            </div>
          )}
        </div>
      </button>
      {card && (
        <button
          onClick={onPick}
          className="font-mono text-[9px] tracking-widest text-slate-500 hover:text-cyan-300"
        >
          GANTI ▸
        </button>
      )}
    </div>
  );
}

export default function FusionLab({ starters }: { starters: Pack[] }) {
  const [a, setA] = useState<Pack | null>(starters[0] ?? null);
  const [b, setB] = useState<Pack | null>(starters[1] ?? null);
  const [slot, setSlot] = useState<"a" | "b" | null>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Pack[]>([]);
  const [fuse, setFuse] = useState<FuseResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (slot === null) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/fusion?mode=search&q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { results: Pack[] };
      setResults(json.results ?? []);
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, slot]);

  const doFuse = useCallback(async () => {
    if (!a || !b) return;
    setBusy(true);
    setFlash(true);
    const res = await fetch(`/api/fusion?a=${a.id}&b=${b.id}`);
    const json = (await res.json()) as FuseResult;
    setTimeout(() => {
      setFuse(json);
      setBusy(false);
      setTimeout(() => setFlash(false), 500);
    }, 620);
  }, [a, b]);

  const randomize = () => {
    if (!starters.length) return;
    const pick = () => starters[Math.floor(Math.random() * starters.length)];
    setA(pick());
    setB(pick());
    setFuse(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="panel clip-corner relative overflow-hidden p-6 md:p-10">
        {flash && (
          <div className="pointer-events-none absolute inset-0 z-20 animate-[fadeIn_0.2s_ease] bg-gradient-to-br from-cyan-400/30 via-fuchsia-500/20 to-transparent" />
        )}
        <div className="cyber-grid absolute inset-0 opacity-30" />

        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
          <Slot
            card={a}
            label="MATERIAL A"
            accent="#00f0ff"
            onClear={() => {
              setA(null);
              setFuse(null);
            }}
            onPick={() => {
              setSlot("a");
              setQ("");
            }}
          />
          <div className="flex flex-col items-center gap-2">
            <span
              className={`font-display text-3xl font-black text-fuchsia-400 transition-transform duration-500 ${
                busy ? "scale-150 rotate-180" : ""
              }`}
            >
              ⊕
            </span>
          </div>
          <Slot
            card={b}
            label="MATERIAL B"
            accent="#ff2bd6"
            onClear={() => {
              setB(null);
              setFuse(null);
            }}
            onPick={() => {
              setSlot("b");
              setQ("");
            }}
          />
        </div>

        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={doFuse}
            disabled={!a || !b || busy}
            className="btn-cyber clip-corner-sm border border-fuchsia-400/60 bg-fuchsia-500/20 px-8 py-3.5 font-display text-xs font-black tracking-[0.24em] text-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "◈ FUSING…" : "▸ EKSEKUSI FUSION"}
          </button>
          <button
            onClick={randomize}
            className="btn-cyber clip-corner-sm border border-white/15 px-6 py-3.5 font-display text-xs font-bold tracking-[0.2em] text-slate-300"
          >
            ⟳ ACAK
          </button>
        </div>

        {/* RESULT */}
        {fuse && (
          <div className="relative mt-10 anim-rise">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
              <span
                className={`font-mono text-[10px] tracking-[0.3em] ${
                  fuse.success ? "text-lime-400" : "text-rose-400"
                }`}
              >
                {fuse.success ? "◈ FUSION BERHASIL" : "✕ FUSION GAGAL"}
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            <div className="mx-auto flex max-w-md flex-col items-center">
              <Link href={`/cards/${fuse.result.id}`} className="holo-wrap group w-[220px]">
                <div
                  className="clip-corner relative aspect-[59/86] w-full overflow-hidden border-2"
                  style={{
                    borderColor: fuse.success ? "#9dff3c" : "#f43f5e",
                    boxShadow: `0 30px 70px -26px ${fuse.success ? "#9dff3c" : "#f43f5e"}`,
                  }}
                >
                  <CardArt
                    src={fuse.result.img}
                    alt={fuse.result.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="holo-layer" style={{ opacity: 0.5 }} />
                  <div className="holo-sparkle" style={{ opacity: 0.45 }} />
                  <div className="sweep-shine" />
                </div>
              </Link>
              <h3 className="mt-4 font-display text-xl font-black tracking-wide text-white">
                {fuse.result.name}
              </h3>
              <div className="mt-2 flex gap-4 font-mono text-sm">
                <span className="text-rose-400">ATK {fuse.result.atk}</span>
                <span className="text-sky-400">DEF {fuse.result.def}</span>
                {fuse.result.zodiac.length > 0 && (
                  <span className="text-violet-400">
                    {fuse.result.zodiac.join("/")}
                  </span>
                )}
              </div>
              {typeof fuse.gain === "number" && fuse.gain !== 0 && (
                <p
                  className={`mt-2 font-mono text-xs ${
                    fuse.gain > 0 ? "text-lime-400" : "text-rose-400"
                  }`}
                >
                  {fuse.gain > 0 ? "▲" : "▼"} {Math.abs(fuse.gain)} ATK dibanding material
                  terkuat
                </p>
              )}
              {fuse.note && (
                <p className="mt-3 max-w-sm text-center text-[12.5px] text-slate-500">
                  {fuse.note}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PICKER */}
      <aside className="panel clip-corner flex max-h-[720px] flex-col p-5">
        <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
          {slot ? `PILIH KARTU UNTUK SLOT ${slot.toUpperCase()}` : "CARD PICKER"}
        </p>
        <input
          value={q}
          onFocus={() => setSlot((s) => s ?? "a")}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ketik nama kartu…"
          className="clip-corner-sm mt-3 w-full border border-cyan-500/30 bg-[#050914] px-3 py-2.5 font-mono text-[12px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setSlot("a")}
            className={`clip-corner-sm flex-1 border px-2 py-1.5 font-mono text-[10px] tracking-widest ${
              slot === "a"
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                : "border-white/10 text-slate-500"
            }`}
          >
            SLOT A
          </button>
          <button
            onClick={() => setSlot("b")}
            className={`clip-corner-sm flex-1 border px-2 py-1.5 font-mono text-[10px] tracking-widest ${
              slot === "b"
                ? "border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-300"
                : "border-white/10 text-slate-500"
            }`}
          >
            SLOT B
          </button>
        </div>

        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {(results.length ? results : starters).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                if (slot === "b") setB(c);
                else setA(c);
                setFuse(null);
              }}
              className="flex w-full items-center gap-2.5 border border-white/8 bg-white/[0.02] p-1.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/5"
            >
              <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-sm">
                <CardArt
                  src={c.img}
                  alt={c.name}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-slate-200">
                  {c.name}
                </span>
                <span className="block font-mono text-[9px] text-slate-600">
                  #{String(c.id).padStart(3, "0")} · {c.type} · {c.atk}/{c.def}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
