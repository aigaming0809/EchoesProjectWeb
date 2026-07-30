"use client";

import { useState } from "react";

type ProcessedCard = {
  id: number;
  name: string;
  atk: number;
  def: number;
  type: string;
  attribute: string;
  zodiac: string[];
  category: string;
  level: number;
  description: string;
  limit: string;
  _meta: {
    hasEffect: boolean;
  };
};

const EFFECT_TYPES = ["Magic", "Trap", "Equip", "Ritual"];

function determineCategory(type: string, level: number, atk: number): string {
  if (type === "Ritual" || type === "Ritual Monster") return "Ritual";
  if (type === "Magic" || type === "Spell") return "Magic";
  if (type === "Equip") return "Equip";
  if (type === "Trap") return "Trap";
  if (level >= 5 || atk >= 2000) return "Effect";
  return "Normal";
}

export default function JsonToolClient() {
  const [rawInput, setRawInput] = useState("");
  const [result, setResult] = useState<{
    cards: ProcessedCard[];
    stats: { total: number; minId: number; maxId: number; effects: number; normals: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleJson = `[
  {
    "id": 723,
    "name": "Slifer the Sky Dragon",
    "atk": 4000,
    "def": 4000,
    "type": "Dragon",
    "attribute": "Light",
    "zodiac": ["Sun", "Mars"],
    "category": "Effect",
    "level": 10,
    "description": "The second of the legendary Egyptian Gods.",
    "limit": "Unlimited"
  }
]`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRawInput(evt.target?.result as string ?? "");
    };
    reader.readAsText(file);
  };

  const processJson = () => {
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(rawInput);
      const list = Array.isArray(parsed) ? parsed : [parsed];

      let minId = Infinity;
      let maxId = -Infinity;
      let effects = 0;
      let normals = 0;

      const processed: ProcessedCard[] = list.map((item, idx) => {
        const id = Number(item.id ?? idx + 723);
        const name = String(item.name ?? `Custom Card #${id}`);
        const description = String(item.description ?? item.desc ?? "Custom artwork card.");
        const type = String(item.type ?? "Dragon");
        const attribute = String(item.attribute ?? "Light");
        const level = Number(item.level ?? 4);
        const atk = Number(item.atk ?? item.attack ?? 0);
        const def = Number(item.def ?? item.defense ?? 0);
        const zodiac: string[] = Array.isArray(item.zodiac)
          ? item.zodiac
          : [item.gsA, item.gsB].filter(Boolean);
        const limit = String(item.limit ?? "Unlimited");

        if (id < minId) minId = id;
        if (id > maxId) maxId = id;

        const hasEffect = EFFECT_TYPES.includes(type) || level >= 5 || atk >= 2000;
        if (hasEffect) effects++;
        else normals++;

        const category = String(item.category ?? determineCategory(type, level, atk));

        return {
          id,
          name,
          atk,
          def,
          type,
          attribute,
          zodiac,
          category,
          level,
          description,
          limit,
          _meta: { hasEffect },
        };
      });

      setResult({
        cards: processed,
        stats: {
          total: processed.length,
          minId: minId === Infinity ? 0 : minId,
          maxId: maxId === -Infinity ? 0 : maxId,
          effects,
          normals,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Format JSON tidak valid.");
    }
  };

  const downloadJson = () => {
    if (!result) return;
    // Hapus _meta sebelum didownload agar bersih untuk database
    const clean = result.cards.map(({ _meta, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extra_cards.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="panel clip-corner p-6 md:p-8">
        <p className="font-mono text-[9px] tracking-[0.3em] text-lime-400">
          JSON NORMALIZER &amp; AUTO-DETECT TOOL
        </p>
        <h2 className="mt-2 font-display text-2xl font-black text-white">
          IMPORT &amp; SESUAIKAN KARTU (ID 723+)
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          Gunakan tools ini untuk memasukkan file JSON mentah (kartu 723 sampai 855 atau kartu
          kustom). Sistem akan otomatis memvalidasi, melengkapi data yang kosong, mendeteksi
          kategori frame, dan menghasilkan JSON bersih yang siap di-download.
        </p>

        {/* Input area */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-cyber clip-corner-sm inline-flex cursor-pointer items-center gap-2 border border-cyan-400/60 bg-cyan-400/15 px-4 py-2.5 font-display text-xs font-bold tracking-[0.16em] text-cyan-200">
              📁 UPLOAD FILE .JSON
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => setRawInput(sampleJson)}
              className="clip-corner-sm border border-white/10 px-4 py-2.5 font-mono text-[11px] tracking-widest text-slate-400 hover:text-white"
            >
              📋 MUAT CONTOH JSON
            </button>
            <span className="font-mono text-[10px] text-slate-500">
              {rawInput.length ? `${rawInput.length} karakter` : "Belum ada input"}
            </span>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={10}
            placeholder="Paste array JSON kartu kamu di sini..."
            className="clip-corner-sm w-full border border-cyan-500/30 bg-[#050914] p-4 font-mono text-[12px] text-cyan-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={processJson}
              disabled={!rawInput.trim()}
              className="btn-cyber clip-corner-sm border border-lime-400/60 bg-lime-500/20 px-8 py-3.5 font-display text-xs font-black tracking-[0.2em] text-lime-200 disabled:opacity-40"
            >
              ⚙️ PROSES &amp; AUTO-DETECT
            </button>
            {result && (
              <button
                onClick={downloadJson}
                className="btn-cyber clip-corner-sm border border-fuchsia-400/60 bg-fuchsia-500/20 px-8 py-3.5 font-display text-xs font-black tracking-[0.2em] text-fuchsia-200"
              >
                ⬇ DOWNLOAD extra_cards.json
              </button>
            )}
          </div>

          {error && (
            <div className="clip-corner-sm border border-rose-500/40 bg-rose-500/10 p-4 font-mono text-[11px] text-rose-300">
              ❌ ERROR: {error}
            </div>
          )}
        </div>
      </div>

      {/* HASIL PROSES */}
      {result && (
        <div className="panel clip-corner space-y-6 p-6 md:p-8 anim-rise">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-cyan-400">HASIL NORMALISASI</p>
              <h3 className="font-display text-xl font-black text-white">
                {result.stats.total} Kartu Berhasil Diproses
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 font-mono text-[11px]">
              <span className="text-cyan-300">ID Range: #{result.stats.minId} — #{result.stats.maxId}</span>
              <span className="text-lime-300">Ber-efek: {result.stats.effects}</span>
              <span className="text-slate-400">Normal: {result.stats.normals}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {result.cards.map((c) => (
              <div
                key={c.id}
                className="clip-corner-sm border border-white/8 bg-white/[0.02] p-3.5"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-cyan-400">#{String(c.id).padStart(3, "0")}</span>
                  <span
                    className="rounded px-1.5 py-0.5 font-bold text-black"
                    style={{
                      background:
                        c.category === "Magic"
                          ? "#2dd4bf"
                          : c.category === "Trap"
                            ? "#f472b6"
                            : c.category === "Effect"
                              ? "#ffc857"
                              : "#9dff3c",
                    }}
                  >
                    {c.category.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1.5 font-display text-[13px] font-bold text-slate-100">
                  {c.name}
                </p>
                <p className="mt-0.5 font-mono text-[9.5px] text-slate-500">
                  {c.type} · {c.attribute} · Lv {c.level}
                </p>
                <div className="mt-2 flex justify-between font-mono text-[10px]">
                  <span className="text-rose-400">ATK {c.atk}</span>
                  <span className="text-sky-400">DEF {c.def}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
