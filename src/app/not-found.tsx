import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">
        ETERNAL ECHOES
      </p>
      <h1
        className="mt-4 font-display text-[22vw] font-black leading-none text-white anim-flicker sm:text-[140px]"
        style={{ textShadow: "0 0 60px rgba(255,43,214,0.4)" }}
      >
        404
      </h1>
      <p className="mt-2 font-display text-lg tracking-[0.18em] text-cyan-300">
        MEMORY FRAGMENT NOT FOUND
      </p>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Kepingan Millennium Puzzle ini hilang di antara lima milenium. Kembali ke jalur
        utama sebelum kegelapan menemukanmu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="btn-cyber clip-corner-sm border border-cyan-400/60 bg-cyan-400/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-cyan-200"
        >
          ▸ KEMBALI KE HOME
        </Link>
        <Link
          href="/cards"
          className="btn-cyber clip-corner-sm border border-white/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-slate-300"
        >
          ▸ CARD DATABASE
        </Link>
      </div>
    </div>
  );
}
