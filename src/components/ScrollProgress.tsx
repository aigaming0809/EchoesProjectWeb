"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = h > 0 ? window.scrollY / h : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
        setShowTop(window.scrollY > 900);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
        <div
          ref={bar}
          className="h-full origin-left bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300"
          style={{ transform: "scaleX(0)", boxShadow: "0 0 14px rgba(0,240,255,0.8)" }}
        />
      </div>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
        className={`clip-corner-sm fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center border border-cyan-400/50 bg-[#050813]/90 font-mono text-cyan-300 backdrop-blur transition-all duration-300 hover:border-fuchsia-400 hover:text-fuchsia-400 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        ▲
      </button>
    </>
  );
}
