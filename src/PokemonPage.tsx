import { useState } from "react";
import { usePokemonList, usePokemon } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { PokemonModal } from "./PokemonModal";

function PokemonCard({ name, onClick }: { name: string; onClick: () => void }) {
  const { data, isLoading } = usePokemon(name);
  const primaryType = data?.types[0]?.type.name ?? "normal";
  const color = TYPE_COLORS[primaryType] ?? "#aaa";

  return (
    <div
      onClick={onClick}
      style={{
        background: color,
        borderRadius: 16,
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        animation: "fadeUp 0.4s ease both",
        transition: "transform 0.15s, filter 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)";
        (e.currentTarget as HTMLDivElement).style.filter = "brightness(1.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.filter = "brightness(1)";
      }}
    >
      {isLoading ? null : data ? (
        <img
          src={getPokemonSpriteByName(data.name)}
          alt={data.name}
          style={{ width: "70%", height: "70%", objectFit: "contain" }}
        />
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
              <div key={i} style={{ background: "#1a1a1a", borderRadius: 16, aspectRatio: "1", animation: `fadeUp 0.4s ${i * 0.03}s ease both` }} />
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
                fontFamily: "'Outfit', sans-serif", fontSize: 13, transition: "border-color 0.2s, color 0.2s",
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
                fontFamily: "'Outfit', sans-serif", fontSize: 13, opacity: !data?.next ? 0.4 : 1,
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
