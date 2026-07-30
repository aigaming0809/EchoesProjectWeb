"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type HoloCardData = {
  id: number;
  name: string;
  img: string;
  type: string;
  attribute: string;
  level: number;
  atk: number;
  def: number;
  zodiac: string[];
};

const ATTR_COLORS: Record<string, string> = {
  Light: "#ffe36e",
  Dark: "#a855f7",
  Earth: "#b98b4e",
  Water: "#38bdf8",
  Fire: "#ff5a3c",
  Wind: "#4ade80",
  Magic: "#2dd4bf",
  Trap: "#f472b6",
};

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='464'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%230a1030'/><stop offset='1' stop-color='%23180a2e'/></linearGradient></defs><rect width='320' height='464' fill='url(%23g)'/><text x='160' y='232' fill='%2300f0ff' font-family='monospace' font-size='16' text-anchor='middle'>NO IMAGE</text></svg>`,
  );

export function CardArt({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [current, setCurrent] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const retries = useRef(0);

  // src bisa berganti tanpa komponen ini di-unmount (mis. ganti kartu di Fusion
  // Lab). useState(src) cuma jadi nilai awal, jadi tanpa ini gambar lama akan
  // nyangkut walau prop src sudah berubah.
  useEffect(() => {
    retries.current = 0;
    setCurrent(src);
    setLoaded(false);
  }, [src]);

  const handleError = () => {
    if (retries.current < 1 && !current.startsWith("data:")) {
      retries.current += 1;
      const sep = src.includes("?") ? "&" : "?";
      setCurrent(`${src}${sep}retry=${Date.now()}`);
      return;
    }
    setCurrent(FALLBACK);
    setLoaded(true);
  };

  return (
    <>
      {!loaded && (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#0a1030] via-[#120a26] to-[#1a0a2e]"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

export default function HoloCard({
  card,
  href,
  intensity = 14,
  showStats = true,
  index = 0,
}: {
  card: HoloCardData;
  href?: string;
  intensity?: number;
  showStats?: boolean;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rafRef.current = requestAnimationFrame(() => {
      const rx = (0.5 - py) * intensity * 2;
      const ry = (px - 0.5) * intensity * 2;
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(
        2,
      )}deg) translateZ(18px) scale(1.03)`;
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      const layer = el.querySelector<HTMLElement>(".holo-layer");
      if (layer) {
        layer.style.backgroundPosition = `${(px * 100).toFixed(0)}% ${(py * 100).toFixed(0)}%`;
      }
      const sparkle = el.querySelector<HTMLElement>(".holo-sparkle");
      if (sparkle) {
        sparkle.style.backgroundPosition = `${(px * 60).toFixed(0)}px ${(py * 60).toFixed(
          0,
        )}px, ${(px * -40).toFixed(0)}px ${(py * 40).toFixed(0)}px, ${(px * 30).toFixed(
          0,
        )}px ${(py * -30).toFixed(0)}px, ${(px * 50).toFixed(0)}px ${(py * 20).toFixed(
          0,
        )}px, ${(px * -25).toFixed(0)}px ${(px * -45).toFixed(0)}px`;
      }
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    el.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)";
  };

  const accent = ATTR_COLORS[card.attribute] ?? "#00f0ff";
  const isMonster = !["Magic", "Trap", "Ritual", "Equip"].includes(card.type);

  const inner = (
    <div
      className="holo-wrap group relative anim-rise"
      style={{ animationDelay: `${Math.min(index * 35, 500)}ms` }}
    >
      <div className="holo-shadow" />
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="holo-card clip-corner-sm relative overflow-hidden border bg-[#070b18]"
        style={{ borderColor: `${accent}44` }}
      >
        <div className="relative aspect-[59/86] w-full overflow-hidden bg-[#080d1f]">
          {/* Key on src ensures React unmounts/remounts and resets image state cleanly without effect */}
          <CardArt
            key={card.img}
            src={card.img}
            alt={card.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
          <div className="holo-layer" />
          <div className="holo-sparkle" />
          <div className="holo-glare" />
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
          />
          <div className="absolute left-1 top-1 flex items-center gap-1">
            <span className="bg-black/75 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-cyan-300">
              #{String(card.id).padStart(3, "0")}
            </span>
          </div>
          <div className="absolute right-1 top-1">
            <span
              className="hex-chip px-2 py-0.5 font-mono text-[9px] font-bold text-black"
              style={{ background: accent }}
            >
              {card.attribute.slice(0, 3).toUpperCase()}
            </span>
          </div>
          {isMonster && (
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black via-black/80 to-transparent px-1.5 pb-1 pt-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-mono text-[10px] font-bold text-rose-400">
                {card.atk}
              </span>
              <span className="font-mono text-[9px] text-amber-300">★{card.level}</span>
              <span className="font-mono text-[10px] font-bold text-sky-400">
                {card.def}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-1.5 px-0.5">
        <p className="truncate font-display text-[11px] font-semibold text-slate-200 transition-colors group-hover:text-cyan-300">
          {card.name}
        </p>
        {showStats && (
          <p className="truncate font-mono text-[9px] uppercase tracking-wider text-slate-500">
            {card.type}
            {isMonster && card.zodiac.length > 0 ? ` · ${card.zodiac.join("/")}` : ""}
          </p>
        )}
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block focus:outline-none">
      {inner}
    </Link>
  );
}