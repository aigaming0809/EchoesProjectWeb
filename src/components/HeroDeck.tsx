"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CardArt } from "./HoloCard";

export type HeroCard = {
  id: number;
  name: string;
  atk: number;
  def: number;
  type: string;
  attribute: string;
  img: string;
};

/** Fanned 3D card stack that reacts to pointer + auto-rotates the featured card. */
export default function HeroDeck({ cards }: { cards: HeroCard[] }) {
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % cards.length), 3200);
    return () => clearInterval(t);
  }, [cards.length, paused]);

  const onMove = (e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 18, y: px * 22 });
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        setTilt({ x: 0, y: 0 });
      }}
      className="relative mx-auto flex h-[420px] w-full max-w-[520px] items-center justify-center"
      style={{ perspective: "1200px" }}
    >
      <div
        className="absolute h-[300px] w-[300px] rounded-full bg-cyan-500/20 blur-[80px] anim-pulse-glow"
        aria-hidden
      />
      <div
        className="absolute h-[420px] w-[420px] rounded-full border border-cyan-500/20 anim-spin-slow"
        style={{
          maskImage: "conic-gradient(from 0deg, #000, transparent 40%, #000 80%)",
        }}
        aria-hidden
      />
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {cards.map((c, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);
          const isActive = offset === 0;
          return (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              aria-label={c.name}
              className="absolute left-1/2 top-1/2 h-[300px] w-[206px] cursor-pointer"
              style={{
                transform: `translate(-50%,-50%) translateX(${offset * 78}px) translateZ(${
                  isActive ? 90 : 30 - abs * 24
                }px) rotateY(${offset * -13}deg) rotateZ(${offset * 2.4}deg) scale(${
                  isActive ? 1.08 : 0.9 - abs * 0.04
                })`,
                zIndex: 30 - abs,
                opacity: abs > 3 ? 0 : 1,
                transition: "transform 620ms cubic-bezier(0.22,1,0.36,1), opacity 400ms ease",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className={`holo-wrap relative h-full w-full ${isActive ? "anim-float" : ""}`}
              >
                <div
                  className="clip-corner-sm relative h-full w-full overflow-hidden border-2 bg-[#070b18]"
                  style={{
                    borderColor: isActive ? "#00f0ff" : "rgba(0,240,255,0.22)",
                    boxShadow: isActive
                      ? "0 30px 70px -22px rgba(0,240,255,0.75), 0 0 0 1px rgba(255,43,214,0.35)"
                      : "0 16px 40px -22px rgba(0,0,0,0.9)",
                  }}
                >
                  <CardArt
                    src={c.img}
                    alt={c.name}
                    eager={i < 3}
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="holo-layer"
                    style={{ opacity: isActive ? 0.42 : 0.14 }}
                  />
                  <div className="holo-sparkle" style={{ opacity: isActive ? 0.4 : 0 }} />
                  {isActive && <div className="sweep-shine" />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2 pt-8">
                    <p className="truncate font-display text-[11px] font-bold tracking-wide text-white">
                      {c.name}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between font-mono text-[10px]">
                      <span className="text-rose-400">ATK {c.atk}</span>
                      <span className="text-sky-400">DEF {c.def}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(i)}
            aria-label={`Show ${c.name}`}
            className={`h-1 transition-all duration-300 ${
              i === active ? "w-8 bg-cyan-400" : "w-3 bg-slate-700 hover:bg-slate-500"
            }`}
          />
        ))}
      </div>

      <Link
        href={`/cards/${cards[active]?.id ?? 1}`}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.3em] text-cyan-400 hover:text-fuchsia-400"
      >
        ▸ INSPECT #{String(cards[active]?.id ?? 1).padStart(3, "0")}
      </Link>
    </div>
  );
}
