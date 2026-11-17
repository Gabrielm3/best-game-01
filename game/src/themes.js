/** One palette per drive, so the hill changes and the HUD does not. */
export function themeOf(level) {
  return {
    skyTop: level.skyTop,
    skyBot: level.skyBot,
    grass: level.grass,
    grassDark: level.grassDark,
    hill: level.hill,
    path: level.path,
  };
}
