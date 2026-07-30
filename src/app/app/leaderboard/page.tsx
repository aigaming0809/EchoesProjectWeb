import LeaderboardClient from "@/components/LeaderboardClient";
import Reveal from "@/components/Reveal";
import { STAGES, TOTAL_STAGES } from "@/data/stages";
import { cards } from "@/lib/fm";
import { resolveCardThumb } from "@/lib/localCards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard" };

const POPULAR = [
  1, 380, 35, 722, 364, 374, 713, 705, 82, 22, 69, 15, 38, 39, 67, 57, 62, 63, 386, 407,
  99, 371, 372, 373, 370, 368, 369, 708, 707, 709, 531, 551, 427, 425, 613, 16, 4, 2,
];

export default function LeaderboardPage() {
  const options = POPULAR.map((id) => cards.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({ id: c.id, name: c.name, img: resolveCardThumb(c) }));

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-amber-400">NETWORK // 05</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            LEADER
            <span className="bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent">
              BOARD
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Statistik duelist Forbidden Memories: <b className="text-lime-300">win rate</b>,{" "}
            <b className="text-cyan-300">total duel</b>, dan{" "}
            <b className="text-amber-300">stage yang sudah diselesaikan</b> dari total{" "}
            {TOTAL_STAGES} stage campaign. Data dibaca langsung dari PostgreSQL via Drizzle
            ORM dan diperbarui otomatis tiap 20 detik.
          </p>
        </header>

        <LeaderboardClient options={options} />

        {/* PETA STAGE */}
        <Reveal>
          <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-3">
              <h2 className="font-display text-lg font-black tracking-[0.14em] text-white">
                PETA {TOTAL_STAGES} STAGE CAMPAIGN
              </h2>
              <p className="font-mono text-[10px] tracking-widest text-slate-500">
                ACUAN PERHITUNGAN PROGRES
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {STAGES.map((s, i) => (
                <div
                  key={s.slug}
                  className="clip-corner-sm group flex items-center gap-3 border bg-white/[0.02] px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: `${s.accent}28`,
                    animation: `fadeIn 0.4s ${Math.min(i * 22, 500)}ms both`,
                  }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center font-mono text-[11px] font-bold transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${s.accent}18`,
                      color: s.accent,
                      clipPath:
                        "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                    }}
                  >
                    {s.no}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[12.5px] font-bold text-slate-200">
                      {s.name}
                    </p>
                    <p className="font-mono text-[8.5px] tracking-[0.2em] text-slate-600">
                      {s.act}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* CATATAN DATABASE */}
        <Reveal>
          <section className="panel clip-corner mt-10 p-6">
            <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
              KONEKSI DATABASE
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                {
                  t: "TABEL players",
                  a: "#00f0ff",
                  d: "handle · title · region · wins · losses · stages_cleared · last_stage · favorite_card_id",
                },
                {
                  t: "PERHITUNGAN",
                  a: "#9dff3c",
                  d: "total_duel = wins + losses · win_rate = wins / total_duel × 100 · progress = stages_cleared / 26",
                },
                {
                  t: "MODE DEMO",
                  a: "#ffc857",
                  d: "Jika DATABASE_URL kosong atau tabel players belum terisi, UI menampilkan data contoh otomatis.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="clip-corner-sm border p-4"
                  style={{ borderColor: `${c.a}30` }}
                >
                  <p
                    className="font-display text-[11px] font-bold tracking-[0.16em]"
                    style={{ color: c.a }}
                  >
                    {c.t}
                  </p>
                  <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-slate-400">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
