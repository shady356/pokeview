import { useState, useEffect, useRef, useMemo } from "react";
import { usePokemonInfiniteList, usePokemon, usePokemonByTypes } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { PokemonModal } from "./PokemonModal";
import { Header, HeaderButton } from "./layout/Header";
import { BottomNav, Tab } from "./layout/BottomNav";
import { FilterDrawer, type Filters } from "./FilterDrawer";
import pokedexIcon from "./assets/special_icons/pokedex.svg";
import type { PokemonListResult } from "./services/pokemon/pokemonApi";

type NavTab = "home" | "pokedex" | "settings";

function getPokemonIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

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
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("pokedex");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({ region: null, types: [] });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const limit = 24;

  const hasFilters = filters.region !== null || filters.types.length > 0;
  const filterCount = (filters.region ? 1 : 0) + filters.types.length;

  // Unfiltered infinite list (used when no filters are active)
  const {
    data: infiniteData,
    isLoading: infiniteLoading,
    isError: infiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePokemonInfiniteList(limit);

  // Type-based queries (fetch all selected types in parallel, union results)
  const { data: typeData, isLoading: typeLoading } = usePokemonByTypes(filters.types);

  // Build filtered pokemon list
  const filteredPokemon = useMemo<PokemonListResult[]>(() => {
    if (!hasFilters) return [];

    let list: PokemonListResult[] = [];

    if (filters.types.length > 0 && typeData) {
      // Start with type results — we'll filter by region client-side
      list = typeData;
    } else if (filters.region) {
      // Region only — build list from ID range
      const { startId, endId } = filters.region;
      list = [];
      for (let id = startId; id <= endId; id++) {
        list.push({
          name: "", // will be filled below
          url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
        });
      }
    }

    // Filter by region range
    if (filters.region) {
      const { startId, endId } = filters.region;
      list = list.filter((p) => {
        const id = getPokemonIdFromUrl(p.url);
        return id >= startId && id <= endId;
      });
    }

    // Sort by ID
    list.sort((a, b) => getPokemonIdFromUrl(a.url) - getPokemonIdFromUrl(b.url));

    // For region-only, we need to provide names
    // The name can be derived or we can use the pokemon endpoint
    // For simplicity, use the ID as the name param (PokeAPI accepts IDs)
    list = list.map((p) => ({
      name: p.name || String(getPokemonIdFromUrl(p.url)),
      url: p.url,
    }));

    return list;
  }, [hasFilters, filters, typeData]);

  // Determine which pokemon list to show
  const isFiltered = hasFilters;
  const pokemon = isFiltered
    ? filteredPokemon
    : (infiniteData?.pages.flatMap((p) => p.results) ?? []);
  const isLoading = isFiltered ? (filters.types.length > 0 && typeLoading) : infiniteLoading;
  const isError = isFiltered ? false : infiniteError;

  // Infinite scroll observer (only when no filters)
  useEffect(() => {
    if (isFiltered) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFiltered]);

  return (
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 96px" }}>
        <Header
          title="Pokédex"
          left={
            <HeaderButton>
              <span className="material-symbols-rounded">arrow_back</span>
            </HeaderButton>
          }
          right={
            <HeaderButton onClick={() => setShowFilter(true)}>
              <span className="material-symbols-rounded">filter_list</span>
              {filterCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#e53935",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {filterCount}
                </span>
              )}
            </HeaderButton>
          }
        />

        {isError && (
          <div style={{ color: "#e53935", background: "#1a0a0a", border: "1px solid #3a1010", borderRadius: 8, padding: "20px 24px", fontSize: 14 }}>
            Failed to load Pokémon. Check your connection.
          </div>
        )}

        {isLoading ? (
          <div className="pokemon-grid">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} style={{ background: "#1a1a1a", borderRadius: 16, aspectRatio: "1", animation: `fadeUp 0.4s ${i * 0.03}s ease both` }} />
            ))}
          </div>
        ) : pokemon.length === 0 && isFiltered ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
            <span className="material-symbols-rounded" style={{ fontSize: 48, display: "block", marginBottom: 12 }}>search_off</span>
            <p style={{ fontSize: 16, margin: 0 }}>No Pokémon match your filters.</p>
          </div>
        ) : (
          <div className="pokemon-grid">
            {pokemon.map((p: PokemonListResult, i: number) => (
              <div key={p.url} style={{ animationDelay: `${i * 0.03}s` }}>
                <PokemonCard name={p.name} onClick={() => setSelected(p.name)} />
              </div>
            ))}
          </div>
        )}

        {!isFiltered && <div ref={sentinelRef} style={{ height: 1 }} />}

        {!isFiltered && isFetchingNextPage && (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #222", borderTopColor: "#e53935", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}
      </div>

      {selected && (
        <PokemonModal
          name={selected}
          onClose={() => setSelected(null)}
          onNext={() => {
            const idx = pokemon.findIndex((p) => p.name === selected);
            if (idx >= 0 && idx < pokemon.length - 1) setSelected(pokemon[idx + 1].name);
          }}
          onPrev={() => {
            const idx = pokemon.findIndex((p) => p.name === selected);
            if (idx > 0) setSelected(pokemon[idx - 1].name);
          }}
          hasNext={pokemon.findIndex((p) => p.name === selected) < pokemon.length - 1}
          hasPrev={pokemon.findIndex((p) => p.name === selected) > 0}
        />
      )}

      <FilterDrawer
        open={showFilter}
        filters={filters}
        onApply={setFilters}
        onClose={() => setShowFilter(false)}
      />

      <BottomNav>
        <Tab
          icon={<span className="material-symbols-rounded">home</span>}
          label="Home"
          active={activeTab === "home"}
          onClick={() => setActiveTab("home")}
        />
        <Tab
          icon={<img src={pokedexIcon} style={{ width: 24, height: 24 }} />}
          label="Pokédex"
          active={activeTab === "pokedex"}
          onClick={() => setActiveTab("pokedex")}
        />
        <Tab
          icon={<span className="material-symbols-rounded">settings</span>}
          label="Settings"
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
        />
      </BottomNav>
    </>
  );
}
