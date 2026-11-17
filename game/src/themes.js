/** The reach paints from this, so a night lock cannot look like the mill. */
export function themeOf(level) {
  return {
    skyTop: level.skyTop,
    skyBot: level.skyBot,
    water: level.water,
    waterDeep: level.waterDeep,
    bank: level.bank,
    far: level.far,
    night: level.night,
  };
}
