import Link from "next/link";
import AssetManagerClient, {
  type AssetRow,
  type DuelistRow,
} from "./AssetManagerClient";
import { cards, characters } from "@/lib/fm";
import {
  hasLocalImage,
  resolveCardThumb,
  getScan,
  suggestedFilename,
} from "@/lib/localCards";
import {
  getDuelistScan,
  hasDuelistAvatar,
  hasDuelistPortrait,
  resolveDuelistPortrait,
  suggestedDuelistFiles,
} from "@/lib/localDuelists";

export const dynamic = "force-dynamic";
export const metadata = { title: "Asset Manager" };

export default function AssetsPage() {
  const scanResult = getScan();
  const duelistScan = getDuelistScan();

  const duelists: DuelistRow[] = characters.map((c) => {
    const f = suggestedDuelistFiles(c.slug);
    return {
      slug: c.slug,
      name: c.name,
      faction: c.faction,
      portraitFile: f.portrait,
      avatarFile: f.avatar,
      img: resolveDuelistPortrait(c.slug),
      hasPortrait: hasDuelistPortrait(c.slug),
      hasAvatar: hasDuelistAvatar(c.slug),
    };
  });
  const rows: AssetRow[] = cards.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    attribute: c.attribute,
    filename: suggestedFilename(c.id),
    img: resolveCardThumb(c),
    local: hasLocalImage(c.id),
  }));

  return (
    <div className="px-4 pb-20 pt-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] text-lime-400">ASSETS // 06</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white md:text-6xl">
            ASSET{" "}
            <span className="bg-gradient-to-r from-lime-300 to-cyan-300 bg-clip-text text-transparent">
              MANAGER
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Situs memakai <b className="text-slate-200">dua folder gambar terpisah</b>:{" "}
            <code className="rounded bg-cyan-500/10 px-1.5 py-0.5 font-mono text-cyan-300">
              public/image/arworks/
            </code>{" "}
            untuk artwork 722 kartu, dan{" "}
            <code className="rounded bg-fuchsia-500/10 px-1.5 py-0.5 font-mono text-fuchsia-300">
              public/duelists/
            </code>{" "}
            untuk potret 30 duelist. Pilih tab di bawah untuk melihat nama file yang
            dibutuhkan.
          </p>
        </header>

        {/* PANDUAN */}
        <section className="panel clip-corner mb-8 p-6 md:p-8">
          <p className="font-mono text-[10px] tracking-[0.3em] text-fuchsia-400">
            CARA MENGGANTI GAMBAR KARTU
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                no: "01",
                title: "BUKA FOLDER",
                accent: "#00f0ff",
                body: (
                  <>
                    Semua gambar ada di satu folder:
                    <code className="mt-2 block bg-black/50 px-3 py-2 font-mono text-[11px] text-cyan-300">
                      public/image/arworks/
                    </code>
                    Boleh dibuat subfolder (mis. <code className="text-slate-300">public/image/arworks/dragons/</code>),
                    tetap terbaca.
                  </>
                ),
              },
              {
                no: "02",
                title: "BERI NAMA FILE",
                accent: "#ff2bd6",
                body: (
                  <>
                    Pakai <b className="text-slate-200">ID kartu</b> (lihat nomor #XXX di
                    setiap kartu):
                    <code className="mt-2 block bg-black/50 px-3 py-2 font-mono text-[11px] text-fuchsia-300">
                      001.png → Blue-eyes W. Dragon
                      <br />
                      035.jpg → Dark Magician
                      <br />
                      722.webp → M. of Black Chaos
                    </code>
                  </>
                ),
              },
              {
                no: "03",
                title: "REFRESH SAJA",
                accent: "#9dff3c",
                body: (
                  <>
                    Folder discan ulang otomatis (dev 2 detik, production 15 detik).
                    <code className="mt-2 block bg-black/50 px-3 py-2 font-mono text-[11px] text-lime-300">
                      cukup refresh browser
                    </code>
                    Di Vercel: commit + push, lalu redeploy.
                  </>
                ),
              },
            ].map((s) => (
              <div
                key={s.no}
                className="clip-corner-sm border p-4"
                style={{ borderColor: `${s.accent}33` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-display text-2xl font-black opacity-40"
                    style={{ color: s.accent }}
                  >
                    {s.no}
                  </span>
                  <p
                    className="font-display text-[12px] font-bold tracking-[0.14em]"
                    style={{ color: s.accent }}
                  >
                    {s.title}
                  </p>
                </div>
                <div className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
                  {s.body}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="clip-corner-sm border border-white/10 bg-white/[0.02] p-4">
              <p className="font-mono text-[9px] tracking-[0.28em] text-cyan-400">
                ✓ FORMAT PENAMAAN YANG DITERIMA
              </p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                <li>
                  <span className="text-lime-400">001.png</span> · 1.png · card-001.jpg —{" "}
                  <span className="text-slate-600">ID kartu</span>
                </li>
                <li>
                  <span className="text-lime-400">89631139.jpg</span> —{" "}
                  <span className="text-slate-600">password 8 digit</span>
                </li>
                <li>
                  <span className="text-lime-400">dark-magician.png</span> —{" "}
                  <span className="text-slate-600">nama kartu</span>
                </li>
                <li>
                  <span className="text-lime-400">Gate Guardian.webp</span> —{" "}
                  <span className="text-slate-600">nama dengan spasi</span>
                </li>
              </ul>
              <p className="mt-3 font-mono text-[10px] text-slate-600">
                Ekstensi: .png .jpg .jpeg .webp .gif .avif
              </p>
            </div>
            <div className="clip-corner-sm border border-white/10 bg-white/[0.02] p-4">
              <p className="font-mono text-[9px] tracking-[0.28em] text-amber-400">
                ⚙️ SUMBER GAMBAR — 100% LOKAL
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                <b className="text-lime-300">Tidak ada CDN / domain luar sama sekali.</b>{" "}
                Server hanya membaca folder{" "}
                <code className="rounded bg-black/50 px-1 font-mono text-[10.5px] text-cyan-300">
                  public/image/arworks
                </code>
                . Semua artwork sepenuhnya milikmu.
              </p>
              <ol className="mt-3 space-y-1.5 text-[12px] text-slate-400">
                <li>
                  <b className="text-lime-300">1. File lokal</b> — public/image/arworks/ → dipakai
                </li>
                <li>
                  <b className="text-slate-300">2. Placeholder SVG</b> — kalau file belum
                  ada, menampilkan nama file yang dibutuhkan
                </li>
              </ol>
              <p className="mt-3 text-[11.5px] leading-relaxed text-fuchsia-300/80">
                Placeholder bukan error — itu penanda kartu tersebut menunggu artwork
                darimu.
              </p>
              <p className="mt-3 font-mono text-[10px] leading-relaxed text-slate-600">
                Terdeteksi: {scanResult.totalFiles} file di folder, {scanResult.byId.size}{" "}
                cocok dengan kartu.
              </p>
            </div>
          </div>

          <p className="mt-5 text-[12.5px] text-slate-500">
            Tidak tahu ID sebuah kartu? Buka{" "}
            <Link href="/cards" className="link-underline text-cyan-300">
              Card Database
            </Link>{" "}
            — nomor <b className="text-slate-300">#XXX</b> tampil di pojok kiri atas setiap
            kartu. Atau cari langsung di daftar bawah ini.
          </p>
        </section>

        <AssetManagerClient
          rows={rows}
          unmatched={scanResult.unmatched}
          duelists={duelists}
          duelistUnmatched={duelistScan.unmatched}
        />
      </div>
    </div>
  );
}
