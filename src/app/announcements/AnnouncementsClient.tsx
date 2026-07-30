"use client";

import { useMemo, useState } from "react";

type Ann = {
  id: string;
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  author: string;
  accent: string;
  icon: string;
  excerpt: string;
  body: string;
};

type Cat = { id: string; label: string; accent: string };

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d} ${bulan[m - 1]} ${y}`;
}

/** Berapa hari lalu (relatif terhadap tanggal terbaru di data). */
function daysAgo(iso: string, newest: string) {
  const a = new Date(iso).getTime();
  const b = new Date(newest).getTime();
  const diff = Math.round((b - a) / 86400000);
  if (diff <= 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari lalu`;
  if (diff < 30) return `${Math.floor(diff / 7)} minggu lalu`;
  return `${Math.floor(diff / 30)} bulan lalu`;
}

export default function AnnouncementsClient({
  announcements,
  categories,
}: {
  announcements: Ann[];
  categories: Cat[];
}) {
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const newest = useMemo(
    () => announcements.map((a) => a.date).sort().reverse()[0] ?? "",
    [announcements],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: announcements.length };
    announcements.forEach((a) => (c[a.category] = (c[a.category] ?? 0) + 1));
    return c;
  }, [announcements]);

  const view = useMemo(() => {
    const k = q.trim().toLowerCase();
    return announcements
      .filter((a) => (cat === "all" ? true : a.category === cat))
      .filter((a) =>
        k ? a.title.toLowerCase().includes(k) || a.excerpt.toLowerCase().includes(k) : true,
      )
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.date.localeCompare(a.date);
      });
  }, [announcements, cat, q]);

  const catOf = (id: string) => categories.find((c) => c.id === id);

  return (
    <div>
      {/* FILTER */}
      <div className="panel clip-corner flex flex-wrap items-center gap-2 p-4">
        {categories.map((c) => {
          const n = counts[c.id] ?? 0;
          if (c.id !== "all" && n === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="clip-corner-sm border px-3 py-1.5 font-mono text-[10px] tracking-widest transition-all hover:-translate-y-0.5"
              style={
                cat === c.id
                  ? { borderColor: c.accent, background: `${c.accent}22`, color: c.accent }
                  : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
              }
            >
              {c.label} <span className="opacity-60">{n}</span>
            </button>
          );
        })}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari pengumuman…"
          className="clip-corner-sm ml-auto w-full max-w-[240px] border border-white/10 bg-[#050914] px-3 py-2 font-mono text-[11px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        />
      </div>

      {/* LIST */}
      <div className="mt-6 space-y-4">
        {view.map((a, i) => {
          const isOpen = openId === a.id;
          const c = catOf(a.category);
          const fresh = a.date === newest;
          return (
            <article
              key={a.id}
              className="panel clip-corner relative overflow-hidden transition-transform duration-300"
              style={{
                borderColor: a.pinned ? `${a.accent}55` : `${a.accent}22`,
                animation: `rise 0.5s ${Math.min(i * 60, 400)}ms both`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg,transparent,${a.accent},transparent)`,
                }}
              />
              {a.pinned && <div className="sweep-shine" />}

              <button
                onClick={() => setOpenId(isOpen ? null : a.id)}
                className="group flex w-full items-start gap-4 p-5 text-left"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${a.accent}15`,
                    clipPath:
                      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  }}
                >
                  {a.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned && (
                      <span
                        className="clip-corner-sm px-2 py-0.5 font-mono text-[8px] font-bold tracking-wider text-black"
                        style={{ background: a.accent }}
                      >
                        📌 DISEMATKAN
                      </span>
                    )}
                    {fresh && (
                      <span className="clip-corner-sm flex items-center gap-1 border border-lime-400/50 bg-lime-400/15 px-2 py-0.5 font-mono text-[8px] tracking-wider text-lime-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
                        BARU
                      </span>
                    )}
                    {c && (
                      <span
                        className="clip-corner-sm border px-2 py-0.5 font-mono text-[8px] tracking-wider"
                        style={{
                          borderColor: `${c.accent}55`,
                          color: c.accent,
                          background: `${c.accent}12`,
                        }}
                      >
                        {c.label}
                      </span>
                    )}
                  </div>

                  <h2
                    className="mt-2 font-display text-lg font-black leading-snug tracking-wide text-white transition-colors group-hover:text-cyan-300 md:text-xl"
                    style={{ textShadow: `0 0 24px ${a.accent}33` }}
                  >
                    {a.title}
                  </h2>

                  <p className="mt-1.5 font-mono text-[9.5px] tracking-[0.16em] text-slate-500">
                    {fmtDate(a.date)} · {daysAgo(a.date, newest)} · oleh {a.author}
                  </p>

                  {!isOpen && (
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                      {a.excerpt}
                    </p>
                  )}
                </div>

                <span
                  className="mt-1 shrink-0 font-mono text-xs transition-transform duration-300"
                  style={{
                    color: a.accent,
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
                  <div className="border-t border-white/8 px-5 py-4 md:pl-[84px]">
                    {a.body.split("\n\n").map((par, k) => (
                      <p
                        key={k}
                        className="mb-3 text-[13.5px] leading-relaxed text-slate-300 last:mb-0"
                      >
                        {par}
                      </p>
                    ))}
                    <div
                      className="clip-corner-sm mt-4 border-l-2 bg-white/[0.02] px-4 py-2"
                      style={{ borderColor: a.accent }}
                    >
                      <p className="font-mono text-[9px] tracking-[0.2em] text-slate-500">
                        ID: {a.id.toUpperCase()} · KATEGORI: {a.category.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {view.length === 0 && (
        <div className="panel clip-corner mt-6 flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl opacity-40">📭</span>
          <p className="font-display text-slate-300">TIDAK ADA PENGUMUMAN</p>
          <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      )}
    </div>
  );
}
