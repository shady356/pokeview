import { useQuery, useInfiniteQuery, type UseQueryResult } from "@tanstack/react-query";
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

export const usePokemonInfiniteList = (limit = 24) => {
  return useInfiniteQuery({
    queryKey: ["pokemon", "infinite", limit],
    queryFn: ({ pageParam = 0 }) => fetchPokemonList({ limit, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return Number(url.searchParams.get("offset"));
    },
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