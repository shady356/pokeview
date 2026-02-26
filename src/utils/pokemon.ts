export const getPokemonSpriteByName = (name: string) => {
  return `https://img.pokemondb.net/sprites/home/normal/${name}.png`;
};

export const TYPE_COLORS: Record<string, string> = {
  fire: "#FF6B35",
  water: "#4FC3F7",
  grass: "#81C784",
  electric: "#FFD54F",
  psychic: "#F48FB1",
  ice: "#80DEEA",
  dragon: "#7986CB",
  dark: "#616161",
  fairy: "#F8BBD9",
  fighting: "#FF7043",
  poison: "#AB47BC",
  ground: "#BCAAA4",
  rock: "#90A4AE",
  bug: "#AED581",
  ghost: "#7E57C2",
  steel: "#B0BEC5",
  normal: "#EEEEEE",
  flying: "#90CAF9",
};
