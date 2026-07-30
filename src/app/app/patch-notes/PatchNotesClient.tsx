"use client";

import { useMemo, useState } from "react";

type Change = { tag: string; text: string };
type Release = {
  version: string;
  date: string;
  codename: string;
  type: string;
  accent: string;
  summary: string;
  changes: Change[];
};

const TAG_STYLE: Record<string, { bg: string; label: string }> = {
  NEW: { bg: "#9dff3c", label: "BARU" },
  CHANGE: { bg: "#00f0ff", label: "UBAH" },
  FIX: { bg: "#fb7185", label: "PERBAIKAN" },
  REMOVE: { bg: "#94a3b8", label: "HAPUS" },
};

const FILTERS = [
  ["all", "SEMUA", "#00f0ff"],
  ["NEW", "BARU", "#9dff3c"],
  ["CHANGE", "PERUBAHAN", "#00f0ff"],
  ["FIX", "PERBAIKAN", "#fb7185"],
] as const;

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const bulan = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${d} ${bulan[m - 1]} ${y}`;
}

export default function PatchNotesClient({ releases }: { releases: Release[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<Set<string>>(new Set([releases[0]?.version]));

  const toggle = (v: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });

  const stats = useMemo(() => {
    let n = 0, c = 0, f = 0;
    releases.forEach((r) =>
      r.changes.forEach((ch) => {
        if (ch.tag === "NEW") n++;
        else if (ch.tag === "CHANGE") c++;
        else if (ch.tag === "FIX") f++;
      }),
    );
    return { total: releases.length, n, c, f };
  }, [releases]);

  const view = useMemo(
    () =>
      releases
        .map((r) => ({
          ...r,
          changes: filter === "all" ? r.changes : r.changes.filter((c) => c.tag === filter),
        }))
        .filter((r) => r.changes.length > 0),
    [releases, filter],
  );

  return (
    <div>
      {/* RINGKASAN */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["TOTAL RILIS", stats.total, "#ffc857", "📦"],
          ["FITUR BARU", stats.n, "#9dff3c", "✨"],
          ["PERUBAHAN", stats.c, "#00f0ff", "🔄"],
          ["PERBAIKAN", stats.f, "#fb7185", "🔧"],
        ].map(([l, v, c, icon], i) => (
          <div
            key={l as string}
            className="panel clip-corner relative overflow-hidden p-5"
            style={{ animation: `rise 0.5s ${i * 70}ms both` }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg,transparent,${c},transparent)` }}
            />
            <div className="absolute -right-2 -top-2 text-4xl opacity-10">{icon as string}</div>
            <p
              className="font-display text-3xl font-black tabular-nums"
              style={{ color: c as string, textShadow: `0 0 20px ${c}55` }}
            >
              {v as number}
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-slate-500">
              {l as string}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER */}
      <div className="panel clip-corner mt-6 flex flex-wrap items-center gap-2 p-4">
        <span className="font-mono text-[9px] tracking-[0.28em] text-slate-500">FILTER</span>
        {FILTERS.map(([v, label, color]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="clip-corner-sm border px-3 py-1.5 font-mono text-[10px] tracking-widest transition-all hover:-translate-y-0.5"
            style={
              filter === v
                ? { borderColor: color, background: `${color}22`, color }
                : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
            }
          >
            {label}
          </button>
        ))}
        <button
          onClick={() =>
            setOpen(open.size === releases.length ? new Set() : new Set(releases.map((r) => r.version)))
          }
          className="clip-corner-sm ml-auto border border-white/10 px-3 py-1.5 font-mono text-[10px] tracking-widest text-slate-400 hover:border-cyan-400 hover:text-cyan-300"
        >
          {open.size === releases.length ? "▲ TUTUP SEMUA" : "▼ BUKA SEMUA"}
        </button>
      </div>

      {/* TIMELINE */}
      <div className="relative mt-8">
        <div className="absolute left-[15px] top-2 hidden h-full w-px bg-gradient-to-b from-fuchsia-500/60 via-cyan-500/30 to-transparent md:block" />

        <div className="space-y-4">
          {view.map((r, i) => {
            const isOpen = open.has(r.version);
            const latest = i === 0 && filter === "all";
            return (
              <section key={r.version} className="relative md:pl-12">
                <span
                  className="absolute left-0 top-6 hidden h-8 w-8 items-center justify-center rounded-full border-2 bg-[#04060f] md:flex"
                  style={{ borderColor: r.accent }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: r.accent }}
                  />
                  {latest && (
                    <span
                      className="absolute inset-0 animate-ping rounded-full opacity-25"
                      style={{ background: r.accent }}
                    />
                  )}
                </span>

                <article
                  className="panel clip-corner overflow-hidden"
                  style={{
                    borderColor: `${r.accent}33`,
                    animation: `rise 0.5s ${Math.min(i * 70, 400)}ms both`,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg,transparent,${r.accent},transparent)`,
                    }}
                  />

                  <button
                    onClick={() => toggle(r.version)}
                    className="flex w-full flex-wrap items-center gap-3 p-5 text-left"
                  >
                    <span
                      className="clip-corner-sm px-3 py-1.5 font-display text-[15px] font-black tracking-wide text-black"
                      style={{ background: r.accent }}
                    >
                      {r.version}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span
                          className="font-display text-[14px] font-black tracking-[0.14em]"
                          style={{ color: r.accent }}
                        >
                          {r.codename}
                        </span>
                        {latest && (
                          <span className="clip-corner-sm border border-lime-400/50 bg-lime-400/15 px-2 py-0.5 font-mono text-[8.5px] tracking-wider text-lime-300">
                            TERBARU
                          </span>
                        )}
                        <span
                          className="clip-corner-sm border px-2 py-0.5 font-mono text-[8.5px] tracking-wider"
                          style={{
                            borderColor: r.type === "major" ? "#ff2bd644" : "#00f0ff44",
                            color: r.type === "major" ? "#ff2bd6" : "#00f0ff",
                          }}
                        >
                          {r.type.toUpperCase()}
                        </span>
                      </p>
                      <p className="mt-1 font-mono text-[9.5px] tracking-[0.18em] text-slate-500">
                        {fmtDate(r.date)} · {r.changes.length} PERUBAHAN
                      </p>
                    </div>
                    <span
                      className="font-mono text-xs transition-transform duration-300"
                      style={{
                        color: r.accent,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-400"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-white/8 p-5">
                        <p className="text-[13px] leading-relaxed text-slate-300">
                          {r.summary}
                        </p>
                        <ul className="mt-4 space-y-2">
                          {r.changes.map((c, k) => {
                            const st = TAG_STYLE[c.tag] ?? TAG_STYLE.CHANGE;
                            return (
                              <li
                                key={k}
                                className="flex items-start gap-2.5"
                                style={{ animation: `fadeIn 0.3s ${k * 40}ms both` }}
                              >
                                <span
                                  className="clip-corner-sm mt-0.5 shrink-0 px-1.5 py-0.5 font-mono text-[8px] font-bold text-black"
                                  style={{ background: st.bg, minWidth: 62, textAlign: "center" }}
                                >
                                  {st.label}
                                </span>
                                <span className="text-[12.5px] leading-relaxed text-slate-400">
                                  {c.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            );
          })}
        </div>
      </div>

      {view.length === 0 && (
        <p className="py-16 text-center font-mono text-[11px] tracking-widest text-slate-600">
          TIDAK ADA PERUBAHAN DI KATEGORI INI
        </p>
      )}
    </div>
  );
}
