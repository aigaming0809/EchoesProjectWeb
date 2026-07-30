import Link from "next/link";

export default function DuelistNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">
        ETERNAL ECHOES
      </p>
      <h1
        className="mt-4 font-display text-6xl font-black text-white anim-flicker md:text-8xl"
        style={{ textShadow: "0 0 50px rgba(255,43,214,0.35)" }}
      >
        404
      </h1>
      <p className="mt-2 font-display text-lg tracking-[0.16em] text-cyan-300">
        DUELIST TIDAK DITEMUKAN
      </p>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Handle yang kamu cari tidak terdaftar di jaringan. Mungkin sudah berganti nama
        atau belum pernah bertanding.
      </p>
      <Link
        href="/leaderboard"
        className="btn-cyber clip-corner-sm mt-8 border border-cyan-400/60 bg-cyan-400/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-cyan-200"
      >
        ▸ KEMBALI KE LEADERBOARD
      </Link>
    </div>
  );
}
