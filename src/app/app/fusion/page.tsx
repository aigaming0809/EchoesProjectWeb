import FusionLab from "@/components/FusionLab";
import Reveal from "@/components/Reveal";
import { getCard, rituals, STATS } from "@/lib/fm";
import { resolveCardThumb } from "@/lib/localCards";

export const revalidate = 3600;

export const metadata = { title: "Fusion Lab" };

const STARTER_IDS = [
  1, 4, 16, 35, 38, 39, 22, 82, 62, 63, 26, 15, 32, 81, 371, 372, 373, 52, 57, 50, 97, 99,
  407, 425, 705, 707, 708, 30, 33, 2, 42, 24, 23, 73, 440, 442, 31, 7, 80, 94,
];

export default function FusionPage() {
  const starters = STARTER_IDS.map((id) => getCard(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      attribute: c.attribute,
      level: c.level,
      atk: c.atk,
      def: c.def,
      zodiac: c.zodiac,
      img: resolveCardThumb(c),
    }));

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-lime-400">LAB // 04</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            FUSION{" "}
            <span className="bg-gradient-to-r from-lime-300 to-cyan-300 bg-clip-text text-transparent">
              LAB
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Simulator fusion dengan{" "}
            <b className="text-slate-200">{STATS.totalFusions.toLocaleString("id-ID")} resep asli</b>{" "}
            dari data game. Pilih dua kartu material, jalankan fusion, dan lihat hasilnya —
            persis seperti mekanika di PlayStation.
          </p>
        </header>

        <FusionLab starters={starters} />

        <Reveal>
          <section className="mt-14">
            <h2 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.14em] text-white">
              24 RITUAL SUMMON — RESEP LENGKAP
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rituals.map((r, i) => {
                const ritualCard = getCard(r.ritual);
                const result = getCard(r.result);
                if (!ritualCard || !result) return null;
                return (
                  <div
                    key={`${r.ritual}-${i}`}
                    className="panel clip-corner p-4 transition-transform hover:-translate-y-1"
                  >
                    <p className="font-mono text-[9px] tracking-[0.26em] text-violet-400">
                      {ritualCard.name.toUpperCase()}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      {r.m.map((mid, k) => {
                        const m = getCard(mid);
                        if (!m) return null;
                        return (
                          <div key={`${mid}-${k}`} className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveCardThumb(m)}
                              alt={m.name}
                              loading="lazy"
                              title={m.name}
                              className="h-11 w-11 rounded-sm border border-white/10 object-cover"
                            />
                            {k < r.m.length - 1 && (
                              <span className="font-mono text-[10px] text-slate-600">+</span>
                            )}
                          </div>
                        );
                      })}
                      <span className="mx-1 font-mono text-sm text-violet-400">▸</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveCardThumb(result)}
                        alt={result.name}
                        loading="lazy"
                        className="h-14 w-14 rounded-sm border-2 border-violet-500/60 object-cover"
                      />
                    </div>
                    <p className="mt-3 font-display text-[13px] font-bold text-white">
                      {result.name}
                    </p>
                    <p className="font-mono text-[10px] text-slate-500">
                      ATK {result.atk} / DEF {result.def} · {result.zodiac.join("/")}
                    </p>
                    <p className="mt-2 font-mono text-[9px] leading-relaxed text-slate-600">
                      MATERIAL: {r.m.map((mid) => getCard(mid)?.name).join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
