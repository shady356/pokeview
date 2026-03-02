import { useState } from "react";
import { REGIONS, POKEMON_TYPES, type Region, type PokemonTypeName } from "./services/pokemon/pokemonApi";
import { Tag } from "./components/Tag";
import { Badge } from "./components/Badge";

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
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 900,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* bottom sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "80vh",
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          zIndex: 1000,
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          color: "#2B2D42",
        }}
      >
        {/* drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: "#D0D0D4" }} />
        </div>

        {/* title */}
        <div style={{ textAlign: "center", padding: "8px 24px 20px" }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Filter Pokémon</span>
        </div>

        {/* scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 32px" }}>
          {/* Regions section */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setRegionsOpen(!regionsOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                gap: 10,
                color: "#2B2D42",
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700 }}>Regions</span>
              <Tag label={regionLabel} selected={filters.region !== null} />
              <span
                className="material-symbols-rounded"
                style={{
                  marginLeft: "auto",
                  fontSize: 22,
                  color: "#999",
                  transition: "transform 0.2s ease",
                  transform: regionsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              >
                expand_more
              </span>
            </button>

            {regionsOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 12 }}>
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

          {/* Types section */}
          <div>
            <button
              onClick={() => setTypesOpen(!typesOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                gap: 10,
                color: "#2B2D42",
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700 }}>Types</span>
              <Badge value={typeCount} selected={typeCount > 0} />
              <span
                className="material-symbols-rounded"
                style={{
                  marginLeft: "auto",
                  fontSize: 22,
                  color: "#999",
                  transition: "transform 0.2s ease",
                  transform: typesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              >
                expand_more
              </span>
            </button>

            {typesOpen && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 12 }}>
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
