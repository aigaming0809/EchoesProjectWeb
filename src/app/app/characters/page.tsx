import Link from "next/link";
import Reveal from "@/components/Reveal";
import { characters } from "@/lib/fm";
import { resolveDuelistAvatar, resolveDuelistPortrait } from "@/lib/localDuelists";

export const revalidate = 3600;

export const metadata = { title: "Biografi Duelist" };

const GROUPS = [
  { key: "Royal Family", label: "KELUARGA KERAJAAN", accent: "#ffd447" },
  { key: "Villagers", label: "PENDUDUK DESA", accent: "#9ee493" },
  { key: "Heishin's Court", label: "ISTANA HEISHIN", accent: "#c15bff" },
  { key: "Six Mages", label: "ENAM MAGE PENJAGA", accent: "#31d8ff" },
  { key: "Labyrinth Ruins", label: "LABYRINTH RUINS", accent: "#a855f7" },
  { key: "The Dark", label: "KEGELAPAN", accent: "#ff2e63" },
  { key: "Modern Duelists", label: "DUELIST ERA MODERN", accent: "#60a5fa" },
];

export default function CharactersPage() {
  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">DOSSIER // 02</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            BIOGRAFI{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              DUELIST
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            {characters.length} duelist tercatat — dari Simon Muran di tutorial sampai Nitemare
            di duel terakhir. Setiap dossier berisi biografi, deck list, kartu drop, dan
            strategi melawannya.
          </p>
        </header>

        {GROUPS.map((g) => {
          const list = characters.filter((c) => c.faction === g.key);
          if (!list.length) return null;
          return (
            <section key={g.key} className="mb-14">
              <div className="mb-6 flex items-center gap-4">
                <span
                  className="h-[2px] w-10"
                  style={{ background: g.accent }}
                />
                <h2
                  className="font-display text-sm font-black tracking-[0.28em]"
                  style={{ color: g.accent, textShadow: `0 0 20px ${g.accent}55` }}
                >
                  {g.label}
                </h2>
                <span className="font-mono text-[10px] text-slate-600">
                  {list.length} DUELIST
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((ch, i) => {
                  return (
                    <Reveal key={ch.slug} delay={i * 50}>
                      <Link
                        href={`/characters/${ch.slug}`}
                        className="panel clip-corner group relative block h-full overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
                        style={{ borderColor: `${ch.accent}30` }}
                      >
                        <div className="relative h-36 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveDuelistPortrait(ch.slug)}
                            alt={ch.name}
                            loading="lazy"
                            className="h-full w-full scale-[1.3] object-cover object-top opacity-40 transition-all duration-[900ms] group-hover:scale-150 group-hover:opacity-70"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-[#070b18]/50 to-transparent" />
                          <div
                            className="absolute inset-x-0 top-0 h-[2px] opacity-70 transition-opacity group-hover:opacity-100"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${ch.accent}, transparent)`,
                            }}
                          />
                          <div className="absolute bottom-2 left-3 flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={resolveDuelistAvatar(ch.slug)}
                              alt=""
                              loading="lazy"
                              className="h-10 w-10 rounded-sm border object-cover"
                              style={{ borderColor: ch.accent }}
                            />
                            <div>
                              <p className="font-mono text-[8px] tracking-[0.25em] text-slate-400">
                                {ch.era.toUpperCase()}
                              </p>
                              <p
                                className="font-display text-[13px] font-black leading-tight text-white"
                                style={{ textShadow: `0 0 14px ${ch.accent}66` }}
                              >
                                {ch.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-[11px] italic text-slate-500">{ch.alias}</p>
                          <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-slate-400">
                            {ch.bio}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[8px] tracking-widest text-slate-600">
                                LVL
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, k) => (
                                  <span
                                    key={k}
                                    className="h-1.5 w-3.5 transition-all duration-300"
                                    style={{
                                      background:
                                        k < ch.difficulty
                                          ? ch.accent
                                          : "rgba(255,255,255,0.08)",
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="font-mono text-[9px] tracking-widest text-slate-600 transition-colors group-hover:text-cyan-300">
                              DECK ▸
                            </span>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
