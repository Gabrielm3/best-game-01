// AURORA — Ride the Light. Every tuning number and colour in one place. The playfield is a
// fixed 1280x720 logical area; the renderer scales it to the window, so no rule below depends
// on the screen size. The aurora's look changes with the level: each level names its own band
// colours, and the palette list cycles once the list runs out.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const WISP = {
  radius: 14,
  speed: 430,
  /** Seconds of mercy after a hit, while the wisp blinks and cannot be hit again. */
  invulnerable: 1.6,
  /** How many past positions the comet trail keeps. */
  trail: 14,
};

export const LIVES = 3;

/** A mote is worth 10 points times the combo multiplier. */
export const MOTE = {
  radius: 10,
  /** Drift speed, plus a little per level. */
  speed: 46,
  speedPerLevel: 4,
  /** Seconds between mote spawns at level 1; spawns quicken as the level rises. */
  interval: 0.55,
  intervalScale: 0.94,
  minInterval: 0.3,
  points: 10,
};

/** A shard ends a combo and costs a life. */
export const SHARD = {
  radius: 17,
  speed: 74,
  speedPerLevel: 9,
  /** How strongly a shard bends its drift toward the wisp. */
  homing: 0.28,
  interval: 2.1,
  intervalScale: 0.9,
  minInterval: 0.85,
  /** The most shards that may be drifting at once at level 1; +1 every two levels. */
  maxAtOnce: 5,
};

/** Seconds a chain of collects may last before the combo falls back to x1. */
export const COMBO_WINDOW = 2.5;
/** The multiplier at each chain length, capped at the last one. */
export const COMBO_STEPS = [1, 2, 3, 5, 8];

/** Motes collected to climb one level. */
export const MOTES_PER_LEVEL = 15;
/** The last level: speeds and spawn rates stop growing there. */
export const LEVEL_MAX = 10;

/** A nova clears every shard on screen; a shield survives one hit. */
export const POWERUP = {
  radius: 13,
  interval: 16,
  intervalJitter: 6,
  novaPoints: 25,
};

/** How many sparks, shards and motes can exist at once; the pools are allocated once. */
export const POOL = { motes: 24, shards: 18, powerups: 3, sparks: 240 };

/** One palette per level: the aurora's three bands, the wisp, the mote and the shard rim. */
export const PALETTES = [
  {
    bands: ['#19e3c2', '#7b5cff', '#ff4fd8'],
    wisp: '#eafcff',
    mote: '#ffd76a',
    shard: '#ff5470',
    panel: '#171a2e',
    text: '#eef1f5',
    muted: '#9aa3b8',
  },
  {
    bands: ['#4fd8ff', '#2f7bff', '#b45cff'],
    wisp: '#eafcff',
    mote: '#ffe9a3',
    shard: '#ff5470',
    panel: '#131a2e',
    text: '#eef1f5',
    muted: '#9aa3b8',
  },
  {
    bands: ['#ff7ab8', '#ff4fd8', '#b45cff'],
    wisp: '#fff0f6',
    mote: '#ffe9a3',
    shard: '#ff5470',
    panel: '#241428',
    text: '#eef1f5',
    muted: '#9aa3b8',
  },
  {
    bands: ['#7dff9e', '#19e3c2', '#2f7bff'],
    wisp: '#eafcff',
    mote: '#ffd76a',
    shard: '#ff5470',
    panel: '#12241c',
    text: '#eef1f5',
    muted: '#9aa3b8',
  },
];

export const PALETTE = {
  backdrop: '#05060f',
  panel: '#171a2e',
  text: '#eef1f5',
  muted: '#9aa3b8',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'aurora.best';
