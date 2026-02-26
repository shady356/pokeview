export const getPokemonSpriteByName = (name: string) => {
  return `https://img.pokemondb.net/sprites/home/normal/${name}.png`;
};

export const TYPE_COLORS: Record<string, string> = {
  bug: "#92BC2C",
  dark: "#595761",
  dragon: "#0C6BCA",
  electric: "#F2D94E",
  fairy: "#EE90E6",
  fighting: "#D3425F",
  fire: "#FBA54C",
  flying: "#A1BBEC",
  ghost: "#5F6DBC",
  grass: "#5FBD58",
  ground: "#DA7C4D",
  ice: "#75D0C1",
  normal: "#A0A29F",
  poison: "#b763cf",
  psychic: "#fa8581",
  rock: "#C9BB8A",
  steel: "#5695A3",
  water: "#539DDF",
};
