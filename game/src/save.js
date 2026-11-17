const KEY = 'cutwater-reaches';

function fresh() {
  return {
    best: 0,
    reaches: [
      { stars: 0, open: true },
      { stars: 0, open: false },
      { stars: 0, open: false },
      { stars: 0, open: false },
    ],
  };
}

export function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && Array.isArray(raw.reaches) && raw.reaches.length === 4) return raw;
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
