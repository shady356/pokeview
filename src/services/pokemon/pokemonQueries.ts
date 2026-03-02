import { useQuery, useQueries, useInfiniteQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchPokemonList,
  fetchPokemonByName,
  fetchPokemonByType,
  fetchPokemonSpecies,
  type FetchPokemonListParams,
  type PokemonListResponse,
  type PokemonListResult,
  type PokemonSpecies,
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

export const usePokemonSpecies = (
  id: number | undefined
): UseQueryResult<PokemonSpecies, Error> => {
  return useQuery({
    queryKey: ["pokemon", "species", id],
    queryFn: () => fetchPokemonSpecies(id!),
    enabled: !!id,
  });
};

export const usePokemonByType = (
  typeName: string | null
): UseQueryResult<PokemonListResult[], Error> => {
  return useQuery({
    queryKey: ["pokemon", "type", typeName],
    queryFn: () => fetchPokemonByType(typeName!),
    enabled: !!typeName,
  });
};

export const usePokemonByTypes = (typeNames: string[]) => {
  const results = useQueries({
    queries: typeNames.map((t) => ({
      queryKey: ["pokemon", "type", t],
      queryFn: () => fetchPokemonByType(t),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  // Union all type results, deduplicated by name
  const data = !isLoading
    ? Array.from(
        results
          .flatMap((r) => r.data ?? [])
          .reduce((map, p) => map.set(p.name, p), new Map<string, PokemonListResult>())
          .values()
      )
    : undefined;

  return { data, isLoading, isError };
};