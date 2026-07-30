"use client";

import { useState } from "react";

export type Build = {
  id: string;
  label: string;
  badge: string;
  icon: string;
  accent: string;
  file: string;
  size: string;
  arch: string;
  minOs: string;
  url: string;
  checksum: string;
  recommended: boolean;
  specs: { k: string; v: string }[];
  steps: { no: number; title: string; desc: string }[];
};

export default function DownloadClient({ builds }: { builds: Build[] }) {
  const [active, setActive] = useState(builds[0]?.id ?? "android");
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [copied, setCopied] = useState(false);
  const b = builds.find((x) => x.id === active) ?? builds[0];

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(b.checksum.replace("SHA-256 · ", ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard diblokir */
    }
  };

  return (
    <div>
      {/* ── KARTU UNDUHAN UTAMA ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {builds.map((x, i) => {
          const on = x.id === active;
          return (
            <div
              key={x.id}
              onClick={() => {
                setActive(x.id);
                setOpenStep(1);
              }}
              className="panel clip-corner group relative cursor-pointer overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5"
              style={{
                borderColor: on ? x.accent : "rgba(255,255,255,0.1)",
                boxShadow: on ? `0 24px 60px -30px ${x.accent}` : "none",
                animation: `rise 0.5s ${i * 90}ms both`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: `linear-gradient(90deg,transparent,${x.accent},transparent)`,
                  opacity: on ? 1 : 0.35,
                }}
              />
              {on && <div className="sweep-shine" />}

              {x.recommended && (
                <span
                  className="clip-corner-sm absolute right-4 top-4 px-2 py-1 font-mono text-[8px] font-bold tracking-wider text-black"
                  style={{ background: x.accent }}
                >
                  ⭐ POPULER
                </span>
              )}

              <div className="flex items-center gap-4">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${x.accent}15`,
                    clipPath:
                      "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                  }}
                >
                  {x.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="font-display text-xl font-black tracking-wide"
                      style={{ color: x.accent }}
                    >
                      {x.label}
                    </p>
                    <span
                      className="clip-corner-sm px-2 py-0.5 font-mono text-[10px] font-black text-black"
                      style={{ background: x.accent }}
                    >
                      {x.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] tracking-wider text-slate-500">
                    {x.minOs} · {x.arch}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="clip-corner-sm border border-white/8 bg-white/[0.02] px-3 py-2">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-slate-500">
                    UKURAN FILE
                  </p>
                  <p
                    className="font-display text-base font-black"
                    style={{ color: x.accent }}
                  >
                    {x.size}
                  </p>
                </div>
                <div className="clip-corner-sm border border-white/8 bg-white/[0.02] px-3 py-2">
                  <p className="font-mono text-[8px] tracking-[0.2em] text-slate-500">
                    FORMAT
                  </p>
                  <p className="font-display text-base font-black text-slate-200">
                    .{x.badge.toLowerCase()}
                  </p>
                </div>
              </div>

              <p className="mt-3 truncate font-mono text-[10px] text-slate-600">
                📦 {x.file}
              </p>

              <a
                href={x.url}
                onClick={(e) => e.stopPropagation()}
                className="btn-cyber clip-corner-sm mt-4 flex items-center justify-center gap-2 border py-3.5 font-display text-[12px] font-black tracking-[0.18em]"
                style={{
                  borderColor: `${x.accent}88`,
                  color: x.accent,
                  background: `${x.accent}18`,
                }}
              >
                ⬇ UNDUH {x.badge}
              </a>
            </div>
          );
        })}
      </div>

      {/* ── CHECKSUM ────────────────────────────────────── */}
      <div className="panel clip-corner mt-4 flex flex-wrap items-center gap-3 p-4">
        <span className="font-mono text-[9px] tracking-[0.28em] text-slate-500">
          VERIFIKASI FILE
        </span>
        <code className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-slate-400">
          {b.checksum}
        </code>
        <button
          onClick={copyHash}
          className="clip-corner-sm shrink-0 border border-white/10 px-3 py-1.5 font-mono text-[10px] tracking-widest text-slate-400 transition-colors hover:border-cyan-400 hover:text-cyan-300"
        >
          {copied ? "✓ TERSALIN" : "⧉ SALIN HASH"}
        </button>
      </div>

      {/* ── SPESIFIKASI ─────────────────────────────────── */}
      <div className="panel clip-corner mt-6 p-6">
        <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: b.accent }}>
          SPESIFIKASI MINIMUM — {b.label} ({b.badge})
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {b.specs.map((s, i) => (
            <div
              key={s.k}
              className="clip-corner-sm border border-white/8 bg-white/[0.02] p-3"
              style={{ animation: `fadeIn 0.4s ${i * 60}ms both` }}
            >
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-slate-500">{s.k}</p>
              <p className="mt-1 text-[12px] font-semibold leading-snug text-slate-200">
                {s.v}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── LANGKAH PEMASANGAN ──────────────────────────── */}
      <div className="mt-8">
        <h3 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.12em] text-white">
          CARA MEMASANG — {b.label}
        </h3>
        <div className="mt-5 space-y-2">
          {b.steps.map((s) => {
            const open = openStep === s.no;
            return (
              <button
                key={s.no}
                onClick={() => setOpenStep(open ? null : s.no)}
                className="panel clip-corner-sm block w-full overflow-hidden p-0 text-left transition-colors"
                style={{ borderColor: open ? `${b.accent}55` : "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3 p-4">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center font-display text-sm font-black transition-transform duration-300"
                    style={{
                      background: open ? b.accent : `${b.accent}1f`,
                      color: open ? "#04060f" : b.accent,
                      clipPath:
                        "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                      transform: open ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {s.no}
                  </span>
                  <span className="flex-1 font-display text-[14px] font-bold tracking-wide text-slate-100">
                    {s.title}
                  </span>
                  <span
                    className="font-mono text-xs transition-transform duration-300"
                    style={{
                      color: b.accent,
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </div>
                <div
                  className="grid transition-[grid-template-rows] duration-300"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-white/5 px-4 py-3 pl-16 text-[13px] leading-relaxed text-slate-400">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
