"use client";

import { useEffect, useRef } from "react";

/** Animated cyberpunk backdrop: drifting grid, particles, scanline, cursor aura. */
export default function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COUNT = reduce ? 24 : Math.min(110, Math.floor((w * h) / 16000));
    const colors = ["#00f0ff", "#ff2bd6", "#8b5cf6", "#ffc857"];

    type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number };
    const parts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.12 - Math.random() * 0.4,
      r: Math.random() * 1.7 + 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.5 + 0.2,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    if (!reduce) raf = requestAnimationFrame(draw);
    else draw();

    const onMove = (e: MouseEvent) => {
      const el = auraRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX - 260}px, ${e.clientY - 260}px, 0)`;
    };
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#04060f]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 500px at 12% -5%, rgba(0,240,255,0.16), transparent 65%), radial-gradient(760px 480px at 88% 8%, rgba(255,43,214,0.14), transparent 62%), radial-gradient(1000px 700px at 50% 110%, rgba(139,92,246,0.16), transparent 70%)",
        }}
      />
      <div className="cyber-grid anim-grid-drift absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-80" />
      <div
        ref={auraRef}
        className="absolute h-[520px] w-[520px] rounded-full opacity-40 blur-[90px] transition-transform duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(0,240,255,0.22), rgba(255,43,214,0.10) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-x-0 h-[140px] opacity-[0.09]"
        style={{
          background: "linear-gradient(180deg, transparent, #00f0ff, transparent)",
          animation: "scanline 9s linear infinite",
        }}
      />
      <div className="noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}
