import Link from "next/link";
import { notFound } from "next/navigation";
import BigHoloCard from "@/components/BigHoloCard";
import HoloCard from "@/components/HoloCard";
import Reveal from "@/components/Reveal";
import {
  ATTR_COLORS,
  ZODIAC_NOTES,
  cards,
  characters,
  equipsFor,
  fusionsFrom,
  fusionsInto,
  getCard,
  isMonster,
  hasEffect,
  effectMeta,
  ritualFor,
  limitDisplayLabel,
} from "@/lib/fm";
import { resolveCardImage, resolveCardThumb } from "@/lib/localCards";

export const revalidate = 3600;

/** Prerender seluruh 722 kartu supaya navigasi instan (tanpa server round-trip). */
export function generateStaticParams() {
  return cards.map((c) => ({ id: String(c.id) }));
}


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getCard(Number(id));
  return { title: card ? card.name : "Kartu tidak ditemukan" };
}

function Mini({ id }: { id: number }) {
  const c = getCard(id);
  if (!c) return null;
  return (
    <Link
      href={`/cards/${c.id}`}
      className="group flex items-center gap-2 border border-white/8 bg-white/[0.02] px-2 py-1.5 transition-all hover:border-cyan-400/50 hover:bg-cyan-400/5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveCardThumb(c)}
        alt={c.name}
        loading="lazy"
        className="h-9 w-9 shrink-0 rounded-sm object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11.5px] font-semibold text-slate-300 group-hover:text-cyan-300">
          {c.name}
        </span>
        <span className="block font-mono text-[9px] text-slate-600">
          #{String(c.id).padStart(3, "0")} · {c.atk}/{c.def}
        </span>
      </span>
    </Link>
  );
}

export default async function CardDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getCard(Number(id));
  if (!card) notFound();

  const accent = ATTR_COLORS[card.attribute] ?? "#00f0ff";
  const monster = isMonster(card);
  const cardHasEffect = hasEffect(card);
  const fx = effectMeta(card);
  const into = fusionsInto(card.id);
  const from = fusionsFrom(card.id);
  const equips = equipsFor(card.id);
  const ritual = ritualFor(card.id);
  const users = characters.filter(
    (ch) => ch.deck.some((d) => d.id === card.id) || ch.drops.includes(card.id),
  );

  const prev = cards.find((c) => c.id === card.id - 1);
  const next = cards.find((c) => c.id === card.id + 1);

  const bestFusions = [...from]
    .map(([partner, result]) => ({ partner, result, atk: getCard(result)?.atk ?? 0 }))
    .sort((a, b) => b.atk - a.atk)
    .slice(0, 18);

  const maxAtk = 5000;

  return (
    <div className="px-4 pb-20 pt-8">
      <div className="mx-auto max-w-[1400px]">
        <nav className="mb-6 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/cards" className="hover:text-cyan-300">
              ◂ CARD DATABASE
            </Link>
            <span className="text-slate-700">/</span>
            <span style={{ color: accent }}>#{String(card.id).padStart(3, "0")}</span>
          </div>
          <div className="flex gap-2">
            {prev && (
              <Link href={`/cards/${prev.id}`} className="hover:text-cyan-300">
                ◂ {String(prev.id).padStart(3, "0")}
              </Link>
            )}
            {next && (
              <Link href={`/cards/${next.id}`} className="hover:text-cyan-300">
                {String(next.id).padStart(3, "0")} ▸
              </Link>
            )}
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* CARD */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BigHoloCard
              img={resolveCardImage(card)}
              name={card.name}
              accent={accent}
              id={card.id}
              desc={card.description}
              stats={[
                { label: "TYPE", value: card.type },
                { label: "ATTRIBUTE", value: card.attribute },
                { label: "ATK", value: monster ? String(card.atk) : "—" },
                { label: "DEF", value: monster ? String(card.def) : "—" },
                { label: "ZODIAC", value: card.zodiac.join(" / ") || "—" },
              ]}
            />

            <div className="panel clip-corner mt-5 p-5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400">
                BANLIST
              </p>
              <p className="mt-1 font-display text-2xl font-black text-amber-300">
                {limitDisplayLabel(card.limit).toUpperCase()}
              </p>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-600">
                {card.limit === "Forbidden"
                  ? "Kartu ini tidak boleh dipakai dalam deck sama sekali."
                  : card.limit === "Limited"
                    ? "Maksimal 1 kopi kartu ini per deck."
                    : card.limit === "Semi-Limited"
                      ? "Maksimal 2 kopi kartu ini per deck."
                      : "Tidak ada batasan jumlah kopi kartu ini per deck."}
              </p>
            </div>
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="clip-corner-sm px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-black"
                  style={{ background: accent }}
                >
                  {card.attribute.toUpperCase()}
                </span>
                <span className="clip-corner-sm border border-white/15 px-2.5 py-1 font-mono text-[10px] tracking-widest text-slate-300">
                  {card.type.toUpperCase()}
                </span>
                {monster && (
                  <span className="clip-corner-sm border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-amber-300">
                    LEVEL {card.level}
                  </span>
                )}
                {ritual && (
                  <span className="clip-corner-sm border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 font-mono text-[10px] tracking-widest text-violet-300">
                    RITUAL
                  </span>
                )}
              </div>
              <h1
                className="mt-4 font-display text-4xl font-black leading-tight tracking-tight text-white md:text-5xl"
                style={{ textShadow: `0 0 34px ${accent}55` }}
              >
                {card.name}
              </h1>
              <div
                className="clip-corner-sm mt-5 max-w-2xl border-l-2 bg-white/[0.02] py-4 pl-5 pr-4"
                style={{ borderColor: fx.color }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="clip-corner-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-black"
                    style={{ background: fx.color }}
                  >
                    {fx.label}
                  </span>
                  <span
                    className="font-mono text-[9px] tracking-[0.22em]"
                    style={{ color: fx.color }}
                  >
                    {fx.kind}
                  </span>
                  {!cardHasEffect && (
                    <span className="clip-corner-sm border border-white/12 px-2 py-0.5 font-mono text-[8.5px] tracking-wider text-slate-500">
                      TANPA EFEK
                    </span>
                  )}
                </div>
                <p
                  className={`mt-3 text-[15px] leading-relaxed ${
                    cardHasEffect ? "text-slate-200" : "italic text-slate-400"
                  }`}
                >
                  {cardHasEffect ? card.description : `“${card.description}”`}
                </p>
                <p className="mt-3 border-t border-white/8 pt-2.5 font-mono text-[10px] leading-relaxed text-slate-600">
                  {fx.note}
                </p>
              </div>
            </header>

            {monster && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel clip-corner p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-rose-400">ATTACK</p>
                  <p className="font-display text-4xl font-black text-rose-300">{card.atk}</p>
                  <div className="stat-bar mt-2">
                    <span
                      className="bg-gradient-to-r from-rose-600 to-rose-300"
                      style={{ width: `${Math.min((card.atk / maxAtk) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-slate-500">
                    +30% FIELD = {Math.floor(card.atk * 1.3)} · GUARDIAN = {card.atk + 500}
                  </p>
                </div>
                <div className="panel clip-corner p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-sky-400">DEFENSE</p>
                  <p className="font-display text-4xl font-black text-sky-300">{card.def}</p>
                  <div className="stat-bar mt-2">
                    <span
                      className="bg-gradient-to-r from-sky-600 to-sky-300"
                      style={{ width: `${Math.min((card.def / maxAtk) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 font-mono text-[10px] text-slate-500">
                    +30% FIELD = {Math.floor(card.def * 1.3)} · GUARDIAN = {card.def + 500}
                  </p>
                </div>
              </div>
            )}

            {monster && card.zodiac.length > 0 && (
              <div className="panel clip-corner p-5">
                <p className="font-mono text-[9px] tracking-[0.3em] text-violet-400">
                  ZODIAC
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {card.zodiac.map((gs, i) => (
                    <div
                      key={i}
                      className="clip-corner-sm border border-violet-500/25 bg-violet-500/5 p-4"
                    >
                      <p className="font-display text-lg font-bold text-violet-200">🪐 {gs}</p>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-slate-500">
                        {ZODIAC_NOTES[gs] ?? "Kategori zodiac kartu ini."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ritual && (
              <Reveal>
                <div className="panel clip-corner p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-violet-400">
                    RITUAL SUMMON
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Butuh <b className="text-violet-300">{getCard(ritual.ritual)?.name}</b> +
                    tiga material berikut di tangan:
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    {[...ritual.m, ritual.result].map((mid, i) => (
                      <div key={`${mid}-${i}`}>
                        <p className="mb-1 font-mono text-[8px] tracking-widest text-slate-600">
                          {i < 3 ? `MATERIAL ${i + 1}` : "HASIL"}
                        </p>
                        <Mini id={mid} />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {into.length > 0 && (
              <Reveal>
                <div className="panel clip-corner p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-lime-400">
                      RESEP FUSION — CARA MEMBUAT KARTU INI
                    </p>
                    <span className="font-mono text-[10px] text-slate-500">
                      {into.length} kombinasi
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {into.slice(0, 24).map(([a, b], i) => (
                      <div
                        key={`${a}-${b}-${i}`}
                        className="clip-corner-sm grid grid-cols-[1fr_auto_1fr] items-center gap-2 border border-lime-500/15 bg-lime-500/[0.03] p-2"
                      >
                        <Mini id={a} />
                        <span className="font-display text-sm font-black text-lime-400">+</span>
                        <Mini id={b} />
                      </div>
                    ))}
                  </div>
                  {into.length > 24 && (
                    <p className="mt-3 font-mono text-[10px] text-slate-600">
                      … dan {into.length - 24} kombinasi lainnya.
                    </p>
                  )}
                </div>
              </Reveal>
            )}

            {bestFusions.length > 0 && (
              <Reveal>
                <div className="panel clip-corner p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
                      FUSION TERBAIK DARI KARTU INI
                    </p>
                    <span className="font-mono text-[10px] text-slate-500">
                      total {from.length} resep
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {bestFusions.map((f, i) => (
                      <div
                        key={`${f.partner}-${i}`}
                        className="clip-corner-sm border border-fuchsia-500/15 bg-fuchsia-500/[0.03] p-2"
                      >
                        <Mini id={f.partner} />
                        <div className="my-1 text-center font-mono text-[9px] text-fuchsia-500">
                          ▼ HASIL
                        </div>
                        <Mini id={f.result} />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {equips.length > 0 && (
              <Reveal>
                <div className="panel clip-corner p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400">
                    {card.type === "Equip" ? "BISA DIPASANG PADA" : "EQUIP YANG COCOK"}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {equips.slice(0, 24).map((eid) => (
                      <Mini key={eid} id={eid} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {users.length > 0 && (
              <Reveal>
                <div className="panel clip-corner p-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
                    DUELIST YANG MEMAKAI / MEN-DROP KARTU INI
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {users.map((u) => (
                      <Link
                        key={u.slug}
                        href={`/characters/${u.slug}`}
                        className="clip-corner-sm border px-3 py-2 font-display text-[11px] font-bold tracking-wide transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: `${u.accent}55`,
                          color: u.accent,
                          background: `${u.accent}12`,
                        }}
                      >
                        {u.name}
                        {u.drops.includes(card.id) && (
                          <span className="ml-2 font-mono text-[9px] text-lime-400">DROP</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>

        {/* RELATED */}
        <section className="mt-16">
          <h2 className="border-b border-white/10 pb-3 font-display text-lg font-black tracking-[0.1em] text-white">
            KARTU SERUPA — {card.type.toUpperCase()}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {cards
              .filter((c) => c.type === card.type && c.id !== card.id)
              .sort((a, b) => Math.abs(a.atk - card.atk) - Math.abs(b.atk - card.atk))
              .slice(0, 8)
              .map((c, i) => (
                <HoloCard
                  key={c.id}
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
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}