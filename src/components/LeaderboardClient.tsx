"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CardArt } from "./HoloCard";

type Row = {
  id: number;
  rank: number;
  handle: string;
  title: string;
  region: string;
  wins: number;
  losses: number;
  totalDuels: number;
  winRate: number;
  stagesCleared: number;
  lastStage: string;
  progress: number;
  starchips: number;
  deck: { id: number; count: number }[];
  deckStats: {
    total: number;
    monsters: number;
    aceId: number;
    aceName: string;
    avgAtk: number;
    maxAtk: number;
    types: { name: string; count: number }[];
  };
};

type Summary = {
  duelists: number;
  avgWinRate: number;
  totalDuels: number;
  finished: number;
  totalStages: number;
};

type Option = { id: number; name: string; img: string };

const RANK_STYLE = [
  { ring: "#ffd447", label: "👑", glow: "rgba(255,212,71,0.45)" },
  { ring: "#c0d3e0", label: "🥈", glow: "rgba(192,211,224,0.35)" },
  { ring: "#e08a4a", label: "🥉", glow: "rgba(224,138,74,0.35)" },
];

const toSlug = (h: string) => encodeURIComponent(h.toLowerCase());

const rateColor = (r: number) =>
  r >= 80 ? "#9dff3c" : r >= 60 ? "#00f0ff" : r >= 40 ? "#ffc857" : "#fb7185";

type SortKey = "rank" | "winRate" | "totalDuels" | "stagesCleared";

export default function LeaderboardClient({ options }: { options: Option[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("rank");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const json = (await res.json()) as {
        players: Row[];
        summary: Summary;
        source?: string;
      };
      setRows(json.players ?? []);
      setSummary(json.summary ?? null);
      setDemo(json.source === "demo");
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  const view = useMemo(() => {
    const k = query.trim().toLowerCase();
    const list = k
      ? rows.filter(
          (r) =>
            r.handle.toLowerCase().includes(k) ||
            r.region.toLowerCase().includes(k) ||
            r.title.toLowerCase().includes(k),
        )
      : rows;
    if (sortBy === "rank") return list;
    return [...list].sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));
  }, [rows, query, sortBy]);

  return (
    <div className="space-y-6">
      {demo && (
        <div className="clip-corner-sm flex items-start gap-3 border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <span className="text-lg">⚠️</span>
          <p className="font-mono text-[11px] leading-relaxed text-amber-200">
            MODE DEMO — MENAMPILKAN DATA CONTOH.
            <span className="mt-1 block text-amber-300/70">
              Leaderboard sudah terhubung ke PostgreSQL via Drizzle. Begitu tabel{" "}
              <b className="text-amber-100">players</b> terisi, data asli otomatis
              menggantikan demo ini.
            </span>
          </p>
        </div>
      )}

      {/* ── RINGKASAN GLOBAL ─────────────────────────────── */}
      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "RATA-RATA WIN RATE",
              value: `${summary.avgWinRate}%`,
              accent: "#9dff3c",
              icon: "📊",
            },
            {
              label: "TOTAL DUEL TERCATAT",
              value: summary.totalDuels.toLocaleString("id-ID"),
              accent: "#00f0ff",
              icon: "⚔️",
            },
            {
              label: "DUELIST TERDAFTAR",
              value: String(summary.duelists),
              accent: "#ff2bd6",
              icon: "👥",
            },
            {
              label: `TAMAT ${summary.totalStages} STAGE`,
              value: String(summary.finished),
              accent: "#ffc857",
              icon: "🏆",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="panel clip-corner relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1"
              style={{ animation: `rise 0.5s ${i * 70}ms both` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg,transparent,${s.accent},transparent)`,
                }}
              />
              <div className="absolute -right-3 -top-2 text-5xl opacity-10">{s.icon}</div>
              <p
                className="font-display text-3xl font-black tabular-nums"
                style={{ color: s.accent, textShadow: `0 0 20px ${s.accent}55` }}
              >
                {s.value}
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-slate-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── PODIUM ───────────────────────────────────────── */}
      {rows.length >= 3 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {rows.slice(0, 3).map((r, i) => {
            const st = RANK_STYLE[i];
            const ace = options.find((o) => o.id === r.deckStats.aceId);
            return (
              <Link
                key={r.id}
                href={`/leaderboard/${toSlug(r.handle)}`}
                className="panel clip-corner group relative block overflow-hidden p-5 text-center transition-transform duration-300 hover:-translate-y-1.5"
                style={{
                  borderColor: `${st.ring}55`,
                  boxShadow: `0 20px 60px -32px ${st.glow}`,
                  order: i === 0 ? 2 : i === 1 ? 1 : 3,
                  animation: `rise 0.6s ${i * 90}ms both`,
                }}
              >
                <div className="sweep-shine" />
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{
                    background: `linear-gradient(90deg,transparent,${st.ring},transparent)`,
                  }}
                />
                <div className="text-3xl">{st.label}</div>
                <div
                  className="relative mx-auto mt-2 h-20 w-20 overflow-hidden rounded-full border-2"
                  style={{ borderColor: st.ring }}
                >
                  <CardArt
                    src={ace?.img ?? `/api/card-image/${r.deckStats.aceId}?size=small`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <p
                  className="mt-3 truncate font-display text-lg font-black text-white"
                  style={{ textShadow: `0 0 20px ${st.glow}` }}
                >
                  {r.handle}
                </p>
                <p
                  className="font-mono text-[9px] tracking-widest"
                  style={{ color: st.ring }}
                >
                  {r.title.toUpperCase()}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-1 border-t border-white/10 pt-3">
                  <div>
                    <p
                      className="font-display text-base font-black"
                      style={{ color: rateColor(r.winRate) }}
                    >
                      {r.winRate}%
                    </p>
                    <p className="font-mono text-[8px] tracking-wider text-slate-600">
                      WIN RATE
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-base font-black text-cyan-300">
                      {r.totalDuels}
                    </p>
                    <p className="font-mono text-[8px] tracking-wider text-slate-600">
                      TOTAL DUEL
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-base font-black text-amber-300">
                      {r.stagesCleared}
                      <span className="text-[10px] text-slate-600">
                        /{summary?.totalStages ?? 26}
                      </span>
                    </p>
                    <p className="font-mono text-[8px] tracking-wider text-slate-600">
                      STAGE
                    </p>
                  </div>
                </div>

                <div className="stat-bar mt-3">
                  <span
                    className="bg-gradient-to-r from-amber-500 to-amber-300"
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 truncate font-mono text-[9px] text-slate-600">
                  ▸ {r.lastStage}
                </p>
                <div className="mt-3 border-t border-white/10 pt-2.5">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-slate-600">
                    ACE DECK
                  </p>
                  <p className="truncate font-display text-[11px] font-bold text-slate-300">
                    {r.deckStats.aceName}
                  </p>
                  <p className="mt-0.5 font-mono text-[8.5px] text-slate-600">
                    {r.deckStats.total} kartu · avg ATK {r.deckStats.avgAtk}
                  </p>
                </div>
                <p className="mt-2.5 font-mono text-[9px] tracking-[0.2em] text-slate-600 transition-colors group-hover:text-cyan-300">
                  LIHAT DECK &amp; PROFIL ▸
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── TABEL ────────────────────────────────────────── */}
      <div className="panel clip-corner overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400">
            STATISTIK DUELIST
            <span className="ml-2 text-slate-600">— KLIK BARIS UNTUK PROFIL</span>
          </p>
          <div className="flex gap-1.5">
            {(
              [
                ["rank", "PERINGKAT"],
                ["winRate", "WIN RATE"],
                ["totalDuels", "TOTAL DUEL"],
                ["stagesCleared", "STAGE"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setSortBy(k)}
                className={`clip-corner-sm border px-2.5 py-1.5 font-mono text-[9px] tracking-widest transition-all hover:-translate-y-0.5 ${
                  sortBy === k
                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                    : "border-white/10 text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari duelist…"
            className="clip-corner-sm ml-auto w-full max-w-[220px] border border-white/10 bg-[#050914] px-3 py-2 font-mono text-[11px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

        {/* header kolom */}
        <div className="hidden grid-cols-[52px_1fr_92px_92px_150px] gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-2 font-mono text-[9px] tracking-[0.2em] text-slate-600 md:grid">
          <span>#</span>
          <span>DUELIST</span>
          <span className="text-right">WIN RATE</span>
          <span className="text-right">TOTAL DUEL</span>
          <span className="text-right">STAGE SELESAI</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse bg-white/[0.03]"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        ) : view.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl opacity-40">🏆</span>
            <p className="font-display text-slate-300">TIDAK ADA DATA</p>
            <p className="max-w-sm text-sm text-slate-500">
              Belum ada duelist yang cocok dengan pencarianmu.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {view.map((r, i) => (
              <Link
                key={r.id}
                href={`/leaderboard/${toSlug(r.handle)}`}
                className="group grid grid-cols-[44px_1fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-cyan-400/[0.06] md:grid-cols-[52px_1fr_92px_92px_150px]"
                style={{ animation: `fadeIn 0.4s ${Math.min(i * 28, 500)}ms both` }}
              >
                {/* rank */}
                <span
                  className="font-display text-lg font-black tabular-nums"
                  style={{
                    color:
                      r.rank === 1
                        ? "#ffd447"
                        : r.rank === 2
                          ? "#c0d3e0"
                          : r.rank === 3
                            ? "#e08a4a"
                            : "#475569",
                  }}
                >
                  {String(r.rank).padStart(2, "0")}
                </span>

                {/* duelist */}
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    title={`Ace deck: ${r.deckStats.aceName} (${r.deckStats.maxAtk} ATK)`}
                    className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-white/10 transition-colors group-hover:border-cyan-400/60 sm:block"
                  >
                    <CardArt
                      src={
                        options.find((o) => o.id === r.deckStats.aceId)?.img ??
                        `/api/card-image/${r.deckStats.aceId}?size=small`
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[14px] font-bold text-slate-100 transition-colors group-hover:text-cyan-300">
                      {r.handle}
                    </p>
                    <p className="truncate font-mono text-[9.5px] tracking-wider text-slate-500">
                      {r.title.toUpperCase()} · {r.region.toUpperCase()}
                    </p>
                    <p className="truncate font-mono text-[9px] text-slate-600">
                      🎴 {r.deckStats.total} kartu · ace{" "}
                      <span className="text-fuchsia-400/80">{r.deckStats.aceName}</span>
                      {r.deckStats.types[0] ? ` · ${r.deckStats.types[0].name}` : ""}
                    </p>
                    {/* metrik versi mobile */}
                    <div className="mt-1.5 flex gap-3 font-mono text-[10px] md:hidden">
                      <span style={{ color: rateColor(r.winRate) }}>{r.winRate}%</span>
                      <span className="text-cyan-300">{r.totalDuels} duel</span>
                      <span className="text-amber-300">
                        {r.stagesCleared}/{summary?.totalStages ?? 26}
                      </span>
                    </div>
                  </div>
                </div>

                {/* win rate */}
                <div className="hidden text-right md:block">
                  <p
                    className="font-display text-[15px] font-black tabular-nums"
                    style={{ color: rateColor(r.winRate) }}
                  >
                    {r.winRate}%
                  </p>
                  <div className="stat-bar mt-1">
                    <span
                      style={{
                        width: `${r.winRate}%`,
                        background: `linear-gradient(90deg, ${rateColor(r.winRate)}66, ${rateColor(r.winRate)})`,
                      }}
                    />
                  </div>
                  <p className="mt-0.5 font-mono text-[8.5px] text-slate-600">
                    {r.wins}W · {r.losses}L
                  </p>
                </div>

                {/* total duel */}
                <div className="hidden text-right md:block">
                  <p className="font-display text-[15px] font-black tabular-nums text-cyan-300">
                    {r.totalDuels.toLocaleString("id-ID")}
                  </p>
                  <p className="font-mono text-[8.5px] text-slate-600">DUEL</p>
                </div>

                {/* stage */}
                <div className="hidden text-right md:block">
                  <p className="font-display text-[15px] font-black tabular-nums text-amber-300">
                    {r.stagesCleared}
                    <span className="text-[11px] text-slate-600">
                      /{summary?.totalStages ?? 26}
                    </span>
                  </p>
                  <div className="stat-bar mt-1">
                    <span
                      className="bg-gradient-to-r from-amber-600 to-amber-300"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[8.5px] text-slate-600">
                    ▸ {r.lastStage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
