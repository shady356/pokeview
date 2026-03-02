import { useState, useEffect, useRef, useMemo } from "react";
import { usePokemonInfiniteList, usePokemon, usePokemonByTypes } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { PokemonModal } from "./PokemonModal";
import { Header, HeaderButton } from "./layout/Header";
import { BottomNav, Tab } from "./layout/BottomNav";
import { FilterDrawer, type Filters } from "./FilterDrawer";
import pokedexIcon from "./assets/special_icons/pokedex.svg";
import type { PokemonListResult } from "./services/pokemon/pokemonApi";
import "./PokemonPage.css";

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
      className="pokemon-card"
      style={{ background: color }}
    >
      {isLoading ? null : data ? (
        <img
          src={getPokemonSpriteByName(data.name)}
          alt={data.name}
          className="pokemon-card__sprite"
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
      list = typeData;
    } else if (filters.region) {
      const { startId, endId } = filters.region;
      list = [];
      for (let id = startId; id <= endId; id++) {
        list.push({
          name: "",
          url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
        });
      }
    }

    if (filters.region) {
      const { startId, endId } = filters.region;
      list = list.filter((p) => {
        const id = getPokemonIdFromUrl(p.url);
        return id >= startId && id <= endId;
      });
    }

    list.sort((a, b) => getPokemonIdFromUrl(a.url) - getPokemonIdFromUrl(b.url));

    list = list.map((p) => ({
      name: p.name || String(getPokemonIdFromUrl(p.url)),
      url: p.url,
    }));

    return list;
  }, [hasFilters, filters, typeData]);

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
      <div className="pokemon-page">
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
                <span className="pokemon-page__filter-count">
                  {filterCount}
                </span>
              )}
            </HeaderButton>
          }
        />

        {isError && (
          <div className="pokemon-page__error">
            Failed to load Pokémon. Check your connection.
          </div>
        )}

        {isLoading ? (
          <div className="pokemon-grid">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="pokemon-page__skeleton"
                style={{ animationDelay: `${i * 0.03}s` }}
              />
            ))}
          </div>
        ) : pokemon.length === 0 && isFiltered ? (
          <div className="pokemon-page__empty">
            <span className="material-symbols-rounded pokemon-page__empty-icon">search_off</span>
            <p className="pokemon-page__empty-text">No Pokémon match your filters.</p>
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

        {!isFiltered && <div ref={sentinelRef} className="pokemon-page__sentinel" />}

        {!isFiltered && isFetchingNextPage && (
          <div className="pokemon-page__loader">
            <div className="pokemon-page__spinner" />
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
          icon={<img src={pokedexIcon} className="pokemon-page__pokedex-icon" />}
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
