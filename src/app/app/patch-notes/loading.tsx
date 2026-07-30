export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rotate-45 animate-[spinSlow_3s_linear_infinite] border-2 border-cyan-400/50" />
        <div className="absolute inset-3 -rotate-45 animate-[spinSlow_2s_linear_infinite_reverse] border-2 border-fuchsia-500/50" />
        <div className="absolute inset-8 rotate-45 bg-gradient-to-br from-cyan-400 to-fuchsia-500 anim-pulse-glow" />
      </div>
      <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-400 anim-flicker">
        MEMUAT MEMORI TERLARANG…
      </p>
      <div className="h-[2px] w-52 overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[sweep_1.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      </div>
    </div>
  );
}
