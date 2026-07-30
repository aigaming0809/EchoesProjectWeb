"use client";

import { useMemo, useState } from "react";
import { CardArt } from "@/components/HoloCard";

type CommentItem = { id: string; author: string; text: string; date: string };

type Moment = {
  id: string;
  title: string;
  player: string;
  category: string;
  date: string;
  likes: number;
  views: string;
  accent: string;
  tag: string;
  desc: string;
  image: string;
  commentsList: CommentItem[];
};

type Cat = { id: string; label: string; accent: string };

export default function GalleryClient({
  moments: initialMoments,
  categories,
}: {
  moments: Moment[];
  categories: Cat[];
}) {
  const [cat, setCat] = useState("all");
  const [moments, setMoments] = useState(initialMoments);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form komentar
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const selected = useMemo(
    () => moments.find((m) => m.id === selectedId) ?? null,
    [moments, selectedId],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: moments.length };
    moments.forEach((m) => (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [moments]);

  const view = useMemo(
    () => (cat === "all" ? moments : moments.filter((m) => m.category === cat)),
    [moments, cat],
  );

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLiked((s) => {
      const next = !s[id];
      setMoments((list) =>
        list.map((m) => (m.id === id ? { ...m, likes: m.likes + (next ? 1 : -1) } : m)),
      );
      return { ...s, [id]: next };
    });
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !text.trim()) return;
    const cleanAuthor = author.trim() || "Anonymous Duelist";
    const cleanText = text.trim();
    const newC: CommentItem = {
      id: `c_${Date.now()}`,
      author: cleanAuthor,
      text: cleanText,
      date: "Baru saja",
    };

    setMoments((list) =>
      list.map((m) =>
        m.id === selected.id ? { ...m, commentsList: [...m.commentsList, newC] } : m,
      ),
    );
    setText("");
  };

  return (
    <div>
      {/* FILTER */}
      <div className="panel clip-corner flex flex-wrap items-center gap-2 p-4">
        <span className="font-mono text-[9px] tracking-[0.28em] text-slate-500">KATEGORI</span>
        {categories.map((c) => {
          const n = counts[c.id] ?? 0;
          if (c.id !== "all" && n === 0) return null;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className="clip-corner-sm border px-3 py-1.5 font-mono text-[10px] tracking-widest transition-all hover:-translate-y-0.5"
              style={
                cat === c.id
                  ? { borderColor: c.accent, background: `${c.accent}22`, color: c.accent }
                  : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }
              }
            >
              {c.label} <span className="opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      {/* GRID MOMEN */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {view.map((m, i) => {
          const isLiked = liked[m.id];
          return (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className="panel clip-corner group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              style={{
                borderColor: `${m.accent}44`,
                animation: `rise 0.5s ${Math.min(i * 70, 400)}ms both`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{ background: `linear-gradient(90deg,transparent,${m.accent},transparent)` }}
              />

              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                <CardArt
                  src={m.image}
                  alt={m.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-transparent to-transparent" />
                <span
                  className="absolute left-3 top-3 clip-corner-sm px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-black"
                  style={{ background: m.accent }}
                >
                  {m.tag}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>@{m.player}</span>
                  <span>{m.date}</span>
                </div>

                <h3 className="mt-2 font-display text-base font-black leading-snug text-white transition-colors group-hover:text-cyan-300">
                  {m.title}
                </h3>

                <p className="mt-2.5 flex-1 line-clamp-3 text-[12.5px] leading-relaxed text-slate-400">
                  {m.desc}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3 font-mono text-[11px]">
                  <button
                    onClick={(e) => toggleLike(m.id, e)}
                    className="flex items-center gap-1.5 transition-colors hover:text-rose-400"
                    style={{ color: isLiked ? "#fb7185" : "#94a3b8" }}
                  >
                    <span>{isLiked ? "❤️" : "🤍"}</span>
                    <span className="font-bold">{m.likes}</span>
                  </button>

                  <div className="flex items-center gap-3 text-slate-500">
                    <span>👁️ {m.views}</span>
                    <span>💬 {m.commentsList.length}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX MODAL DENGAN KOMENTAR */}
      {selected && (
        <div
          onClick={() => setSelectedId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel clip-corner relative max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-8"
            style={{ borderColor: `${selected.accent}66` }}
          >
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Tutup"
              className="absolute right-4 top-4 font-mono text-sm text-slate-400 hover:text-white"
            >
              ✕ TUTUP
            </button>

            <span
              className="clip-corner-sm inline-block px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-black"
              style={{ background: selected.accent }}
            >
              {selected.tag}
            </span>

            <h2 className="mt-3 font-display text-2xl font-black text-white md:text-3xl">
              {selected.title}
            </h2>
            <p className="mt-1 font-mono text-[11px] text-slate-500">
              Dipublikasikan oleh <b className="text-slate-300">@{selected.player}</b> pada{" "}
              {selected.date}
            </p>

            <div className="mt-5 aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
              <CardArt src={selected.image} alt={selected.title} className="h-full w-full object-contain" />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              {selected.desc}
            </p>

            {/* Statistik like & views */}
            <div className="mt-5 flex flex-wrap items-center justify-between border-t border-white/10 pt-4 font-mono text-xs">
              <button
                onClick={(e) => toggleLike(selected.id, e)}
                className="flex items-center gap-2"
                style={{ color: liked[selected.id] ? "#fb7185" : "#94a3b8" }}
              >
                <span className="text-lg">{liked[selected.id] ? "❤️" : "🤍"}</span>
                <span>{selected.likes} Suka</span>
              </button>
              <div className="flex gap-4 text-slate-400">
                <span>👁️ {selected.views} Dilihat</span>
                <span>💬 {selected.commentsList.length} Komentar</span>
              </div>
            </div>

            {/* ── AREA KOMENTAR ───────────────────────────── */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400">
                DISKUSI DUELIST ({selected.commentsList.length})
              </p>

              <form onSubmit={addComment} className="mt-4 space-y-3">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nama / Handle duelist (opsional)…"
                  className="clip-corner-sm w-full border border-white/10 bg-[#050914] px-3.5 py-2.5 font-mono text-[12px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  <input
                    required
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis komentar atau apresiasi momen…"
                    className="clip-corner-sm flex-1 border border-cyan-500/30 bg-[#050914] px-3.5 py-2.5 font-mono text-[12px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="btn-cyber clip-corner-sm border border-cyan-400/60 bg-cyan-400/15 px-6 py-2.5 font-display text-xs font-bold tracking-[0.18em] text-cyan-200"
                  >
                    KIRIM
                  </button>
                </div>
              </form>

              <div className="mt-5 space-y-3">
                {selected.commentsList.length === 0 ? (
                  <p className="py-6 text-center font-mono text-[11px] text-slate-600">
                    Belum ada komentar. Jadilah yang pertama memberikan ulasan!
                  </p>
                ) : (
                  selected.commentsList.map((cm) => (
                    <div
                      key={cm.id}
                      className="clip-corner-sm border border-white/8 bg-white/[0.02] p-3.5"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-cyan-300">@{cm.author}</span>
                        <span className="text-slate-600">{cm.date}</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">
                        {cm.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
