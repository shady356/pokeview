import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchPokemonList,
  fetchPokemonByName,
  type FetchPokemonListParams,
  type PokemonListResponse,
  type Pokemon,
} from "./pokemonApi";

export const usePokemonList = (
  params: FetchPokemonListParams = {}
): UseQueryResult<PokemonListResponse, Error> => {
  const { limit = 20, offset = 0 } = params;

  return useQuery({
    queryKey: ["pokemon", "list", { limit, offset }],
    queryFn: () => fetchPokemonList({ limit, offset }),
  });
};

export const usePokemon = (
  name: string | undefined
): UseQueryResult<Pokemon, Error> => {
  return useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => fetchPokemonByName(name!),
    enabled: !!name,
  });
};