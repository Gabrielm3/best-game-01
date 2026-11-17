import { ringBell, stepBells } from './bells.js';
import { DRIVES } from './drives.js';
import { FIELD_H, FIELD_W, STEP } from './field.js';
import { createSheep, stepSheep } from './flock.js';
import { placeHurdle, stepHurdles } from './hurdles.js';
import { makeRng } from './random.js';
import { storeDrive } from './save.js';
import { createWolves, stepWolves } from './wolves.js';

export function bestStars() {
  try {
    return Number(localStorage.getItem('bellwether-stars')) || 0;
  } catch {
    return 0;
  }
}

export function rememberStars(stars) {
  try {
    const prev = Number(localStorage.getItem('bellwether-stars')) || 0;
    if (stars > prev) localStorage.setItem('bellwether-stars', String(stars));
  } catch {
    /* private mode */
  }
}

export function createRun(seed) {
  const run = {
    rng: makeRng(seed),
    seed,
    drive: 0,
    level: DRIVES[0],
    shepherd: { x: 200, y: 400 },
    sheep: [],
    wolves: [],
    bells: [],
    hurdles: [],
    hurdleCool: 0,
    hurdlesUsed: 0,
    puffs: [],
    rocks: [],
    fold: DRIVES[0].fold,
    rain: [],
    saved: 0,
    lost: 0,
    bellsRung: 0,
    stars: 0,
    dusk: DRIVES[0].dusk,
    cooldown: 0,
    time: 0,
    mode: 'title',
    cleared: false,
    banner: '',
    bannerT: 0,
    justRang: false,
    justSaved: false,
    justLost: false,
    aimX: 640,
    aimY: 360,
    finishedSaved: 0,
    finishedLost: 0,
  };
  beginDrive(run, 0);
  run.mode = 'title';
  return run;
}

export function beginDrive(run, index) {
  const level = DRIVES[index];
  run.drive = index;
  run.level = level;
  run.fold = level.fold;
  run.rocks = level.rocks;
  run.sheep = createSheep(run);
  run.wolves = createWolves(run);
  run.bells = [];
  run.hurdles = [];
  run.hurdleCool = 0;
  run.puffs = [];
  run.saved = 0;
  run.lost = 0;
  run.dusk = level.dusk;
  run.cleared = false;
  run.cooldown = 0;
  run.shepherd.x = level.spawn.x - 50;
  run.shepherd.y = level.spawn.y;
  run.banner = `${level.name} — bring ${level.quota} home`;
  run.bannerT = 1.7;
  run.rain = [];
  if (level.rain) {
    for (let i = 0; i < 70; i += 1) {
      run.rain.push({ x: run.rng() * FIELD_W, y: run.rng() * FIELD_H, v: 420 + run.rng() * 180 });
    }
  }
  run.mode = 'play';
}

function aliveCount(run) {
  let count = 0;
  for (const sheep of run.sheep) if (!sheep.gone) count += 1;
  return count;
}

function finish(run, mode) {
  run.mode = mode;
  run.finishedSaved = run.saved;
  run.finishedLost = run.lost;
  for (let i = 0; i < run.drive; i += 1) {
    run.finishedSaved += DRIVES[i].quota;
  }
  rememberStars(run.stars);
}

function advance(run) {
  if (run.drive + 1 >= DRIVES.length) finish(run, 'victory');
  else beginDrive(run, run.drive + 1);
}

export function stepRun(run, input, dt) {
  run.justRang = false;
  run.justSaved = false;
  run.justLost = false;
  run.aimX = input.ax;
  run.aimY = input.ay;
  if (run.mode === 'title') return;
  if (run.mode === 'pause') return;
  if (run.mode === 'victory' || run.mode === 'defeat') return;

  const speed = 265;
  run.shepherd.x = Math.max(24, Math.min(FIELD_W - 24, run.shepherd.x + input.x * speed * dt));
  run.shepherd.y = Math.max(90, Math.min(FIELD_H - 24, run.shepherd.y + input.y * speed * dt));
  for (const rock of run.rocks) {
    const dx = run.shepherd.x - rock.x;
    const dy = run.shepherd.y - rock.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    if (dist < rock.r + 16) {
      run.shepherd.x += (dx / dist) * (rock.r + 16 - dist);
      run.shepherd.y += (dy / dist) * (rock.r + 16 - dist);
    }
  }
  if (input.ring) ringBell(run, input.ax, input.ay);
  if (input.hurdle && placeHurdle(run)) run.hurdlesUsed += 1;

  stepBells(run, dt);
  stepHurdles(run, dt);
  stepSheep(run, dt);
  stepWolves(run, dt);
  for (const drop of run.rain) {
    drop.y += drop.v * dt;
    drop.x += run.level.windX * dt * 0.4;
    if (drop.y > FIELD_H) {
      drop.y = 70;
      drop.x = run.rng() * FIELD_W;
    }
  }
  run.time += dt;

  if (!run.cleared && run.saved >= run.level.quota) {
    run.cleared = true;
    const left = run.dusk / run.level.dusk;
    const star = run.lost === 0 && left > 0.25 ? 3 : run.lost <= 2 ? 2 : 1;
    run.stars += star;
    run.record = storeDrive(run.drive, star);
    run.banner = star === 3 ? 'Clean drive' : star === 2 ? 'The fold holds' : 'Home, barely';
    run.bannerT = 1.5;
  }
  if (run.cleared) {
    run.bannerT -= dt;
    if (run.bannerT <= 0) advance(run);
    return;
  }
  run.bannerT = Math.max(0, run.bannerT - dt);
  run.dusk -= dt;
  if (run.saved + aliveCount(run) < run.level.quota || run.dusk <= 0) finish(run, 'defeat');
}

export function restartRun(run) {
  const next = createRun((run.seed + 1) >>> 0);
  Object.assign(run, next);
  run.mode = 'title';
}

export { STEP };
