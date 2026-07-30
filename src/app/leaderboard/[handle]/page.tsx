import Link from "next/link";
import { notFound } from "next/navigation";
import BigHoloCard from "@/components/BigHoloCard";
import DeckList, { type DeckItem } from "@/components/DeckList";
import Reveal from "@/components/Reveal";
import { ATTR_COLORS, getCard, isMonster } from "@/lib/fm";
import { resolveCardImage, resolveCardThumb } from "@/lib/localCards";
import {
  DECK_SIZE,
  STAGES,
  TOTAL_STAGES,
  getPlayerProfile,
  resolveDeck,
  toSlug,
} from "@/lib/players";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const p = await getPlayerProfile(handle);
  return { title: p ? `${p.player.handle} — Profil & Deck List` : "Duelist tidak ditemukan" };
}

const rateColor = (r: number) =>
  r >= 80 ? "#9dff3c" : r >= 60 ? "#00f0ff" : r >= 40 ? "#ffc857" : "#fb7185";

const rankTone = (rank: number) =>
  rank === 1 ? "#ffd447" : rank === 2 ? "#c0d3e0" : rank === 3 ? "#e08a4a" : "#00f0ff";

export default async function DuelistProfile({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const data = await getPlayerProfile(handle);
  if (!data) notFound();

  const { player: p, prev, next, summary, source, total } = data;
  const ds = p.deckStats;
  const ace = getCard(ds.aceId);
  const accent = rankTone(p.rank);
  const wr = rateColor(p.winRate);
  const finished = p.stagesCleared >= TOTAL_STAGES;

  const deckItems: DeckItem[] = resolveDeck(p.deck).map(({ card, count }) => ({
    id: card.id,
    count,
    name: card.name,
    type: card.type,
    attribute: card.attribute,
    level: card.level,
    atk: card.atk,
    def: card.def,
    zodiac: card.zodiac,
    img: resolveCardThumb(card),
    monster: isMonster(card),
  }));

  const diffRate = Math.round((p.winRate - summary.avgWinRate) * 10) / 10;
  const avgDuels = Math.round(summary.totalDuels / Math.max(summary.duelists, 1));
  const diffDuels = p.totalDuels - avgDuels;

  const composition = [
    { label: "MONSTER", value: ds.monsters, color: "#ff6b6b" },
    { label: "MAGIC", value: ds.magics, color: "#2dd4bf" },
    { label: "EQUIP", value: ds.equips, color: "#ffc857" },
    { label: "TRAP", value: ds.traps, color: "#f472b6" },
    { label: "RITUAL", value: ds.rituals, color: "#a855f7" },
  ].filter((c) => c.value > 0);

  return (
    <div className="pb-20">
      {/* ── BANNER ─────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/10">
        {ace && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={resolveCardImage(ace)}
            alt=""
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-[3px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060f] via-[#04060f]/80 to-transparent" />
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(700px 300px at 15% 100%, ${accent}30, transparent 70%)` }}
        />
        <div className="cyber-grid absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-8 pt-8">
          <Link
            href="/leaderboard"
            className="font-mono text-[10px] tracking-[0.25em] text-slate-400 hover:text-cyan-300"
          >
            ◂ LEADERBOARD
          </Link>

          <div className="mt-5 flex flex-wrap items-end gap-5">
            <div
              className="clip-corner flex h-24 w-24 shrink-0 flex-col items-center justify-center border-2"
              style={{
                borderColor: accent,
                background: `${accent}12`,
                boxShadow: `0 0 44px -10px ${accent}`,
              }}
            >
              <span className="font-mono text-[8px] tracking-[0.25em] text-slate-400">RANK</span>
              <span
                className="font-display text-4xl font-black leading-none"
                style={{ color: accent, textShadow: `0 0 22px ${accent}77` }}
              >
                {p.rank}
              </span>
              <span className="font-mono text-[8px] text-slate-500">dari {total}</span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="clip-corner-sm px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest text-black"
                  style={{ background: accent }}
                >
                  {p.title.toUpperCase()}
                </span>
                {finished && (
                  <span className="clip-corner-sm border border-amber-400/50 bg-amber-400/15 px-2.5 py-1 font-mono text-[9px] tracking-widest text-amber-300">
                    🏆 GAME CLEARED
                  </span>
                )}
                {source === "demo" && (
                  <span className="clip-corner-sm border border-white/15 px-2.5 py-1 font-mono text-[9px] tracking-widest text-slate-400">
                    DATA DEMO
                  </span>
                )}
              </div>
              <h1
                className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl"
                style={{ textShadow: `0 0 42px ${accent}55` }}
              >
                {p.handle}
              </h1>
              <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-slate-500">
                📍 {p.region.toUpperCase()} · ⭐ {p.starchips.toLocaleString("id-ID")} STAR CHIPS
                {" · 🎴 "}
                {ds.total} KARTU
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4">
        {/* ── 3 METRIK UTAMA ───────────────────────────── */}
        <div className="grid gap-3 py-8 md:grid-cols-3">
          {[
            {
              label: "WIN RATE", value: `${p.winRate}%`, color: wr, bar: p.winRate, icon: "📊",
              sub: `${p.wins} menang · ${p.losses} kalah`,
              cmp: diffRate === 0 ? "sama dengan rata-rata"
                : `${diffRate > 0 ? "▲" : "▼"} ${Math.abs(diffRate)}% vs rata-rata (${summary.avgWinRate}%)`,
              up: diffRate >= 0,
            },
            {
              label: "TOTAL DUEL", value: p.totalDuels.toLocaleString("id-ID"), color: "#00f0ff",
              bar: Math.min((p.totalDuels / 700) * 100, 100), icon: "⚔️",
              sub: `${p.wins}W / ${p.losses}L tercatat`,
              cmp: diffDuels === 0 ? "sama dengan rata-rata"
                : `${diffDuels > 0 ? "▲" : "▼"} ${Math.abs(diffDuels)} duel vs rata-rata (${avgDuels})`,
              up: diffDuels >= 0,
            },
            {
              label: "STAGE SELESAI", value: `${p.stagesCleared}`, color: "#ffc857",
              bar: p.progress, icon: "🗺️",
              sub: `dari ${TOTAL_STAGES} stage · ${p.progress}% tuntas`,
              cmp: finished ? "seluruh campaign tamat" : `terakhir: ${p.lastStage}`,
              up: true,
            },
          ].map((m, i) => (
            <div
              key={m.label}
              className="panel clip-corner relative overflow-hidden p-6"
              style={{ animation: `rise 0.55s ${i * 90}ms both` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg,transparent,${m.color},transparent)` }}
              />
              <div className="absolute -right-3 -top-3 text-6xl opacity-10">{m.icon}</div>
              <p className="font-mono text-[9px] tracking-[0.28em] text-slate-500">{m.label}</p>
              <p
                className="mt-1 font-display text-5xl font-black tabular-nums"
                style={{ color: m.color, textShadow: `0 0 26px ${m.color}55` }}
              >
                {m.value}
                {m.label === "STAGE SELESAI" && (
                  <span className="text-xl text-slate-600">/{TOTAL_STAGES}</span>
                )}
              </p>
              <p className="mt-1 text-[12px] text-slate-400">{m.sub}</p>
              <div className="stat-bar mt-3">
                <span style={{ width: `${m.bar}%`, background: `linear-gradient(90deg, ${m.color}55, ${m.color})` }} />
              </div>
              <p className="mt-2 font-mono text-[10px]" style={{ color: m.up ? "#9dff3c" : "#fb7185" }}>
                {m.cmp}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* ── DECK LIST ──────────────────────────── */}
            <Reveal>
              <section className="panel clip-corner p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
                    DECK LIST
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    <span
                      className={ds.total === DECK_SIZE ? "text-lime-400" : "text-amber-400"}
                    >
                      {ds.total}
                    </span>
                    /{DECK_SIZE} KARTU
                    {ds.total === DECK_SIZE ? " · LEGAL" : " · BELUM LENGKAP"}
                  </p>
                </div>

                {/* bar komposisi */}
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-sm">
                  {composition.map((c) => (
                    <div
                      key={c.label}
                      title={`${c.label}: ${c.value}`}
                      style={{
                        width: `${(c.value / Math.max(ds.total, 1)) * 100}%`,
                        background: c.color,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {composition.map((c) => (
                    <span key={c.label} className="flex items-center gap-1.5 font-mono text-[9px]">
                      <span className="h-2 w-2" style={{ background: c.color }} />
                      <span className="text-slate-500">{c.label}</span>
                      <span className="font-bold" style={{ color: c.color }}>{c.value}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-5">
                  <DeckList cards={deckItems} accent={accent} />
                </div>
              </section>
            </Reveal>

            {/* ── PETA PROGRES STAGE ─────────────────── */}
            <Reveal>
              <section className="panel clip-corner p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400">
                    PROGRES CAMPAIGN
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    {p.stagesCleared}/{TOTAL_STAGES} STAGE · {p.progress}%
                  </p>
                </div>

                <div className="relative mt-4 h-3 overflow-hidden bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200"
                    style={{ width: `${p.progress}%` }}
                  />
                  <div className="sweep-shine" />
                </div>

                <div className="mt-5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {STAGES.map((s) => {
                    const done = s.no <= p.stagesCleared;
                    const current = s.no === p.stagesCleared + 1;
                    return (
                      <div
                        key={s.slug}
                        className="clip-corner-sm flex items-center gap-2.5 border px-2.5 py-2"
                        style={{
                          borderColor: done ? `${s.accent}55` : current ? "rgba(255,43,214,0.45)" : "rgba(255,255,255,0.06)",
                          background: done ? `${s.accent}0f` : current ? "rgba(255,43,214,0.08)" : "transparent",
                          opacity: done || current ? 1 : 0.4,
                        }}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[9px] font-bold"
                          style={{
                            background: done ? s.accent : current ? "#ff2bd6" : "rgba(255,255,255,0.07)",
                            color: done || current ? "#04060f" : "#64748b",
                            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                          }}
                        >
                          {done ? "✓" : s.no}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[11.5px] font-bold text-slate-200">
                            {s.name}
                          </span>
                          <span className="block font-mono text-[8px] tracking-[0.18em] text-slate-600">
                            {s.act}{current ? " · SEDANG DIHADAPI" : ""}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          </div>

          {/* ── SIDEBAR ──────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* ACE CARD dari deck */}
            {ace && (
              <div className="panel clip-corner p-5">
                <p className="mb-1 font-mono text-[9px] tracking-[0.3em] text-fuchsia-400">
                  ACE — ATK TERTINGGI DI DECK
                </p>
                <p className="mb-3 font-mono text-[9px] text-slate-600">
                  dipilih otomatis dari deck list
                </p>
                <BigHoloCard
                  img={resolveCardImage(ace)}
                  name={ace.name}
                  accent={ATTR_COLORS[ace.attribute] ?? "#00f0ff"}
                  id={ace.id}
                  desc={ace.description}
                  stats={[
                    { label: "TYPE", value: ace.type },
                    { label: "ATTRIBUTE", value: ace.attribute },
                    { label: "ATK", value: String(ace.atk) },
                    { label: "DEF", value: String(ace.def) },
                  ]}
                />
                <Link
                  href={`/cards/${ace.id}`}
                  className="mt-3 block text-center font-mono text-[10px] tracking-[0.22em] text-cyan-400 hover:text-fuchsia-400"
                >
                  ▸ LIHAT DETAIL KARTU
                </Link>
              </div>
            )}

            {/* ANALISIS DECK */}
            <div className="panel clip-corner p-5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">
                ANALISIS DECK
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["RATA-RATA ATK", ds.avgAtk.toLocaleString("id-ID"), "#ff6b6b"],
                  ["ATK TERTINGGI", ds.maxAtk.toLocaleString("id-ID"), "#ffd447"],
                  ["MONSTER", `${ds.monsters}`, "#00f0ff"],
                  ["SUPPORT", `${ds.magics + ds.traps + ds.equips + ds.rituals}`, "#a855f7"],
                ].map(([l, v, c]) => (
                  <div key={l} className="clip-corner-sm border border-white/8 bg-white/[0.02] px-2.5 py-2">
                    <p className="font-mono text-[8px] tracking-[0.18em] text-slate-500">{l}</p>
                    <p className="font-display text-lg font-black tabular-nums" style={{ color: c }}>
                      {v}
                    </p>
                  </div>
                ))}
              </div>

              {ds.types.length > 0 && (
                <>
                  <p className="mt-4 font-mono text-[8.5px] tracking-[0.22em] text-slate-500">
                    TIPE MONSTER DOMINAN
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {ds.types.slice(0, 5).map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <span className="w-[86px] shrink-0 truncate font-mono text-[9.5px] text-slate-400">
                          {t.name}
                        </span>
                        <span className="stat-bar h-1.5 flex-1">
                          <span
                            className="bg-gradient-to-r from-cyan-600 to-cyan-300"
                            style={{ width: `${(t.count / Math.max(ds.monsters, 1)) * 100}%` }}
                          />
                        </span>
                        <span className="w-5 shrink-0 text-right font-mono text-[9.5px] text-cyan-300">
                          {t.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {ds.attributes.length > 0 && (
                <>
                  <p className="mt-4 font-mono text-[8.5px] tracking-[0.22em] text-slate-500">
                    ATTRIBUTE
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ds.attributes.map((a) => (
                      <span
                        key={a.name}
                        className="clip-corner-sm border px-2 py-1 font-mono text-[9px]"
                        style={{
                          borderColor: `${ATTR_COLORS[a.name] ?? "#00f0ff"}55`,
                          color: ATTR_COLORS[a.name] ?? "#00f0ff",
                          background: `${ATTR_COLORS[a.name] ?? "#00f0ff"}12`,
                        }}
                      >
                        {a.name.toUpperCase()} {a.count}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {ds.fields.length > 0 && (
                <>
                  <p className="mt-4 font-mono text-[8.5px] tracking-[0.22em] text-slate-500">
                    FIELD CARD
                  </p>
                  <p className="mt-1 font-display text-[12px] font-bold text-lime-300">
                    🌍 {ds.fields.join(" · ")}
                  </p>
                </>
              )}
            </div>

            {/* INFO */}
            <div className="panel clip-corner p-5">
              <p className="font-mono text-[9px] tracking-[0.3em] text-slate-500">INFO DUELIST</p>
              <dl className="mt-3 space-y-2 text-[12px]">
                {[
                  ["Peringkat", `#${p.rank} dari ${total}`],
                  ["Gelar", p.title],
                  ["Region", p.region],
                  ["Stage terakhir", p.lastStage],
                  ["Status", finished ? "Tamat 26 stage" : "Masih berjuang"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-white/5 pb-1.5">
                    <dt className="shrink-0 text-slate-500">{k}</dt>
                    <dd className="truncate text-right font-semibold text-slate-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {prev ? (
                <Link
                  href={`/leaderboard/${toSlug(prev.handle)}`}
                  className="clip-corner-sm border border-white/10 p-3 transition-colors hover:border-cyan-400/50"
                >
                  <p className="font-mono text-[9px] text-slate-600">◂ RANK {prev.rank}</p>
                  <p className="truncate text-[12px] font-semibold text-slate-300">{prev.handle}</p>
                </Link>
              ) : (
                <div className="clip-corner-sm border border-white/5 p-3 opacity-40">
                  <p className="font-mono text-[9px] text-slate-600">◂ PUNCAK</p>
                  <p className="text-[12px] text-slate-500">—</p>
                </div>
              )}
              {next ? (
                <Link
                  href={`/leaderboard/${toSlug(next.handle)}`}
                  className="clip-corner-sm border border-white/10 p-3 text-right transition-colors hover:border-cyan-400/50"
                >
                  <p className="font-mono text-[9px] text-slate-600">RANK {next.rank} ▸</p>
                  <p className="truncate text-[12px] font-semibold text-slate-300">{next.handle}</p>
                </Link>
              ) : (
                <div className="clip-corner-sm border border-white/5 p-3 text-right opacity-40">
                  <p className="font-mono text-[9px] text-slate-600">DASAR ▸</p>
                  <p className="text-[12px] text-slate-500">—</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
