import { useState } from "react";
import { REGIONS, POKEMON_TYPES, type Region, type PokemonTypeName } from "./services/pokemon/pokemonApi";
import { Tag } from "./components/Tag";
import { Badge } from "./components/Badge";
import { useBottomSheetDrag } from "./hooks/useBottomSheetDrag";
import "./FilterDrawer.css";

export interface Filters {
  region: Region | null;
  types: PokemonTypeName[];
}

interface FilterDrawerProps {
  open: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

export function FilterDrawer({ open, filters, onApply, onClose }: FilterDrawerProps) {
  const [regionsOpen, setRegionsOpen] = useState(true);
  const [typesOpen, setTypesOpen] = useState(true);
  const { sheetStyle, handleProps } = useBottomSheetDrag(onClose);

  const setRegion = (r: Region | null) => {
    onApply({ ...filters, region: r });
  };

  const toggleType = (t: PokemonTypeName) => {
    const types = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onApply({ ...filters, types });
  };

  const regionLabel = filters.region?.name ?? "All";
  const typeCount = filters.types.length;

  return (
    <>
      <div
        onClick={onClose}
        className={`filter-drawer__backdrop${!open ? " filter-drawer__backdrop--hidden" : ""}`}
      />

      <div
        className={`filter-drawer__sheet${open ? " filter-drawer__sheet--open" : ""}`}
        style={{
          transform: open ? (sheetStyle.transform ?? undefined) : undefined,
          transition: open ? sheetStyle.transition : undefined,
        }}
      >
        <div {...handleProps} className="filter-drawer__handle">
          <div className="filter-drawer__handle-bar" />
        </div>

        <div className="filter-drawer__title">Filter Pokémon</div>

        <div className="filter-drawer__content">
          {/* Regions */}
          <div className="filter-drawer__section">
            <button
              onClick={() => setRegionsOpen(!regionsOpen)}
              className="filter-drawer__section-header"
            >
              <span className="filter-drawer__section-label">Regions</span>
              <Tag label={regionLabel} selected={filters.region !== null} />
              <span
                className={`material-symbols-rounded filter-drawer__section-chevron${!regionsOpen ? " filter-drawer__section-chevron--collapsed" : ""}`}
              >
                expand_more
              </span>
            </button>

            {regionsOpen && (
              <div className="filter-drawer__tags">
                {REGIONS.map((r) => (
                  <Tag
                    key={r.name}
                    label={r.name}
                    selected={filters.region?.name === r.name}
                    onClick={() => setRegion(filters.region?.name === r.name ? null : r)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Types */}
          <div className="filter-drawer__section">
            <button
              onClick={() => setTypesOpen(!typesOpen)}
              className="filter-drawer__section-header"
            >
              <span className="filter-drawer__section-label">Types</span>
              <Badge value={typeCount} selected={typeCount > 0} />
              <span
                className={`material-symbols-rounded filter-drawer__section-chevron${!typesOpen ? " filter-drawer__section-chevron--collapsed" : ""}`}
              >
                expand_more
              </span>
            </button>

            {typesOpen && (
              <div className="filter-drawer__tags">
                {POKEMON_TYPES.map((t) => (
                  <Tag
                    key={t}
                    label={t[0].toUpperCase() + t.slice(1)}
                    selected={filters.types.includes(t)}
                    onClick={() => toggleType(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
