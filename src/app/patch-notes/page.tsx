import PatchNotesClient from "./PatchNotesClient";
import data from "@/data/patchnotes.json";

export const revalidate = 3600;

export const metadata = {
  title: "Patch Note",
  description: "Riwayat lengkap pembaruan dan perbaikan Eternal Echoes.",
};

export default function PatchNotesPage() {
  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-fuchsia-400">
            CHANGELOG // 07
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">
              PATCH{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                NOTE
              </span>
            </h1>
            <span className="clip-corner-sm mb-2 border border-lime-400/50 bg-lime-400/15 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-lime-300">
              ● {data.current}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Riwayat lengkap seluruh pembaruan Eternal Echoes — fitur baru, perubahan
            sistem, dan perbaikan bug. Klik versi untuk melihat detail perubahannya.
          </p>
        </header>

        <PatchNotesClient releases={data.releases} />
      </div>
    </div>
  );
}
