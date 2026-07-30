"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import announcements from "@/data/announcements.json";
import patchnotes from "@/data/patchnotes.json";

type LiveData = {
  online: number;
  peak: number;
  top: {
    rank: number;
    handle: string;
    wins: number;
    losses: number;
    stagesCleared: number;
    title: string;
  }[];
  events: { id: number; kind: string; message: string }[];
};

function sessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("fm_session");
  if (!id) {
    id = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem("fm_session", id);
  }
  return id;
}

export default function LiveTicker() {
  const [data, setData] = useState<LiveData | null>(null);
  const [pulse, setPulse] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    let alive = true;
    const beat = async () => {
      try {
        const res = await fetch("/api/live", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId(),
            page: window.location.pathname,
          }),
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as LiveData;
        if (!alive) return;
        if (json.online !== prev.current) {
          prev.current = json.online;
          setPulse(true);
          setTimeout(() => setPulse(false), 900);
        }
        setData(json);
      } catch {
        /* offline – keep last snapshot */
      }
    };
    beat();
    const t = setInterval(beat, 12000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const items = useMemo(() => {
    const out: { tone: string; text: string }[] = [];
    const rate = (w: number, l: number) =>
      w + l > 0 ? Math.round((w / (w + l) * 1000)) / 10 : 0;

    if (data?.top?.length) {
      const t = data.top[0];
      out.push({
        tone: "amber",
        text: `👑 TOP DUELIST: ${t.handle} — WIN RATE ${rate(t.wins, t.losses)}% · ${
          t.wins + t.losses
        } DUEL · STAGE ${t.stagesCleared}/26`,
      });
      data.top.slice(1, 5).forEach((p) => {
        out.push({
          tone: "cyan",
          text: `#${p.rank} ${p.handle} · ${rate(p.wins, p.losses)}% WR · ${
            p.wins + p.losses
          } DUEL · STAGE ${p.stagesCleared}/26`,
        });
      });
    }
    data?.events?.slice(0, 4).forEach((e) => out.push({ tone: e.kind, text: e.message }));

    // Pengumuman yang disematkan + versi terbaru
    announcements.announcements
      .filter((a) => a.pinned)
      .slice(0, 2)
      .forEach((a) =>
        out.push({ tone: "magenta", text: `${a.icon} PENGUMUMAN: ${a.title.toUpperCase()}` }),
      );
    out.push({
      tone: "cyan",
      text: `🚀 VERSI ${patchnotes.current} — ${patchnotes.releases[0].codename} SUDAH RILIS`,
    });
    out.push({
      tone: "amber",
      text: "📥 DOWNLOAD LANGSUNG — APK (ANDROID) & EXE (WINDOWS) TANPA EMULATOR",
    });
    if (!out.length) {
      out.push(
        { tone: "cyan", text: "⚡ ETERNAL ECHOES ONLINE — 722 CARDS INDEXED" },
        { tone: "magenta", text: "🎴 25.131 FUSION COMBINATIONS LOADED" },
        { tone: "amber", text: "👑 LEADERBOARD: 26 STAGE CAMPAIGN SIAP DITAKLUKKAN" },
      );
    }
    return out;
  }, [data]);

  const toneClass = (tone: string) =>
    tone === "amber"
      ? "text-amber-300"
      : tone === "magenta" || tone === "alert"
        ? "text-fuchsia-400"
        : tone === "win"
          ? "text-lime-300"
          : "text-cyan-300";

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span
          key={`${key}-${i}`}
          className={`flex items-center whitespace-nowrap px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClass(
            it.tone,
          )}`}
        >
          {it.text}
          <span className="ml-6 text-slate-700">◆</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative z-40 flex h-9 w-full items-center border-b border-cyan-500/20 bg-[#050813]/95 backdrop-blur">
      <div className="flex h-full shrink-0 items-center gap-2 border-r border-cyan-500/20 bg-gradient-to-r from-cyan-500/15 to-transparent px-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
        </span>
        <span
          className={`font-mono text-[11px] font-bold tracking-widest text-lime-300 transition-transform ${
            pulse ? "scale-125" : "scale-100"
          }`}
        >
          {data?.online ?? "—"}
        </span>
        <span className="hidden font-mono text-[10px] tracking-widest text-slate-500 sm:inline">
          ONLINE
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track">
          {row("a")}
          {row("b")}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#050813] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#050813] to-transparent" />
      </div>
      <div className="hidden h-full shrink-0 items-center gap-2 border-l border-fuchsia-500/20 px-3 md:flex">
        <span className="font-mono text-[10px] tracking-widest text-slate-500">PEAK</span>
        <span className="font-mono text-[11px] font-bold text-fuchsia-400">
          {data?.peak ?? "—"}
        </span>
      </div>
    </div>
  );
}
