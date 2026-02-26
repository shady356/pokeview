import { useState } from "react";
import { usePokemonList, usePokemon } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { PokemonModal } from "./PokemonModal";

function PokemonCard({ name, onClick }: { name: string; onClick: () => void }) {
  const { data, isLoading } = usePokemon(name);
  const primaryType = data?.types[0]?.type.name ?? "normal";
  const color = TYPE_COLORS[primaryType] ?? "#eee";

  return (
    <div
      onClick={onClick}
      style={{
        background: "#111",
        border: "1px solid #1e1e1e",
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        animation: "fadeUp 0.4s ease both",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = color;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${color}22`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#1e1e1e";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {isLoading ? (
        <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #222", borderTopColor: "#e53935", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : data ? (
        <>
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 80, height: 80, borderRadius: "50%",
            background: `${color}15`,
          }} />
          <div style={{ fontSize: 9, letterSpacing: "0.15em", color: "#e53935", textTransform: "uppercase", marginBottom: 4 }}>
            #{String(data.id).padStart(3, "0")}
          </div>
          <img
            src={getPokemonSpriteByName(data.name)}
            alt={data.name}
            style={{ width: 80, height: 80, imageRendering: "pixelated", display: "block" }}
          />
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20, letterSpacing: "0.05em", color: "#fff", margin: "4px 0 8px",
          }}>
            {data.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {data.types.map((t) => (
              <span key={t.type.name} style={{
                background: `${TYPE_COLORS[t.type.name] ?? "#444"}22`,
                color: TYPE_COLORS[t.type.name] ?? "#aaa",
                border: `1px solid ${TYPE_COLORS[t.type.name] ?? "#444"}44`,
                fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "3px 8px", borderRadius: 20,
              }}>
                {t.type.name}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function PokemonPage() {
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const limit = 24;

  const { data, isLoading, isError } = usePokemonList({ limit, offset });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; color: #e0e0e0; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#e53935", marginBottom: 8 }}>
            Pokédex
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 8vw, 88px)",
            letterSpacing: "0.04em", lineHeight: 0.95,
            color: "#fff",
          }}>
            CHOOSE<br />YOUR<br />FIGHTER
          </h1>
          <p style={{ marginTop: 16, color: "#555", fontSize: 14, maxWidth: 360 }}>
            Powered by PokéAPI & TanStack Query. Click any card to inspect stats.
          </p>
        </div>

        {/* Grid */}
        {isError && (
          <div style={{ color: "#e53935", background: "#1a0a0a", border: "1px solid #3a1010", borderRadius: 8, padding: "20px 24px", fontSize: 14 }}>
            Failed to load Pokémon. Check your connection.
          </div>
        )}

        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, height: 160, animation: `fadeUp 0.4s ${i * 0.03}s ease both` }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {data?.results.map((p, i) => (
              <div key={p.name} style={{ animationDelay: `${i * 0.03}s` }}>
                <PokemonCard name={p.name} onClick={() => setSelected(p.name)} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48, justifyContent: "center" }}>
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              style={{
                background: "none", border: "1px solid #2a2a2a", color: offset === 0 ? "#333" : "#aaa",
                borderRadius: 6, padding: "10px 24px", cursor: offset === 0 ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, transition: "border-color 0.2s, color 0.2s",
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 12, color: "#444", letterSpacing: "0.1em" }}>
              {offset + 1}–{offset + limit} / {data?.count ?? "?"}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={!data?.next}
              style={{
                background: "#e53935", border: "none", color: "#fff",
                borderRadius: 6, padding: "10px 24px", cursor: !data?.next ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: !data?.next ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selected && <PokemonModal name={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
