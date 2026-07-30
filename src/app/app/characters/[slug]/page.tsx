import Link from "next/link";
import { notFound } from "next/navigation";
import HoloCard from "@/components/HoloCard";
import Reveal from "@/components/Reveal";
import { characters, getCard, getCharacter, story } from "@/lib/fm";
import { resolveCardThumb } from "@/lib/localCards";
import { resolveDuelistAvatar, resolveDuelistPortrait } from "@/lib/localDuelists";

export const revalidate = 3600;


export async function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ch = getCharacter(slug);
  return { title: ch ? `${ch.name} — Dossier Duelist` : "Duelist tidak ditemukan" };
}

export default async function CharacterDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ch = getCharacter(slug);
  if (!ch) notFound();

  const deckCards = ch.deck.map((d) => ({ ...d, card: getCard(d.id)! })).filter((d) => d.card);
  const totalAtk = deckCards.reduce((a, d) => a + d.card.atk * d.count, 0);
  const avgAtk = Math.round(totalAtk / Math.max(deckCards.reduce((a, d) => a + d.count, 0), 1));
  const chapters = story.chapters.filter((c) => ch.storyChapters.includes(c.id));
  const idx = characters.findIndex((c) => c.slug === ch.slug);
  const prev = characters[(idx - 1 + characters.length) % characters.length];
  const next = characters[(idx + 1) % characters.length];

  return (
    <div className="pb-20">
      {/* HERO BANNER */}
      <div className="relative h-[340px] overflow-hidden md:h-[420px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveDuelistPortrait(ch.slug)}
          alt={ch.name}
          className="h-full w-full scale-125 object-cover object-center opacity-30 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/70 to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(700px 320px at 20% 100%, ${ch.accent}33, transparent 70%)`,
          }}
        />
        <div className="cyber-grid absolute inset-0 opacity-40" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8">
          <div className="mx-auto max-w-[1400px]">
            <Link
              href="/characters"
              className="font-mono text-[10px] tracking-[0.25em] text-slate-400 hover:text-cyan-300"
            >
              ◂ SEMUA DUELIST
            </Link>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <div
                className="clip-corner-sm h-24 w-24 shrink-0 overflow-hidden border-2"
                style={{ borderColor: ch.accent, boxShadow: `0 0 40px -8px ${ch.accent}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveDuelistAvatar(ch.slug)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.36em]" style={{ color: ch.accent }}>
                  {ch.titleTag.toUpperCase()}
                </p>
                <h1
                  className="mt-1 font-display text-4xl font-black tracking-tight text-white md:text-6xl"
                  style={{ textShadow: `0 0 40px ${ch.accent}66` }}
                >
                  {ch.name}
                </h1>
                <p className="mt-1 text-sm italic text-slate-400">{ch.alias}</p>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                {[
                  ["ERA", ch.era],
                  ["ROLE", ch.role],
                  ["LP", String(ch.hp)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="clip-corner-sm border border-white/10 bg-black/50 px-3 py-2 backdrop-blur"
                  >
                    <p className="font-mono text-[8px] tracking-widest text-slate-500">{k}</p>
                    <p className="font-display text-[12px] font-bold text-slate-100">{v}</p>
                  </div>
                ))}
                <div className="clip-corner-sm border border-white/10 bg-black/50 px-3 py-2 backdrop-blur">
                  <p className="font-mono text-[8px] tracking-widest text-slate-500">DIFFICULTY</p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span
                        key={k}
                        className="h-2 w-4"
                        style={{
                          background:
                            k < ch.difficulty ? ch.accent : "rgba(255,255,255,0.1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Reveal>
              <section className="panel clip-corner p-6">
                <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: ch.accent }}>
                  BIOGRAFI
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{ch.bio}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-slate-400">{ch.bioLong}</p>
              </section>
            </Reveal>

            {ch.quotes.length > 0 && (
              <Reveal>
                <section className="space-y-3">
                  {ch.quotes.map((q, i) => (
                    <blockquote
                      key={i}
                      className="panel clip-corner-sm relative overflow-hidden py-4 pl-6 pr-4"
                      style={{ borderColor: `${ch.accent}33` }}
                    >
                      <span
                        className="absolute left-0 top-0 h-full w-1"
                        style={{ background: ch.accent }}
                      />
                      <p className="font-display text-[15px] italic text-slate-200">“{q}”</p>
                    </blockquote>
                  ))}
                </section>
              </Reveal>
            )}

            <Reveal>
              <section className="panel clip-corner p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
                    DECK LIST — KARTU SIGNATURE
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    RATA-RATA ATK: <span className="text-rose-400">{avgAtk}</span>
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {deckCards.map((d, i) => (
                    <div key={`${d.id}-${i}`} className="relative">
                      <HoloCard
                        index={i}
                        href={`/cards/${d.card.id}`}
                        card={{
                          id: d.card.id,
                          name: d.card.name,
                          img: resolveCardThumb(d.card),
                          type: d.card.type,
                          attribute: d.card.attribute,
                          level: d.card.level,
                          atk: d.card.atk,
                          def: d.card.def,
                          zodiac: d.card.zodiac,
                        }}
                      />
                      {d.count > 1 && (
                        <span
                          className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold text-black"
                          style={{ background: ch.accent }}
                        >
                          ×{d.count}
                        </span>
                      )}
                      {d.note && (
                        <p className="mt-1 line-clamp-2 font-mono text-[8.5px] leading-tight text-slate-600">
                          {d.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {ch.drops.length > 0 && (
              <Reveal>
                <section className="panel clip-corner p-6">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-lime-400">
                    KARTU DROP UTAMA
                  </p>
                  <p className="mt-2 text-[13px] text-slate-400">
                    Kartu yang paling sering diburu pemain dari duelist ini.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    {ch.drops.map((id, i) => {
                      const c = getCard(id);
                      if (!c) return null;
                      return (
                        <HoloCard
                          key={id}
                          index={i}
                          href={`/cards/${c.id}`}
                          card={{
                            id: c.id,
                            name: c.name,
                            img: resolveCardThumb(c),
                            type: c.type,
                            attribute: c.attribute,
                            level: c.level,
                            atk: c.atk,
                            def: c.def,
                            zodiac: c.zodiac,
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              </Reveal>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div
              className="panel clip-corner p-5"
              style={{ borderColor: `${ch.accent}44` }}
            >
              <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400">
                STRATEGI MELAWAN
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-slate-300">{ch.strategy}</p>
            </div>

            <div className="panel clip-corner p-5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-500">
                KARTU ANDALAN
              </p>
              <div className="mt-3 space-y-2">
                {ch.signatureCards.map((id) => {
                  const c = getCard(id);
                  if (!c) return null;
                  return (
                    <Link
                      key={id}
                      href={`/cards/${c.id}`}
                      className="group flex items-center gap-3 border border-white/8 bg-white/[0.02] p-2 transition-all hover:border-cyan-400/40 hover:bg-cyan-400/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveCardThumb(c)}
                        alt={c.name}
                        loading="lazy"
                        className="h-11 w-11 rounded-sm object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-slate-200 group-hover:text-cyan-300">
                          {c.name}
                        </p>
                        <p className="font-mono text-[9px] text-slate-600">
                          {c.type} · {c.atk}/{c.def}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] text-slate-700">▸</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {chapters.length > 0 && (
              <div className="panel clip-corner p-5">
                <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
                  MUNCUL DI BABAK
                </p>
                <div className="mt-3 space-y-2">
                  {chapters.map((c) => (
                    <Link
                      key={c.id}
                      href={`/story#${c.id}`}
                      className="block border border-white/8 p-3 transition-colors hover:border-fuchsia-400/40"
                    >
                      <p className="font-mono text-[9px] tracking-widest text-slate-500">
                        {c.act} · {c.no}
                      </p>
                      <p className="text-[12.5px] font-semibold text-slate-200">{c.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/characters/${prev.slug}`}
                className="clip-corner-sm border border-white/10 p-3 transition-colors hover:border-cyan-400/50"
              >
                <p className="font-mono text-[9px] text-slate-600">◂ SEBELUMNYA</p>
                <p className="truncate text-[12px] font-semibold text-slate-300">{prev.name}</p>
              </Link>
              <Link
                href={`/characters/${next.slug}`}
                className="clip-corner-sm border border-white/10 p-3 text-right transition-colors hover:border-cyan-400/50"
              >
                <p className="font-mono text-[9px] text-slate-600">BERIKUTNYA ▸</p>
                <p className="truncate text-[12px] font-semibold text-slate-300">{next.name}</p>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
