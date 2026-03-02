import { useRef, useCallback } from "react";
import { usePokemon, usePokemonSpecies } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { useBottomSheetDrag } from "./hooks/useBottomSheetDrag";
import "./PokemonModal.css";

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
    <div className="stat-bar">
      <span className="stat-bar__label">
        {STAT_LABELS[label] ?? label}
      </span>
      <div className="stat-bar__track">
        <div
          className="stat-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="stat-bar__value">
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
  const { sheetStyle, handleProps } = useBottomSheetDrag(onClose);
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
      <div onClick={onClose} className="pokemon-modal__backdrop" />

      <div
        className="pokemon-modal__sheet"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: sheetStyle.transform,
          transition: sheetStyle.transition,
        }}
      >
        {isLoading ? (
          <div className="pokemon-modal__loading">Loading...</div>
        ) : data ? (
          <div className="pokemon-modal__container" style={{ background: color }}>
            <div className="pokemon-modal__header" >
              <div {...handleProps} className="pokemon-modal__handle">
                <div className="pokemon-modal__handle-bar" />
              </div>

              <span className="pokemon-modal__id">
                #{String(data.id).padStart(4, "0")}
              </span>
              <h2 className="pokemon-modal__name">{data.name}</h2>

              <div className="pokemon-modal__types">
                {data.types.map((t) => (
                  <span key={t.type.name} className="pokemon-modal__type-badge">
                    {t.type.name.slice(0, 2)}
                  </span>
                ))}
              </div>

              <div className="pokemon-modal__sprite-container">
                <img
                  src={getPokemonSpriteByName(data.name)}
                  alt={data.name}
                  className="pokemon-modal__sprite"
                />
              </div>
            </div>

            <div className="pokemon-modal__content">
              {description && (
                <div>
                  <h3 className="pokemon-modal__section-title">Description</h3>
                  <p className="pokemon-modal__description">{description}</p>
                </div>
              )}

              <div>
                <h3 className="pokemon-modal__section-title pokemon-modal__section-title--stats">
                  Base stats
                </h3>
                {data.stats.map((s) => (
                  <StatBar key={s.stat.name} label={s.stat.name} value={s.base_stat} color={color} />
                ))}
              </div>
            </div>

            <div className="pokemon-modal__footer">
              <button onClick={onClose} className="pokemon-modal__close-btn">
                <span className="material-symbols-rounded pokemon-modal__close-icon">close</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
