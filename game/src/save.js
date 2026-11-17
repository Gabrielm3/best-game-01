import { REACHES } from './reaches.js';

const KEY = 'cutwater-days';

function fresh() {
  return {
    best: 0,
    reaches: REACHES.map((_, index) => ({ stars: 0, open: index === 0 })),
  };
}

export function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.reaches) && raw.reaches.length === REACHES.length) return raw;
  } catch {
    /* private mode */
  }
  return fresh();
}

export function storeReach(index, stars) {
  const save = loadSave();
  const row = save.reaches[index];
  if (row && stars > row.stars) row.stars = stars;
  const next = save.reaches[index + 1];
  if (next && stars > 0) next.open = true;
  save.best = save.reaches.reduce((sum, reach) => sum + reach.stars, 0);
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
  return save;
}
