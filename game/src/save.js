const KEY = 'bellwether-drove';

function fresh() {
  return {
    best: 0,
    drives: [
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
    if (raw && Array.isArray(raw.drives) && raw.drives.length === 4) return raw;
  } catch {
    /* private mode */
  }
  return fresh();
}

export function storeDrive(index, stars) {
  const save = loadSave();
  const row = save.drives[index];
  if (row && stars > row.stars) row.stars = stars;
  const next = save.drives[index + 1];
  if (next && stars > 0) next.open = true;
  save.best = save.drives.reduce((sum, drive) => sum + drive.stars, 0);
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* private mode */
  }
  return save;
}
