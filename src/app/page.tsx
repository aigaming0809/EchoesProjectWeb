import Link from "next/link";
import HeroDeck from "@/components/HeroDeck";
import HoloCard from "@/components/HoloCard";
import OnlineStatus from "@/components/OnlineStatus";
import Reveal, { CountUp } from "@/components/Reveal";
import { cards, characters, getCard, STATS, story } from "@/lib/fm";
import announcements from "@/data/announcements.json";
import patchnotes from "@/data/patchnotes.json";
import { resolveCardImage, resolveCardThumb } from "@/lib/localCards";
import { resolveDuelistPortrait } from "@/lib/localDuelists";

export const revalidate = 3600;


const HERO_IDS = [1, 380, 374, 722, 364, 713, 705, 67];

function Stat({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  return (
    <div className="panel clip-corner group relative p-5 transition-transform duration-300 hover:-translate-y-1">
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <p
        className="font-display text-3xl font-black tabular-nums"
        style={{ color: accent, textShadow: `0 0 18px ${accent}66` }}
      >
        <CountUp to={value} suffix={suffix} />
      </p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.24em] text-slate-500">{label}</p>
    </div>
  );
}

export default function HomePage() {
  const heroCards = HERO_IDS.map((id) => {
    const c = getCard(id)!;
    return {
      id: c.id,
      name: c.name,
      atk: c.atk,
      def: c.def,
      type: c.type,
      attribute: c.attribute,
      img: resolveCardImage(c),
    };
  });

  const strongest = STATS.strongest.map((id) => getCard(id)!);
  const rituals = [703, 704, 705, 706, 708, 710, 713, 716].map((id) => getCard(id)!);
  const featuredDuelists = ["seto", "heishin", "darknite", "high-mage-anubisius", "mai-valentine", "kaiba"]
    .map((s) => characters.find((c) => c.slug === s)!)
    .filter(Boolean);

  return (
    <div className="relative">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="vignette relative overflow-hidden px-4 pb-24 pt-14">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="anim-rise">
            <div className="mb-5 inline-flex items-center gap-2 border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1.5 clip-corner-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400" />
              <span className="font-mono text-[10px] tracking-[0.34em] text-fuchsia-300">
                ARSIP FORBIDDEN MEMORIES · PS1 1999
              </span>
            </div>

            <p className="mb-2 font-display text-[13px] font-bold tracking-[0.42em] text-amber-300/90">
              YU-GI-OH!
            </p>
            <h1 className="font-display text-[13vw] font-black leading-[0.82] tracking-tight sm:text-[9vw] lg:text-[76px]">
              <span className="block text-white anim-flicker">ETERNAL</span>
              <span
                className="block bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 26px rgba(255,43,214,0.35))" }}
              >
                ECHOES
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400">
              Gema dari lima milenium yang lalu. <b className="text-slate-200">Eternal Echoes</b>{" "}
              adalah arsip digital lengkap untuk{" "}
              <b className="text-slate-200">Yu-Gi-Oh! Forbidden Memories</b> —
              722 kartu asli dengan Guardian Star &amp; Field Power Bonus, 25.131 resep fusion,
              biografi setiap duelist beserta deck list-nya, dan seluruh alur cerita dari Mesir
              Kuno sampai duel terakhir melawan Nitemare.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/announcements"
                className="btn-cyber clip-corner-sm border border-amber-400/60 bg-amber-400/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-amber-200"
              >
                ▸ NEWS
              </Link>
              <Link
                href="/download"
                className="btn-cyber clip-corner-sm border border-lime-400/60 bg-lime-400/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-lime-200"
              >
                ⬇ DOWNLOAD
              </Link>
              <Link
                href="/leaderboard"
                className="btn-cyber clip-corner-sm border border-cyan-400/60 bg-cyan-400/15 px-6 py-3 font-display text-xs font-bold tracking-[0.2em] text-cyan-200"
              >
                ▸ LEADERBOARD
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 border-t border-white/5 pt-6 font-mono text-[10px] tracking-[0.22em] text-slate-500">
              <span>◈ DATA DARI STRUKTUR GAME ASLI</span>
              <span>◈ ARTWORK HD</span>
              <span>◈ LEADERBOARD LIVE</span>
            </div>
          </div>

          <div className="anim-fade">
            <HeroDeck cards={heroCards} />
          </div>
        </div>
      </section>

      {/* ───────────────────────── LIVE NETWORK ───────────────────────── */}
      <section className="px-4 pt-6 sm:pt-10">
        <div className="mx-auto max-w-[1400px]">
          <OnlineStatus />
        </div>
      </section>

      {/* ───────────────────────── STATS ───────────────────────── */}
      <section className="mt-6 sm:mt-10 px-4">
        <Reveal>
          <div className="mx-auto grid max-w-[1400px] gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="TOTAL KARTU" value={STATS.totalCards} accent="#00f0ff" />
            <Stat label="RESEP FUSION" value={STATS.totalFusions} accent="#ff2bd6" />
            <Stat label="RITUAL SUMMON" value={STATS.totalRituals} accent="#ffc857" />
            <Stat label="DUELIST TERCATAT" value={STATS.totalDuelists} accent="#9dff3c" />
            <Stat label="ZODIAC CATEGORIES" value={4} accent="#8b5cf6" />
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── STRONGEST ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="01"
              title="MONSTER TERKUAT"
              sub="Delapan kartu dengan ATK tertinggi di seluruh Forbidden Memories"
              accent="#00f0ff"
              href="/cards?sort=atk"
              cta="LIHAT SEMUA 722 KARTU"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {strongest.map((c, i) => (
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
        </div>
      </section>

      {/* ───────────────────────── DUELISTS ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="02"
              title="BIOGRAFI DUELIST"
              sub="Kisah, motif, dan deck list setiap penantang di sepanjang perjalanan"
              accent="#ff2bd6"
              href="/characters"
              cta="SEMUA DUELIST"
            />
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDuelists.map((ch, i) => {
              return (
                <Reveal key={ch.slug} delay={i * 70}>
                  <Link
                    href={`/characters/${ch.slug}`}
                    className="panel clip-corner group relative block h-full overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1.5"
                    style={{ borderColor: `${ch.accent}33` }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveDuelistPortrait(ch.slug)}
                        alt={ch.name}
                        loading="lazy"
                        className="h-full w-full scale-125 object-cover object-top opacity-45 transition-all duration-700 group-hover:scale-[1.4] group-hover:opacity-70"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-[#070b18]/60 to-transparent" />
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${ch.accent}, transparent)` }}
                      />
                      <span
                        className="absolute right-3 top-3 clip-corner-sm px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-black"
                        style={{ background: ch.accent }}
                      >
                        {ch.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="relative -mt-8 p-5">
                      <p className="font-mono text-[9px] tracking-[0.3em] text-slate-500">
                        {ch.era.toUpperCase()}
                      </p>
                      <h3
                        className="mt-1 font-display text-xl font-black tracking-wide text-white transition-colors"
                        style={{ textShadow: `0 0 20px ${ch.accent}44` }}
                      >
                        {ch.name}
                      </h3>
                      <p className="mt-0.5 text-xs italic text-slate-500">{ch.alias}</p>
                      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-slate-400">
                        {ch.bio}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, k) => (
                            <span
                              key={k}
                              className="h-1.5 w-5"
                              style={{
                                background: k < ch.difficulty ? ch.accent : "rgba(255,255,255,0.08)",
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] tracking-widest text-slate-500 transition-colors group-hover:text-cyan-300">
                          DOSSIER ▸
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── STORY ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="03"
              title="ALUR CERITA"
              sub="Sembilan babak, dari kudeta Heishin sampai duel terakhir melawan Nitemare"
              accent="#ffc857"
              href="/story"
              cta="BACA LENGKAP"
            />
          </Reveal>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {story.chapters.slice(0, 6).map((ch, i) => (
              <Reveal key={ch.id} delay={i * 60}>
                <Link
                  href={`/story#${ch.id}`}
                  className="panel clip-corner group flex h-full gap-4 p-5 transition-all duration-300 hover:-translate-y-1"
                  style={{ borderColor: `${ch.accent}30` }}
                >
                  <span
                    className="font-display text-4xl font-black leading-none opacity-30 transition-opacity group-hover:opacity-80"
                    style={{ color: ch.accent }}
                  >
                    {ch.no}
                  </span>
                  <div>
                    <p className="font-mono text-[9px] tracking-[0.28em] text-slate-500">
                      {ch.act} · {ch.era}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-bold tracking-wide text-white">
                      {ch.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-slate-400">
                      {ch.summary}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── RITUALS ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="04"
              title="RITUAL MONSTERS"
              sub="24 ritual summon eksklusif — masing-masing butuh tiga material spesifik"
              accent="#8b5cf6"
              href="/cards?type=Ritual"
              cta="LIHAT RITUAL"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {rituals.map((c, i) => (
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
        </div>
      </section>

      {/* ───────────────────────── MECHANICS ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="05"
              title="MEKANIKA GAME"
              sub="Enam sistem yang membuat Forbidden Memories jadi legenda grind"
              accent="#9dff3c"
            />
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {story.mechanics.map((m, i) => (
              <Reveal key={m.title} delay={i * 60}>
                <div className="panel clip-corner group relative h-full overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="absolute -right-6 -top-6 text-7xl opacity-10 transition-all duration-500 group-hover:scale-125 group-hover:opacity-25">
                    {m.icon}
                  </div>
                  <p className="font-display text-sm font-bold tracking-[0.14em] text-cyan-300">
                    {m.title.toUpperCase()}
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── MILLENNIUM ITEMS ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="panel clip-corner relative overflow-hidden p-8 md:p-12">
              <div className="sweep-shine" />
              <p className="font-mono text-[10px] tracking-[0.34em] text-amber-400">
                SEVEN MILLENNIUM ITEMS
              </p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-wide text-white md:text-4xl">
                TUJUH ITEM, SATU KEGELAPAN
              </h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {story.millenniumItems.map((it, i) => (
                  <div
                    key={it.name}
                    className="group clip-corner-sm flex items-center gap-3 border border-amber-500/20 bg-amber-500/5 px-4 py-3 transition-all duration-300 hover:border-amber-400/60 hover:bg-amber-500/10"
                    style={{ animation: `rise 0.6s ${i * 70}ms both` }}
                  >
                    <span className="text-2xl transition-transform duration-300 group-hover:scale-125">
                      {it.icon}
                    </span>
                    <div>
                      <p className="font-display text-[12px] font-bold tracking-wide text-amber-200">
                        {it.name}
                      </p>
                      <p className="font-mono text-[10px] text-slate-500">{it.holder}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── DOWNLOAD & NEWS ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <SectionHeading
              index="06"
              title="MAINKAN & IKUTI PERKEMBANGAN"
              sub="Panduan emulator, catatan rilis, dan pengumuman terbaru"
              accent="#63f2ff"
            />
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {/* DOWNLOAD */}
            <Reveal delay={0}>
              <Link
                href="/download"
                className="panel clip-corner group relative flex h-full flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderColor: "#00f0ff33" }}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-10 transition-transform duration-500 group-hover:scale-125">
                  📥
                </div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
                  DOWNLOAD GAME
                </p>
                <h3 className="mt-2 font-display text-xl font-black tracking-wide text-white">
                  MOBILE (APK) · PC (EXE)
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-slate-400">
                  Unduh langsung tanpa emulator. Pasang APK di Android atau jalankan
                  installer EXE di Windows, lalu langsung main.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {["APK 412 MB", "EXE 586 MB", "Tanpa Emulator", "Offline"].map((e) => (
                    <span
                      key={e}
                      className="clip-corner-sm border border-cyan-500/30 bg-cyan-500/5 px-2 py-0.5 font-mono text-[9px] text-cyan-300"
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <span className="mt-4 font-mono text-[10px] tracking-[0.22em] text-slate-500 transition-colors group-hover:text-cyan-300">
                  UNDUH SEKARANG ▸
                </span>
              </Link>
            </Reveal>

            {/* PATCH NOTE */}
            <Reveal delay={80}>
              <Link
                href="/patch-notes"
                className="panel clip-corner group relative flex h-full flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderColor: "#ff2bd633" }}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-10 transition-transform duration-500 group-hover:scale-125">
                  📋
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
                    PATCH NOTE
                  </p>
                  <span className="clip-corner-sm border border-lime-400/50 bg-lime-400/15 px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-lime-300">
                    {patchnotes.current}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-black tracking-wide text-white">
                  {patchnotes.releases[0].codename}
                </h3>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-slate-400">
                  {patchnotes.releases[0].summary}
                </p>
                <div className="mt-4 space-y-1">
                  {patchnotes.releases[0].changes.slice(0, 3).map((c, i) => (
                    <p key={i} className="truncate font-mono text-[10px] text-slate-500">
                      <span className="text-lime-400">{c.tag}</span> {c.text}
                    </p>
                  ))}
                </div>
                <span className="mt-4 font-mono text-[10px] tracking-[0.22em] text-slate-500 transition-colors group-hover:text-fuchsia-300">
                  LIHAT RIWAYAT ▸
                </span>
              </Link>
            </Reveal>

            {/* ANNOUNCEMENT */}
            <Reveal delay={160}>
              <Link
                href="/announcements"
                className="panel clip-corner group relative flex h-full flex-col overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ borderColor: "#ffc85733" }}
              >
                <div className="absolute -right-4 -top-4 text-7xl opacity-10 transition-transform duration-500 group-hover:scale-125">
                  📢
                </div>
                <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400">
                  ANNOUNCEMENT
                </p>
                <h3 className="mt-2 font-display text-xl font-black tracking-wide text-white">
                  {announcements.announcements.length} PENGUMUMAN
                </h3>
                <div className="mt-3 flex-1 space-y-2.5">
                  {announcements.announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-start gap-2">
                      <span className="text-sm">{a.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-slate-300">
                          {a.title}
                        </span>
                        <span className="block font-mono text-[9px] text-slate-600">
                          {a.date}
                          {a.pinned ? " · 📌 disematkan" : ""}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
                <span className="mt-4 font-mono text-[10px] tracking-[0.22em] text-slate-500 transition-colors group-hover:text-amber-300">
                  BACA SEMUA ▸
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="mt-16 sm:mt-24 px-4">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="panel neon-border-magenta clip-corner relative flex flex-col items-center overflow-hidden px-6 py-14 text-center">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(600px 240px at 50% 0%, rgba(255,43,214,0.25), transparent 70%)",
                }}
              />
              <p className="relative font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">
                ETERNAL ECHOES
              </p>
              <h2 className="relative mt-3 font-display text-3xl font-black tracking-wide text-white md:text-5xl">
                LIHAT REKORMU DI LEADERBOARD
              </h2>
              <p className="relative mt-4 max-w-xl text-sm text-slate-400">
                Pantau win rate, total duel, dan progres 26 stage campaign seluruh duelist.
                Peringkat teratas disiarkan langsung di running text seluruh situs.
              </p>
              <Link
                href="/leaderboard"
                className="btn-cyber clip-corner-sm relative mt-8 border border-fuchsia-400/60 bg-fuchsia-500/20 px-8 py-4 font-display text-xs font-bold tracking-[0.24em] text-fuchsia-200"
              >
                ▸ LIHAT LEADERBOARD
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="h-10" />
      <noscript>
        <p className="p-4 text-center text-xs text-slate-500">
          Situs ini menampilkan {cards.length} kartu Forbidden Memories.
        </p>
      </noscript>
    </div>
  );
}

function SectionHeading({
  index,
  title,
  sub,
  accent,
  href,
  cta,
}: {
  index: string;
  title: string;
  sub: string;
  accent: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-end gap-4">
        <span
          className="font-display text-5xl font-black leading-none opacity-25"
          style={{ color: accent }}
        >
          {index}
        </span>
        <div>
          <h2
            className="font-display text-2xl font-black tracking-[0.06em] text-white md:text-3xl"
            style={{ textShadow: `0 0 24px ${accent}44` }}
          >
            {title}
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">{sub}</p>
        </div>
      </div>
      {href && cta && (
        <Link
          href={href}
          className="link-underline font-mono text-[10px] tracking-[0.24em]"
          style={{ color: accent }}
        >
          {cta} ▸
        </Link>
      )}
    </div>
  );
}