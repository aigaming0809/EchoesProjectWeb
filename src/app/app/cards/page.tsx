import CardBrowser, { type SlimCard } from "./CardBrowser";
import { cards } from "@/lib/fm";

export const revalidate = 3600;

export const metadata = {
  title: "Card Database",
  description:
    "Database lengkap 722 kartu Yu-Gi-Oh! Forbidden Memories dengan Guardian Star, attribute, dan ATK/DEF.",
};

/**
 * Halaman ini PRERENDERED (statis) dan seluruh filter/paginasi berjalan di
 * browser. Efeknya: pindah halaman & ganti filter terasa instan karena tidak
 * ada permintaan ke server sama sekali.
 *
 * Payload indeks ringkas ±55 KB (≈15 KB setelah gzip).
 */
export default function CardsPage() {
  const index: SlimCard[] = cards.map((c) => [
    c.id, c.name, c.type, c.attribute, c.level, c.atk, c.def, c.zodiac, c.category,
  ]);

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">
            DATABASE // 01
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            CARD{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
              DATABASE
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Seluruh <b className="text-slate-200">722 kartu</b> Yu-Gi-Oh! Forbidden Memories
            lengkap dengan Guardian Star, attribute, level, ATK/DEF, dan resep fusion.
            Filter dan paginasi berjalan{" "}
            <b className="text-lime-300">instan tanpa memuat ulang halaman</b>.
          </p>
        </header>

        <CardBrowser index={index} />
      </div>
    </div>
  );
}