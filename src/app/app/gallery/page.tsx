import GalleryClient from "./GalleryClient";
import data from "@/data/gallery.json";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Gallery — Momen Epic Player",
  description: "Koleksi momen epic, combo fusion, dan kemenangan dramatis para duelist Yu-Gi-Oh! Eternal Echoes.",
};

export default function GalleryPage() {
  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-400">COMMUNITY // 10</p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">
              EPIC{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                GALLERY
              </span>
            </h1>
            <span className="clip-corner-sm mb-2 border border-cyan-400/50 bg-cyan-400/15 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-cyan-300">
              📸 {data.moments.length} MOMEN DIUNGGAH
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Koleksi momen epic, kombo fusion paling mematikan, dan kemenangan dramatis
            yang dibagikan oleh para duelist di seluruh jaringan.
          </p>
        </header>

        <GalleryClient moments={data.moments} categories={data.categories} />
      </div>
    </div>
  );
}
