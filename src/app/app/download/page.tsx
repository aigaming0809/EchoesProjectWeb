import DownloadClient, { type Build } from "./DownloadClient";
import Reveal from "@/components/Reveal";
import data from "@/data/downloads.json";

export const revalidate = 3600;

export const metadata = {
  title: "Download Game (Mobile APK & PC EXE)",
  description:
    "Unduh Yu-Gi-Oh! Eternal Echoes langsung — APK untuk Android dan installer EXE untuk Windows. Tanpa emulator.",
};

export default function DownloadPage() {
  const { gameInfo, notice, builds, controls, faq } = data;

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-400">SETUP // 06</p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">
              DOWNLOAD{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
                GAME
              </span>
            </h1>
            <span className="clip-corner-sm mb-2 flex items-center gap-2 border border-lime-400/50 bg-lime-400/15 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-lime-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
              v{gameInfo.version}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Unduh <b className="text-slate-200">{gameInfo.title}</b> langsung ke perangkatmu.{" "}
            <b className="text-lime-300">Tanpa emulator</b> — cukup pasang APK di Android atau
            jalankan installer EXE di Windows, lalu langsung main.
          </p>
        </header>

        {/* FITUR */}
        <Reveal>
          <section className="panel clip-corner mb-6 p-6">
            <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
              ISI GAME
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {gameInfo.features.map((f, i) => (
                <div
                  key={f}
                  className="clip-corner-sm flex items-center gap-2.5 border border-white/8 bg-white/[0.02] px-3 py-2.5"
                  style={{ animation: `fadeIn 0.4s ${i * 50}ms both` }}
                >
                  <span className="text-sm text-lime-400">✓</span>
                  <span className="text-[12.5px] text-slate-300">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-3">
              {[
                ["VERSI", `v${gameInfo.version}`],
                ["BUILD", gameInfo.build],
                ["RILIS", gameInfo.released],
                ["GENRE", gameInfo.genre],
                ["MODE", gameInfo.players],
                ["BAHASA", gameInfo.languages.join(" · ")],
              ].map(([k, v]) => (
                <span
                  key={k}
                  className="clip-corner-sm border border-white/10 px-2.5 py-1 font-mono text-[9.5px] text-slate-400"
                >
                  <span className="text-slate-600">{k}</span>{" "}
                  <span className="text-slate-200">{v}</span>
                </span>
              ))}
            </div>
          </section>
        </Reveal>

        <DownloadClient builds={builds as Build[]} />

        {/* KONTROL */}
        <Reveal>
          <section className="mt-8">
            <h3 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.12em] text-white">
              KONTROL
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {controls.map((c, i) => (
                <div
                  key={c.platform}
                  className="panel clip-corner p-5"
                  style={{ animation: `rise 0.5s ${i * 80}ms both` }}
                >
                  <p className="flex items-center gap-2 font-display text-[13px] font-bold tracking-wide text-cyan-300">
                    <span className="text-lg">{c.icon}</span> {c.platform.toUpperCase()}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {c.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-[12.5px] text-slate-400">
                        <span className="mt-0.5 text-[9px] text-fuchsia-400">▸</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* CATATAN */}
        <Reveal>
          <div className="clip-corner relative mt-8 overflow-hidden border border-amber-500/40 bg-amber-500/[0.07] p-5">
            <div className="relative flex items-start gap-3">
              <span className="text-2xl">📌</span>
              <div>
                <p className="font-display text-[13px] font-black tracking-[0.16em] text-amber-300">
                  {notice.title}
                </p>
                <p className="mt-2 max-w-4xl text-[12.5px] leading-relaxed text-amber-100/75">
                  {notice.body}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal>
          <section className="mt-8">
            <h3 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.12em] text-white">
              PERTANYAAN UMUM
            </h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {faq.map((f, i) => (
                <details
                  key={f.q}
                  className="panel clip-corner group p-4"
                  style={{ animation: `fadeIn 0.4s ${i * 60}ms both` }}
                >
                  <summary className="flex cursor-pointer list-none items-start gap-2.5 font-display text-[13px] font-bold text-slate-100 marker:hidden">
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] text-fuchsia-400 transition-transform duration-300 group-open:rotate-90">
                      ▸
                    </span>
                    {f.q}
                  </summary>
                  <p className="mt-3 border-t border-white/8 pt-3 text-[12.5px] leading-relaxed text-slate-400">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
