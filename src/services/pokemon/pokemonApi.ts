const BASE_URL = "https://pokeapi.co/api/v2";

export interface Region {
  name: string;
  startId: number;
  endId: number;
}

export const REGIONS: Region[] = [
  { name: "Kanto", startId: 1, endId: 151 },
  { name: "Johto", startId: 152, endId: 251 },
  { name: "Hoenn", startId: 252, endId: 386 },
  { name: "Sinnoh", startId: 387, endId: 493 },
  { name: "Unova", startId: 494, endId: 649 },
  { name: "Kalos", startId: 650, endId: 721 },
  { name: "Alola", startId: 722, endId: 809 },
  { name: "Galar", startId: 810, endId: 905 },
  { name: "Paldea", startId: 906, endId: 1025 },
];

export const POKEMON_TYPES = [
  "bug", "dark", "dragon", "electric", "fairy", "fighting",
  "fire", "flying", "ghost", "grass", "ground", "ice",
  "normal", "poison", "psychic", "rock", "steel", "water",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

interface TypePokemonEntry {
  pokemon: { name: string; url: string };
  slot: number;
}

interface TypeResponse {
  pokemon: TypePokemonEntry[];
}

export const fetchPokemonByType = async (
  typeName: string
): Promise<PokemonListResult[]> => {
  const res = await fetch(`${BASE_URL}/type/${typeName}`);
  if (!res.ok) throw new Error(`Failed to fetch type: ${typeName}`);
  const data: TypeResponse = await res.json();
  return data.pokemon.map((entry) => ({
    name: entry.pokemon.name,
    url: entry.pokemon.url,
  }));
};

export interface PokemonListResult {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListResult[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
}

export interface PokemonStat {
  base_stat: number;
  stat: { name: string; url: string };
}

export interface PokemonType {
  slot: number;
  type: { name: string; url: string };
}

export interface PokemonAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
}

export interface FetchPokemonListParams {
  limit?: number;
  offset?: number;
}

export const fetchPokemonList = async ({
  limit = 20,
  offset = 0,
}: FetchPokemonListParams = {}): Promise<PokemonListResponse> => {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch pokemon list");
  return res.json();
};

export const fetchPokemonByName = async (name: string): Promise<Pokemon> => {
  const res = await fetch(`${BASE_URL}/pokemon/${name}`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon: ${name}`);
  return res.json();
};

export interface PokemonSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}

export const fetchPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
  const res = await fetch(`${BASE_URL}/pokemon-species/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch species: ${id}`);
  return res.json();
};