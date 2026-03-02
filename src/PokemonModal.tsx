import { useRef, useCallback } from "react";
import { usePokemon, usePokemonSpecies } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min((value / 255) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: "#555", width: 64, flexShrink: 0 }}>
        {STAT_LABELS[label] ?? label}
      </span>
      <div style={{ flex: 1, height: 6, background: "#E8E8EA", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#2B2D42", width: 32, textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

interface PokemonModalProps {
  name: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function PokemonModal({ name, onClose, onNext, onPrev, hasNext, hasPrev }: PokemonModalProps) {
  const { data, isLoading } = usePokemon(name);
  const { data: species } = usePokemonSpecies(data?.id);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiping.current = false;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Only trigger if horizontal swipe is dominant and long enough
    if (absDx > 50 && absDx > absDy * 1.5) {
      if (dx < 0 && hasNext) onNext?.();
      else if (dx > 0 && hasPrev) onPrev?.();
      swiping.current = true;
    }
    touchStart.current = null;
  }, [hasNext, hasPrev, onNext, onPrev]);

  const primaryType = data?.types[0]?.type.name ?? "normal";
  const color = TYPE_COLORS[primaryType] ?? "#aaa";

  const description = species?.flavor_text_entries
    .find((e) => e.language.name === "en")
    ?.flavor_text.replace(/[\f\n\r]/g, " ");

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 100,
          transition: "opacity 0.25s ease",
        }}
      />

      {/* bottom sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "92vh",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.35s cubic-bezier(0.4,0,0.2,1)",
          touchAction: "pan-y",
        }}
      >
        {isLoading ? (
          <div style={{
            background: "#fff",
            borderRadius: "24px 24px 0 0",
            padding: 60,
            textAlign: "center",
            color: "#999",
          }}>
            Loading...
          </div>
        ) : data ? (
          <>
            {/* Top colored section */}
            <div
              style={{
                background: color,
                borderRadius: "24px 24px 0 0",
                padding: "12px 24px 0",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                flexShrink: 0,
              }}
            >
              {/* drag handle */}
              <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: 12 }}>
                <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.4)" }} />
              </div>

              {/* ID + Name */}
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,0.4)" }}>
                #{String(data.id).padStart(4, "0")}
              </span>
              <h2 style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#fff",
                margin: "2px 0 10px",
                textTransform: "capitalize",
              }}>
                {data.name}
              </h2>

              {/* Type badges */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {data.types.map((t) => (
                  <span
                    key={t.type.name}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fff",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.type.name.slice(0, 2)}
                  </span>
                ))}
              </div>

              {/* Sprite */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                position: "relative",
                height: 160,
              }}>
                <div style={{
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }} />
                <img
                  src={getPokemonSpriteByName(data.name)}
                  alt={data.name}
                  style={{
                    width: 180,
                    height: 180,
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 1,
                    marginTop: -10,
                  }}
                />
              </div>
            </div>

            {/* Bottom white section */}
            <div
              style={{
                background: "#fff",
                borderRadius: "24px 24px 0 0",
                marginTop: -24,
                position: "relative",
                zIndex: 2,
                padding: "28px 24px 24px",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {/* Description */}
              {description && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2B2D42", marginBottom: 8 }}>
                    Description
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "#666", margin: 0 }}>
                    {description}
                  </p>
                </div>
              )}

              {/* Base Stats */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2B2D42", marginBottom: 14 }}>
                  Base stats
                </h3>
                {data.stats.map((s) => (
                  <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} color={color} />
                ))}
              </div>
            </div>

            {/* Close button */}
            <div style={{
              background: "#fff",
              display: "flex",
              justifyContent: "center",
              padding: "8px 0 20px",
            }}>
              <button
                onClick={onClose}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: "#2B2D42",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
