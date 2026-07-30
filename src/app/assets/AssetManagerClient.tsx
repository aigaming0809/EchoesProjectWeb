"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CardArt } from "@/components/HoloCard";
import JsonToolClient from "./JsonToolClient";

export type DuelistRow = {
  slug: string;
  name: string;
  faction: string;
  portraitFile: string;
  avatarFile: string;
  img: string;
  hasPortrait: boolean;
  hasAvatar: boolean;
};

export type AssetRow = {
  id: number;
  name: string;
  type: string;
  attribute: string;
  filename: string;
  img: string;
  local: boolean;
};

export default function AssetManagerClient({
  rows,
  unmatched,
  duelists,
  duelistUnmatched,
}: {
  rows: AssetRow[];
  unmatched: string[];
  duelists: DuelistRow[];
  duelistUnmatched: string[];
}) {
  const [tab, setTab] = useState<"cards" | "duelists" | "jsontool">("cards");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "local" | "cdn">("all");
  const [copied, setCopied] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "local" && !r.local) return false;
      if (filter === "cdn" && r.local) return false;
      if (!key) return true;
      return (
        r.name.toLowerCase().includes(key) ||
        String(r.id) === key ||
        r.filename.includes(key)
      );
    });
  }, [rows, q, filter]);

  const localCount = rows.filter((r) => r.local).length;
  const pct = Math.round((localCount / rows.length) * 100);
  const dCount = duelists.filter((d) => d.hasPortrait).length;
  const dPct = Math.round((dCount / Math.max(duelists.length, 1)) * 100);

  const copy = async (row: AssetRow) => {
    try {
      await navigator.clipboard.writeText(row.filename);
      setCopied(row.id);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* clipboard diblokir */
    }
  };

  return (
    <div className="space-y-6">
      {/* SWITCH TAB */}
      <div className="panel clip-corner flex flex-wrap items-center gap-2 p-4">
        {(
          [
            ["cards", "🎴 KARTU", `${localCount}/${rows.length}`, "#00f0ff"],
            ["duelists", "🧑‍🎤 DUELIST", `${dCount}/${duelists.length}`, "#ff2bd6"],
            ["jsontool", "⚙️ JSON NORMALIZER", "NEW", "#9dff3c"],
          ] as const
        ).map(([v, label, count, color]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className="clip-corner-sm border px-4 py-2.5 font-display text-[12px] font-bold tracking-[0.14em] transition-all hover:-translate-y-0.5"
            style={
              tab === v
                ? { borderColor: color, background: `${color}22`, color, boxShadow: `0 0 18px -6px ${color}` }
                : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
            }
          >
            {label} <span className="ml-1 font-mono text-[10px] opacity-70">{count}</span>
          </button>
        ))}
        <p className="ml-auto font-mono text-[10px] leading-relaxed text-slate-500">
          {tab === "cards" ? "public/image/arworks/" : tab === "duelists" ? "public/duelists/" : "src/data/cards.json"}
        </p>
      </div>

      {tab === "jsontool" ? (
        <JsonToolClient />
      ) : tab === "duelists" ? (
        <DuelistPanel
          duelists={duelists}
          unmatched={duelistUnmatched}
          count={dCount}
          pct={dPct}
        />
      ) : (
      <>
      {/* PROGRESS */}
      <div className="panel clip-corner p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
              STATUS ASET LOKAL
            </p>
            <p className="mt-1 font-display text-3xl font-black text-white">
              {localCount}
              <span className="text-slate-600"> / {rows.length}</span>
              <span className="ml-3 text-base text-cyan-300">{pct}%</span>
            </p>
          </div>
          <div className="flex gap-2">
            {(
              [
                ["all", `SEMUA (${rows.length})`, "#00f0ff"],
                ["local", `LOKAL (${localCount})`, "#9dff3c"],
                ["cdn", `BELUM ADA (${rows.length - localCount})`, "#ff2bd6"],
              ] as const
            ).map(([v, label, color]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className="clip-corner-sm border px-3 py-2 font-mono text-[10px] tracking-widest transition-all hover:-translate-y-0.5"
                style={
                  filter === v
                    ? { borderColor: color, background: `${color}22`, color }
                    : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="stat-bar mt-4 h-2">
          <span
            className="bg-gradient-to-r from-cyan-500 via-lime-400 to-lime-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] text-slate-500">
          Kartu tanpa gambar lokal menampilkan placeholder berisi nama file yang dibutuhkan.
        </p>
      </div>

      {unmatched.length > 0 && (
        <div className="clip-corner-sm border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="font-mono text-[10px] tracking-widest text-amber-300">
            ⚠️ {unmatched.length} FILE TIDAK DIKENALI
          </p>
          <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-amber-200/80">
            {unmatched.slice(0, 12).join(" · ")}
            {unmatched.length > 12 ? ` … +${unmatched.length - 12} lagi` : ""}
          </p>
        </div>
      )}

      {/* SEARCH */}
      <div className="panel clip-corner p-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kartu untuk melihat nama file yang dibutuhkan…"
            className="clip-corner-sm w-full border border-cyan-500/30 bg-[#050914] px-4 py-3 pl-10 font-mono text-[13px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400 focus:shadow-[0_0_22px_-6px_rgba(0,240,255,0.8)]"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500">⌕</span>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-600">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.slice(0, 240).map((r, i) => (
          <div
            key={r.id}
            className="panel clip-corner-sm group flex items-center gap-3 p-2.5 transition-all hover:-translate-y-0.5"
            style={{
              borderColor: r.local ? "rgba(157,255,60,0.28)" : "rgba(255,255,255,0.08)",
              animation: `fadeIn 0.35s ${Math.min(i * 12, 400)}ms both`,
            }}
          >
            <Link href={`/cards/${r.id}`} className="shrink-0">
              <div className="h-14 w-14 overflow-hidden rounded-sm border border-white/10">
                <CardArt src={r.img} alt={r.name} className="h-full w-full object-cover" />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[12px] font-bold text-slate-200">
                {r.name}
              </p>
              <button
                onClick={() => copy(r)}
                title="Klik untuk menyalin nama file"
                className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 transition-colors hover:text-fuchsia-400"
              >
                📄 {r.filename}
                <span className="text-slate-600">
                  {copied === r.id ? "✓ tersalin" : "⧉"}
                </span>
              </button>
            </div>
            <span
              className="hex-chip shrink-0 px-2 py-1 font-mono text-[8px] font-bold text-black"
              style={{ background: r.local ? "#9dff3c" : "#334155" }}
            >
              {r.local ? "LOKAL" : "KOSONG"}
            </span>
          </div>
        ))}
      </div>

      {filtered.length > 240 && (
        <p className="text-center font-mono text-[10px] tracking-widest text-slate-600">
          MENAMPILKAN 240 DARI {filtered.length} — GUNAKAN PENCARIAN UNTUK MEMPERSEMPIT
        </p>
      )}
      </>
      )}
    </div>
  );
}

/* ── PANEL DUELIST ──────────────────────────────────────────── */
function DuelistPanel({
  duelists,
  unmatched,
  count,
  pct,
}: {
  duelists: DuelistRow[];
  unmatched: string[];
  count: number;
  pct: number;
}) {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const view = useMemo(() => {
    const k = q.trim().toLowerCase();
    return k
      ? duelists.filter(
          (d) =>
            d.name.toLowerCase().includes(k) ||
            d.slug.includes(k) ||
            d.faction.toLowerCase().includes(k),
        )
      : duelists;
  }, [duelists, q]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* clipboard diblokir */
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel clip-corner p-6">
        <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
          STATUS POTRET DUELIST
        </p>
        <p className="mt-1 font-display text-3xl font-black text-white">
          {count}
          <span className="text-slate-600"> / {duelists.length}</span>
          <span className="ml-3 text-base text-fuchsia-300">{pct}%</span>
        </p>
        <div className="stat-bar mt-4 h-2">
          <span
            className="bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-amber-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
          Taruh potret duelist di folder{" "}
          <code className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[11px] text-fuchsia-300">
            public/duelists/
          </code>{" "}
          memakai <b className="text-slate-200">slug</b> sebagai nama file. Tambahkan
          suffix <code className="font-mono text-[11px] text-amber-300">-avatar</code> untuk
          versi ikon kecil.
        </p>
      </div>

      {unmatched.length > 0 && (
        <div className="clip-corner-sm border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="font-mono text-[10px] tracking-widest text-amber-300">
            ⚠️ {unmatched.length} FILE TIDAK DIKENALI
          </p>
          <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-amber-200/80">
            {unmatched.slice(0, 12).join(" · ")}
            {unmatched.length > 12 ? ` … +${unmatched.length - 12} lagi` : ""}
          </p>
        </div>
      )}

      <div className="panel clip-corner p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari duelist untuk melihat nama file yang dibutuhkan…"
          className="clip-corner-sm w-full border border-fuchsia-500/30 bg-[#050914] px-4 py-3 font-mono text-[13px] text-fuchsia-100 outline-none placeholder:text-slate-600 focus:border-fuchsia-400"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {view.map((d, i) => (
          <div
            key={d.slug}
            className="panel clip-corner-sm flex items-center gap-3 p-2.5 transition-all hover:-translate-y-0.5"
            style={{
              borderColor: d.hasPortrait ? "rgba(157,255,60,0.28)" : "rgba(255,255,255,0.08)",
              animation: `fadeIn 0.35s ${Math.min(i * 14, 380)}ms both`,
            }}
          >
            <Link href={`/characters/${d.slug}`} className="shrink-0">
              <div className="relative h-16 w-12 overflow-hidden rounded-sm border border-white/10">
                <CardArt src={d.img} alt={d.name} className="h-full w-full object-cover" />
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[12.5px] font-bold text-slate-200">
                {d.name}
              </p>
              <p className="truncate font-mono text-[9px] text-slate-600">{d.faction}</p>
              <button
                onClick={() => copy(d.portraitFile, d.slug + "-p")}
                title="Klik untuk menyalin nama file"
                className="mt-1 block truncate font-mono text-[10px] text-fuchsia-400 hover:text-cyan-300"
              >
                🖼️ {d.portraitFile} {copied === d.slug + "-p" ? "✓" : "⧉"}
              </button>
              <button
                onClick={() => copy(d.avatarFile, d.slug + "-a")}
                title="Klik untuk menyalin nama file avatar"
                className="block truncate font-mono text-[10px] text-amber-400/80 hover:text-cyan-300"
              >
                ⭕ {d.avatarFile} {copied === d.slug + "-a" ? "✓" : "⧉"}
              </button>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <span
                className="hex-chip px-1.5 py-0.5 font-mono text-[7.5px] font-bold text-black"
                style={{ background: d.hasPortrait ? "#9dff3c" : "#334155" }}
              >
                {d.hasPortrait ? "POTRET" : "KOSONG"}
              </span>
              <span
                className="hex-chip px-1.5 py-0.5 font-mono text-[7.5px] font-bold text-black"
                style={{ background: d.hasAvatar ? "#ffc857" : "#334155" }}
              >
                {d.hasAvatar ? "AVATAR" : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
