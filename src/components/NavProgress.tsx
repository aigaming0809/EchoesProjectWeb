"use client";

import { useRef } from "react";

export default function NavProgress() {
  const widthRef = useRef<HTMLDivElement | null>(null);
  const opacityRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const startProgress = () => {
    clear();
    if (opacityRef.current) opacityRef.current.style.opacity = "1";
    if (widthRef.current) widthRef.current.style.width = "28%";
    timers.current.push(
      setTimeout(() => {
        if (widthRef.current) widthRef.current.style.width = "65%";
      }, 160),
    );
    timers.current.push(
      setTimeout(() => {
        if (widthRef.current) widthRef.current.style.width = "90%";
      }, 400),
    );
    // Sembunyikan setelah 800ms
    timers.current.push(
      setTimeout(() => {
        if (widthRef.current) widthRef.current.style.width = "100%";
        timers.current.push(
          setTimeout(() => {
            if (opacityRef.current) opacityRef.current.style.opacity = "0";
            setTimeout(() => {
              if (widthRef.current) widthRef.current.style.width = "0%";
            }, 200);
          }, 150),
        );
      }, 700),
    );
  };

  return (
    <div
      ref={opacityRef}
      aria-hidden
      onClick={startProgress}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] opacity-0 transition-opacity duration-200"
    >
      <div
        ref={widthRef}
        className="h-full w-0 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-300"
        style={{
          transition: "width 260ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 0 16px rgba(0,240,255,0.9)",
        }}
      />
    </div>
  );
}
