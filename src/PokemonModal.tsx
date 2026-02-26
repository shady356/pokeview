import { usePokemon } from "./services/pokemon/pokemonQueries";
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

export function PokemonModal({ name, onClose }: { name: string; onClose: () => void }) {
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