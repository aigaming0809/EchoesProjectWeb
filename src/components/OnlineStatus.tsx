"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type OnlinePlayer = {
  handle: string;
  title: string;
  region: string;
  stagesCleared: number;
  lastStage: string;
  progress: number;
  page: string;
  active: boolean;
};

type LiveData = {
  online: number;
  peak: number;
  duelists: number;
  onlinePlayers: OnlinePlayer[];
  source?: string;
};

const PAGE_ICON: Record<string, string> = {
  "/": "🏠",
  "/cards": "🎴",
  "/characters": "🧑‍🎤",
  "/story": "📖",
  "/fusion": "⚗️",
  "/leaderboard": "🏆",
  "/download": "📥",
  "/patch-notes": "📋",
  "/announcements": "📢",
};

function pageIcon(p: string) {
  if (PAGE_ICON[p]) return PAGE_ICON[p];
  if (p.startsWith("/cards/")) return "🎴";
  if (p.startsWith("/characters/")) return "🧑‍🎤";
  if (p.startsWith("/leaderboard/")) return "🏆";
  return "◈";
}

function Ticker({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const from = shown;
    const diff = value - from;
    if (diff === 0) return;
    const dur = 900;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + diff * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{shown.toLocaleString("id-ID")}</span>;
}

export default function OnlineStatus() {
  const [data, setData] = useState<LiveData | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [flash, setFlash] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const prev = useRef(0);

  useEffect(() => {
    let alive = true;
    const pull = async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as LiveData;
        if (!alive) return;
        if (j.online !== prev.current) {
          prev.current = j.online;
          setFlash(true);
          setTimeout(() => setFlash(false), 700);
        }
        setData(j);
        setHistory((h) => [...h.slice(-23), j.online]);
      } catch {
        /* offline */
      }
    };
    pull();
    const t = setInterval(pull, 10000);
    const c = setInterval(
      () => setClock(new Date().toLocaleTimeString("id-ID", { hour12: false })),
      1000,
    );
    return () => {
      alive = false;
      clearInterval(t);
      clearInterval(c);
    };
  }, []);

  const online = data?.online ?? 0;
  const peak = data?.peak ?? 0;
  const maxH = Math.max(...history, 1);
  const players = data?.onlinePlayers ?? [];

  return (
    <div className="panel clip-corner relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: "linear-gradient(90deg,transparent,#9dff3c,transparent)" }}
      />
      <div className="sweep-shine" />

      <div className="relative grid gap-0 lg:grid-cols-[300px_1fr]">
        {/* ── KIRI: COUNTER UTAMA ──────────────────── */}
        <div className="relative border-b border-white/8 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
            </span>
            <p className="font-mono text-[9px] tracking-[0.3em] text-lime-400">
              PLAYER ONLINE
            </p>
          </div>

          <div className="mt-3 flex items-end gap-3">
            <Ticker
              value={online}
              className={`font-display text-6xl font-black leading-none tabular-nums text-lime-300 transition-transform duration-500 md:text-7xl ${
                flash ? "scale-105" : "scale-100"
              }`}
            />
            <span className="mb-2 font-mono text-[10px] tracking-widest text-slate-500">
              DUELIST
            </span>
          </div>

          <div className="mt-4 flex h-10 items-end gap-[3px]">
            {(history.length ? history : Array(24).fill(0)).map((v, i) => (
              <span
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-lime-600/40 to-lime-300 transition-all duration-500"
                style={{
                  height: `${Math.max((v / maxH) * 100, 6)}%`,
                  opacity: 0.35 + (i / 24) * 0.65,
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 font-mono text-[9px] tracking-wider text-slate-600">
            RIWAYAT 4 MENIT TERAKHIR
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/8 pt-4">
            <div>
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-slate-500">
                PUNCAK HARI INI
              </p>
              <p className="font-display text-xl font-black tabular-nums text-fuchsia-400">
                {peak}
              </p>
            </div>
            <div>
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-slate-500">
                TERDAFTAR
              </p>
              <p className="font-display text-xl font-black tabular-nums text-amber-300">
                {data?.duelists ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* ── KANAN: LIST PLAYER & STAGE ───────────── */}
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-300">
                DUELIST ONLINE &amp; PROGRES STAGE
              </p>
            </div>
            <span className="font-mono text-[10px] tracking-widest text-slate-500">
              {clock}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {players.map((p, i) => {
              const finished = p.stagesCleared >= 26;
              return (
                <Link
                  key={p.handle + i}
                  href={`/leaderboard/${encodeURIComponent(p.handle.toLowerCase())}`}
                  className="clip-corner-sm group flex items-center justify-between gap-3 border border-white/8 bg-white/[0.02] p-3 transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-400/5"
                  style={{ animation: `fadeIn 0.4s ${i * 50}ms both` }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                      </span>
                      <p className="truncate font-display text-[13px] font-bold text-white transition-colors group-hover:text-cyan-300">
                        {p.handle}
                      </p>
                      <span className="text-xs" title={`Sedang di: ${p.page}`}>
                        {pageIcon(p.page)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[9.5px] text-slate-500">
                      {p.region} · <span className="text-amber-300">{p.lastStage}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className="font-display text-sm font-black tabular-nums"
                      style={{ color: finished ? "#ffd447" : "#38bdf8" }}
                    >
                      {p.stagesCleared}
                      <span className="text-[10px] text-slate-600">/26</span>
                    </p>
                    <div className="stat-bar mt-1 w-16">
                      <span
                        className="bg-gradient-to-r from-cyan-600 to-cyan-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {!players.length && (
            <div className="py-8 text-center font-mono text-[11px] text-slate-600">
              MEMUAT DATA DUELIST ONLINE…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
