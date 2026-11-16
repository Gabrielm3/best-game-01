import { STEP } from './field.js';
import { beginDrive, createRun, stepRun } from './run.js';

function centroid(run) {
  let x = 0;
  let y = 0;
  let n = 0;
  for (const sheep of run.sheep) {
    if (sheep.gone) continue;
    x += sheep.x;
    y += sheep.y;
    n += 1;
  }
  if (!n) return { x: run.fold.x, y: run.fold.y + run.fold.h / 2 };
  return { x: x / n, y: y / n };
}

/** Lead the flock toward the fold with the same bell the player rings. */
export function herdScript(run, seconds, stopAt = Infinity) {
  let since = 0;
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (run.mode !== 'play' || run.saved >= stopAt) break;
    const flock = centroid(run);
    const mouthX = run.fold.x + run.fold.w * 0.45;
    const mouthY = run.fold.y + run.fold.h / 2;
    const dxm = mouthX - flock.x;
    const dym = mouthY - flock.y;
    const dm = Math.hypot(dxm, dym) || 1;
    const lead = dm < 200 ? dm : 120;
    const aimX = flock.x + (dxm / dm) * lead;
    const aimY = flock.y + (dym / dm) * lead;
    let sx = aimX - run.shepherd.x;
    let sy = aimY - run.shepherd.y;
    for (const wolf of run.wolves) {
      if (wolf.delay > 0) continue;
      for (const sheep of run.sheep) {
        if (sheep.gone) continue;
        if (Math.hypot(wolf.x - sheep.x, wolf.y - sheep.y) < 120) {
          sx = wolf.x - run.shepherd.x;
          sy = wolf.y - run.shepherd.y;
        }
      }
    }
    const dist = Math.hypot(sx, sy) || 1;
    const dx = sx;
    const dy = sy;
    since += STEP;
    const ring = since > 0.48;
    if (ring) since = 0;
    stepRun(run, { x: dx / dist, y: dy / dist, ax: aimX, ay: aimY, ring }, STEP);
  }
}

export function stageShot(name, seed) {
  const run = createRun(seed >>> 0);
  run.best = 6;
  if (name === 'title') return run;
  if (name === 'storm') {
    beginDrive(run, 2);
    run.stars = 5;
    herdScript(run, 18, 3);
    run.bannerT = 0;
    run.mode = 'play';
    return run;
  }
  if (name === 'fold') {
    beginDrive(run, 3);
    run.saved = 10;
    for (const sheep of run.sheep) sheep.gone = 'saved';
    run.finishedSaved = 44;
    run.finishedLost = 3;
    run.bellsRung = 52;
    run.stars = 9;
    run.bannerT = 0;
    run.mode = 'victory';
    return run;
  }
  run.mode = 'play';
  herdScript(run, 22, 5);
  run.bannerT = 0;
  run.mode = 'play';
  return run;
}
