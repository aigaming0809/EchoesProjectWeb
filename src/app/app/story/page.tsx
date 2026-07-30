import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getCard, getCharacter, story } from "@/lib/fm";
import { resolveCardImage } from "@/lib/localCards";
import { resolveDuelistAvatar } from "@/lib/localDuelists";

export const revalidate = 3600;

export const metadata = { title: "Alur Cerita" };

export default function StoryPage() {
  return (
    <div className="px-4 pb-24 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-14 text-center">
          <p className="font-mono text-[10px] tracking-[0.4em] text-amber-400">TIMELINE // 03</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            ALUR{" "}
            <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              CERITA
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            {story.subtitle}. Sembilan babak yang membentang antara kudeta Heishin di Mesir
            Kuno sampai duel penentu melawan Nitemare di luar ruang dan waktu.
          </p>
        </header>

        {/* MILLENNIUM ITEMS STRIP */}
        <Reveal>
          <div className="mb-16 grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {story.millenniumItems.map((it, i) => (
              <div
                key={it.name}
                className="clip-corner-sm group border border-amber-500/20 bg-amber-500/[0.04] p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60"
                style={{ animation: `rise 0.55s ${i * 60}ms both` }}
              >
                <div className="text-2xl transition-transform duration-300 group-hover:scale-125">
                  {it.icon}
                </div>
                <p className="mt-1 font-display text-[10px] font-bold tracking-wide text-amber-200">
                  {it.name.replace("Millennium ", "")}
                </p>
                <p className="font-mono text-[8px] leading-tight text-slate-600">{it.holder}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* TIMELINE */}
        <div className="relative">
          <div className="absolute left-[18px] top-0 hidden h-full w-px bg-gradient-to-b from-cyan-500/60 via-fuchsia-500/40 to-transparent md:block" />

          <div className="space-y-10">
            {story.chapters.map((ch, i) => {
              const cover = getCard(ch.cardId)!;
              const duelists = ch.duels
                .map((s) => getCharacter(s))
                .filter((d): d is NonNullable<typeof d> => Boolean(d));
              return (
                <Reveal key={ch.id} delay={40}>
                  <section id={ch.id} className="relative scroll-mt-28 md:pl-14">
                    <div className="absolute left-0 top-6 hidden md:block">
                      <span
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 bg-[#04060f] font-mono text-[10px] font-bold"
                        style={{ borderColor: ch.accent, color: ch.accent }}
                      >
                        {ch.no}
                        <span
                          className="absolute inset-0 animate-ping rounded-full opacity-20"
                          style={{ background: ch.accent }}
                        />
                      </span>
                    </div>

                    <article
                      className="panel clip-corner group relative overflow-hidden"
                      style={{ borderColor: `${ch.accent}30` }}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${ch.accent}, transparent)`,
                        }}
                      />
                      <div className="grid md:grid-cols-[220px_1fr]">
                        <div className="relative h-44 overflow-hidden md:h-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveCardImage(cover)}
                            alt={cover.name}
                            loading="lazy"
                            className="h-full w-full object-cover object-center opacity-45 transition-all duration-[900ms] group-hover:scale-110 group-hover:opacity-70"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(90deg, transparent, #070b18 92%), linear-gradient(0deg, ${ch.accent}22, transparent)`,
                            }}
                          />
                          <span className="absolute left-3 top-3 bg-black/70 px-2 py-1 font-mono text-[9px] tracking-widest text-slate-300 md:hidden">
                            {ch.no}
                          </span>
                        </div>

                        <div className="p-6 md:p-8">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="clip-corner-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-black"
                              style={{ background: ch.accent }}
                            >
                              {ch.act}
                            </span>
                            <span className="font-mono text-[9px] tracking-[0.24em] text-slate-500">
                              {ch.era} · {ch.location}
                            </span>
                          </div>

                          <h2
                            className="mt-3 font-display text-2xl font-black tracking-wide text-white md:text-3xl"
                            style={{ textShadow: `0 0 30px ${ch.accent}44` }}
                          >
                            {ch.title}
                          </h2>

                          <p className="mt-3 text-[14px] font-semibold leading-relaxed text-slate-300">
                            {ch.summary}
                          </p>

                          {ch.body.split("\n\n").map((p, k) => (
                            <p
                              key={k}
                              className="mt-3 text-[13.5px] leading-relaxed text-slate-400"
                            >
                              {p}
                            </p>
                          ))}

                          {ch.keyItems.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {ch.keyItems.map((k) => (
                                <span
                                  key={k}
                                  className="clip-corner-sm border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 font-mono text-[9px] tracking-widest text-amber-300"
                                >
                                  ◈ {k.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}

                          {duelists.length > 0 && (
                            <div className="mt-6">
                              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-500">
                                DUEL DI BABAK INI
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {duelists.map((d) => (
                                  <Link
                                    key={d.slug}
                                    href={`/characters/${d.slug}`}
                                    className="group/d flex items-center gap-2 border px-2 py-1.5 transition-all hover:-translate-y-0.5"
                                    style={{
                                      borderColor: `${d.accent}44`,
                                      background: `${d.accent}0f`,
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={resolveDuelistAvatar(d.slug)}
                                      alt=""
                                      loading="lazy"
                                      className="h-7 w-7 rounded-sm object-cover"
                                    />
                                    <span
                                      className="font-display text-[11px] font-bold"
                                      style={{ color: d.accent }}
                                    >
                                      {d.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          <div
                            className="clip-corner-sm mt-6 border-l-2 bg-white/[0.02] px-4 py-3"
                            style={{ borderColor: ch.accent }}
                          >
                            <p className="font-mono text-[9px] tracking-[0.28em] text-lime-400">
                              💡 TIPS
                            </p>
                            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">
                              {ch.tips}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </section>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* MECHANICS */}
        <Reveal>
          <section className="mt-20">
            <h2 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.14em] text-white">
              MEKANIKA YANG WAJIB KAMU KUASAI
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {story.mechanics.map((m) => (
                <div
                  key={m.title}
                  className="panel clip-corner group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
                >
                  <div className="absolute -right-4 -top-4 text-6xl opacity-10 transition-transform duration-500 group-hover:scale-125">
                    {m.icon}
                  </div>
                  <p className="font-display text-sm font-bold tracking-[0.14em] text-cyan-300">
                    {m.title.toUpperCase()}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}