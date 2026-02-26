import { useState } from "react";
import { usePokemonList, usePokemon } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min((value / 255) * 100, 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#eee" }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, #e53935, #ff6f00)`,
            borderRadius: 2,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}

function PokemonModal({ name, onClose }: { name: string; onClose: () => void }) {
  const { data, isLoading } = usePokemon(name);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 40,
          width: "100%",
          maxWidth: 420,
          position: "relative",
          animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "1px solid #2a2a2a",
            color: "#666", width: 32, height: 32, borderRadius: 6,
            cursor: "pointer", fontSize: 16, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >×</button>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>Loading...</div>
        ) : data ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <img
                src={getPokemonSpriteByName(data.name)}
                alt={data.name}
                style={{ width: 120, height: 120, imageRendering: "pixelated" }}
              />
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#e53935", textTransform: "uppercase", marginBottom: 4 }}>
                #{String(data.id).padStart(3, "0")}
              </div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 36, letterSpacing: "0.05em",
                color: "#fff", margin: "0 0 12px",
              }}>
                {data.name.toUpperCase()}
              </h2>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {data.types.map((t) => (
                  <span key={t.type.name} style={{
                    background: TYPE_COLORS[t.type.name] ?? "#444",
                    color: "#000", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "4px 12px", borderRadius: 20,
                  }}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Height", value: `${data.height / 10}m` },
                { label: "Weight", value: `${data.weight / 10}kg` },
                { label: "Base XP", value: data.base_experience },
                { label: "Abilities", value: data.abilities.filter(a => !a.is_hidden).map(a => a.ability.name).join(", ") },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "#1a1a1a", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#ddd", fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 14 }}>Base Stats</div>
              {data.stats.map((s) => (
                <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

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
