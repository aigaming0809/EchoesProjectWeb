import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import BackgroundFX from "@/components/BackgroundFX";
import SiteNav from "@/components/SiteNav";
import LiveTicker from "@/components/LiveTicker";
import ScrollProgress from "@/components/ScrollProgress";
import NavProgress from "@/components/NavProgress";

export const metadata: Metadata = {
  title: {
    default: "Yu-Gi-Oh! Eternal Echoes — Arsip Forbidden Memories",
    template: "%s · Yu-Gi-Oh! Eternal Echoes",
  },
  applicationName: "Yu-Gi-Oh! Eternal Echoes",
  description:
    "Yu-Gi-Oh! Eternal Echoes — arsip digital lengkap Forbidden Memories: 722 kartu, 25.000+ fusion, biografi duelist, deck list, alur cerita, dan leaderboard live.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines relative min-h-screen antialiased">
        <BackgroundFX />
        <ScrollProgress />
        <NavProgress />
        <div className="relative z-10 flex min-h-screen flex-col">
          <LiveTicker />
          <SiteNav />
          <main className="flex-1">{children}</main>
          <footer className="relative mt-24 border-t border-cyan-500/20 bg-[#050813]/70 backdrop-blur">
            <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <p className="font-display text-lg font-black tracking-[0.2em] text-white">
                  ETERNAL<span className="text-fuchsia-500">.</span>ECHOES
                </p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  <b className="text-slate-300">Yu-Gi-Oh! Eternal Echoes</b> — arsip
                  digital tak resmi untuk Yu-Gi-Oh! Forbidden Memories (PlayStation, 1999).
                  Seluruh data kartu, guardian star, dan fusion diambil langsung dari
                  struktur data game asli.
                </p>
                <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wider text-slate-600">
                  Yu-Gi-Oh! © Kazuki Takahashi / Konami. Situs penggemar non-komersial.
                  <br />
                  Seluruh artwork kartu dimuat 100% lokal dari folder /public/image/arworks.
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400">NAVIGASI</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  {[
                    ["/cards", "Card Database"],
                    ["/characters", "Biografi Duelist"],
                    ["/story", "Alur Cerita"],
                    ["/fusion", "Fusion Lab"],
                    ["/leaderboard", "Leaderboard"],
                    ["/download", "Download Game"],
                    ["/patch-notes", "Patch Note"],
                    ["/announcements", "Announcement"],
                    ["/gallery", "Epic Gallery"],
                  ].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="link-underline hover:text-cyan-300">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-fuchsia-400">
                  SISTEM
                </p>
                <ul className="mt-4 space-y-2 font-mono text-[11px] text-slate-500">
                  <li>722 CARDS INDEXED</li>
                  <li>25.131 FUSIONS</li>
                  <li>24 RITUAL SUMMONS</li>
                  <li>4 ZODIAC CATEGORIES</li>
                  <li>6 FIELD ARENAS</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 py-4 text-center font-mono text-[10px] tracking-[0.25em] text-slate-600">
              YU-GI-OH! ETERNAL ECHOES // BUILD 5000.BC — STATUS: ONLINE
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
