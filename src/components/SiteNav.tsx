"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "HOME", code: "00" },
  { href: "/cards", label: "CARD DB", code: "01" },
  { href: "/characters", label: "DUELIST", code: "02" },
  { href: "/story", label: "ALUR", code: "03" },
  { href: "/fusion", label: "FUSION", code: "04" },
  { href: "/leaderboard", label: "LEADERBOARD", code: "05" },
  { href: "/download", label: "DOWNLOAD", code: "06" },
  { href: "/patch-notes", label: "PATCH", code: "07" },
  { href: "/announcements", label: "NEWS", code: "08" },
  { href: "/assets", label: "ASSETS", code: "09" },
  { href: "/gallery", label: "GALLERY", code: "10" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setInterval(
      () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false })),
      1000,
    );
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(t);
    };
  }, []);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-cyan-500/25 bg-[#050813]/90 shadow-[0_10px_40px_-20px_rgba(0,240,255,0.6)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rotate-45 border border-cyan-400/70 transition-transform duration-500 group-hover:rotate-[135deg]" />
            <div className="absolute inset-[6px] rotate-45 bg-gradient-to-br from-cyan-400 to-fuchsia-500 transition-transform duration-500 group-hover:rotate-[225deg]" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 blur-lg anim-pulse-glow" />
          </div>
          <div className="leading-none">
            <p className="font-display text-[14px] font-black tracking-[0.18em] text-white anim-glitch">
              ETERNAL
            </p>
            <p className="font-mono text-[9px] tracking-[0.38em] text-fuchsia-400">
              ECHOES.SYS
            </p>
          </div>
        </Link>

        <div className="ml-auto hidden items-center gap-0.5 xl:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              onClick={() => setOpen(false)}
              className={`clip-corner-sm group relative px-2.5 py-2 font-display text-[10.5px] font-bold tracking-[0.12em] transition-all duration-200 ${
                active(l.href)
                  ? "bg-cyan-400/15 text-cyan-300 neon-text"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="mr-1 font-mono text-[8px] text-fuchsia-500/70">{l.code}</span>
              {l.label}
              {active(l.href) && (
                <span className="absolute inset-x-2 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              )}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 border-l border-white/10 pl-3 font-mono text-[10px] tracking-widest text-slate-500 xl:ml-3 xl:flex">
          <span className="text-cyan-400">◈</span>
          {clock}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="clip-corner-sm ml-auto flex h-10 w-10 items-center justify-center border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 xl:hidden"
        >
          <div className="space-y-[5px]">
            <span
              className={`block h-[2px] w-5 bg-current transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span className={`block h-[2px] w-5 bg-current ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-[2px] w-5 bg-current transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-cyan-500/20 bg-[#050813]/98 backdrop-blur-xl transition-[max-height] duration-400 xl:hidden ${
          open ? "max-h-[420px]" : "max-h-0"
        }`}
      >
        <div className="grid grid-cols-2 gap-2 p-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              onClick={() => setOpen(false)}
              className={`clip-corner-sm border px-3 py-3 font-display text-[11px] font-bold tracking-[0.16em] ${
                active(l.href)
                  ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                  : "border-white/10 text-slate-400"
              }`}
            >
              <span className="mr-1.5 font-mono text-[8px] text-fuchsia-500/70">{l.code}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
