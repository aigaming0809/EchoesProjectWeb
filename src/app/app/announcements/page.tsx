import AnnouncementsClient from "./AnnouncementsClient";
import data from "@/data/announcements.json";

export const revalidate = 3600;

export const metadata = {
  title: "Announcement",
  description: "Pengumuman resmi, rilis fitur, dan pembaruan Eternal Echoes.",
};

export default function AnnouncementsPage() {
  const pinned = data.announcements.filter((a) => a.pinned).length;

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-amber-400">NEWS // 08</p>
          <div className="mt-2 flex flex-wrap items-end gap-4">
            <h1 className="font-display text-4xl font-black tracking-tight text-white md:text-6xl">
              ANNOUNCE
              <span className="bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent">
                MENT
              </span>
            </h1>
            <span className="clip-corner-sm mb-2 flex items-center gap-2 border border-amber-400/50 bg-amber-400/15 px-3 py-1.5 font-mono text-[11px] font-bold tracking-widest text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              {data.announcements.length} POST · {pinned} DISEMATKAN
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Pengumuman resmi dari Eternal Echoes — rilis fitur baru, pembaruan sistem,
            dan perbaikan penting. Klik judul untuk membaca selengkapnya.
          </p>
        </header>

        <AnnouncementsClient
          announcements={data.announcements}
          categories={data.categories}
        />
      </div>
    </div>
  );
}
