"use client";

import { useCallback, useRef, useState } from "react";
import { CardArt } from "./HoloCard";

export default function BigHoloCard({
  img,
  name,
  accent,
  id,
  desc,
  stats,
}: {
  img: string;
  name: string;
  accent: string;
  id: number;
  desc: string;
  stats: { label: string; value: string }[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [flipped, setFlipped] = useState(false);
  const raf = useRef(0);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${((0.5 - py) * 26).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${((px - 0.5) * 30).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      const layer = el.querySelector<HTMLElement>(".holo-layer");
      if (layer) layer.style.backgroundPosition = `${px * 130}% ${py * 130}%`;
    });
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <div className="holo-wrap select-none" style={{ perspective: "1300px" }}>
      <div className="holo-shadow" style={{ opacity: 0.6 }} />
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={() => setFlipped((v) => !v)}
        className="relative aspect-[59/86] w-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform:
            "rotateX(var(--rx,0deg)) rotateY(calc(var(--ry,0deg) + var(--flip,0deg)))",
          transition: "transform 500ms cubic-bezier(0.22,1,0.36,1)",
          // @ts-expect-error custom property
          "--flip": flipped ? "180deg" : "0deg",
        }}
      >
        {/* FRONT */}
        <div
          className="clip-corner absolute inset-0 overflow-hidden border-2 bg-[#070b18]"
          style={{
            borderColor: accent,
            backfaceVisibility: "hidden",
            boxShadow: `0 40px 90px -30px ${accent}aa, 0 0 0 1px ${accent}55`,
          }}
        >
          <CardArt src={img} alt={name} eager className="h-full w-full object-cover" />
          <div className="holo-layer" style={{ opacity: 0.5 }} />
          <div className="holo-sparkle" style={{ opacity: 0.45 }} />
          <div className="holo-glare" style={{ opacity: 0.9 }} />
          <div className="sweep-shine" />
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
          />
          <span className="absolute left-2 top-2 bg-black/80 px-2 py-0.5 font-mono text-[10px] tracking-widest text-cyan-300">
            #{String(id).padStart(3, "0")}
          </span>
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 font-mono text-[9px] tracking-widest text-slate-400">
            KLIK UNTUK BALIK ⟳
          </span>
        </div>

        {/* BACK */}
        <div
          className="clip-corner absolute inset-0 overflow-hidden border-2 bg-gradient-to-br from-[#0a1130] to-[#1a0a2e] p-5"
          style={{
            borderColor: accent,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="cyber-grid absolute inset-0 opacity-40" />
          <div className="relative flex h-full flex-col">
            <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: accent }}>
              CARD DOSSIER
            </p>
            <h3 className="mt-1 font-display text-lg font-black leading-tight text-white">
              {name}
            </h3>
            <p className="mt-3 flex-1 overflow-auto text-[12.5px] italic leading-relaxed text-slate-300">
              “{desc}”
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {stats.map((s) => (
                <div key={s.label} className="border border-white/10 bg-black/30 px-2 py-1.5">
                  <p className="font-mono text-[8px] tracking-widest text-slate-500">{s.label}</p>
                  <p className="font-display text-[12px] font-bold text-slate-100">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
