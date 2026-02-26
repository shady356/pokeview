import { useState, useEffect, useRef } from "react";
import { usePokemonInfiniteList, usePokemon } from "./services/pokemon/pokemonQueries";
import { TYPE_COLORS, getPokemonSpriteByName } from "./utils/pokemon";
import { PokemonModal } from "./PokemonModal";
import { Header, HeaderButton } from "./layout/Header";
import { BottomNav, Tab } from "./layout/BottomNav";
import pokedexIcon from "./assets/special_icons/pokedex.svg";
import type { PokemonListResult } from "./services/pokemon/pokemonApi";

type NavTab = "home" | "pokedex" | "settings";

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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const limit = 24;

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePokemonInfiniteList(limit);

  const pokemon = data?.pages.flatMap((p) => p.results) ?? [];

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 96px" }}>
        <Header
          title="Pokédex"
          left={
            <HeaderButton>
              <span className="material-symbols-rounded">arrow_back</span>
            </HeaderButton>
          }
          right={
            <HeaderButton>
              <span className="material-symbols-rounded">filter_list</span>
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
        ) : (
          <div className="pokemon-grid">
            {pokemon.map((p: PokemonListResult, i: number) => (
              <div key={p.name} style={{ animationDelay: `${i * 0.03}s` }}>
                <PokemonCard name={p.name} onClick={() => setSelected(p.name)} />
              </div>
            ))}
          </div>
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />

        {isFetchingNextPage && (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #222", borderTopColor: "#e53935", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}
      </div>

      {selected && <PokemonModal name={selected} onClose={() => setSelected(null)} />}

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
