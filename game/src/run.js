import { stepBoat } from './boat.js';
import { cutCable, hookCable, stepSnag } from './cable.js';
import { createLogs, stepLogs } from './drift.js';
import { FIELD_W } from './field.js';
import { stepSplashes } from './particles.js';
import { makeRng } from './random.js';
import { REACHES } from './reaches.js';
import { storeReach } from './save.js';

export function createRun(seed) {
  const run = {
    rng: makeRng(seed),
    seed,
    reach: 0,
    level: REACHES[0],
    boat: { x: 640, y: 130, vx: 0 },
    cable: null,
    snag: null,
    logs: [],
    splashes: [],
    rain: [],
    crates: REACHES[0].crates,
    delivered: 0,
    lost: 0,
    cuts: 0,
    hooks: 0,
    stars: 0,
    fog: REACHES[0].fog,
    unload: 0,
    time: 0,
    mode: 'title',
    cleared: false,
    banner: '',
    bannerT: 0,
    justHook: false,
    justCut: false,
    justLost: false,
    justDeliver: false,
    aimX: 640,
    aimY: 360,
    finishedDelivered: 0,
    finishedLost: 0,
    record: null,
    best: 0,
  };
  beginReach(run, 0);
  run.mode = 'title';
  return run;
}

export function beginReach(run, index) {
  const level = REACHES[index];
  run.reach = index;
  run.level = level;
  run.boat.x = level.spawn.x;
  run.boat.y = level.spawn.y;
  run.cable = null;
  run.snag = null;
  run.logs = createLogs(run);
  run.splashes = [];
  run.crates = level.crates;
  run.delivered = 0;
  run.lost = 0;
  run.fog = level.fog;
  run.unload = 0;
  run.cleared = false;
  run.banner = `${level.name} — land ${level.quota} crates`;
  run.bannerT = 1.6;
  run.rain = [];
  if (level.rain) {
    for (let i = 0; i < 80; i += 1) {
      run.rain.push({ x: run.rng() * FIELD_W, y: run.rng() * 720, v: 520 + run.rng() * 200 });
    }
  }
  run.mode = 'play';
}

function finish(run, mode) {
  run.mode = mode;
  run.finishedDelivered = run.delivered;
  run.finishedLost = run.lost;
  for (let i = 0; i < run.reach; i += 1) run.finishedDelivered += REACHES[i].quota;
}

function advance(run) {
  if (run.reach + 1 >= REACHES.length) finish(run, 'victory');
  else beginReach(run, run.reach + 1);
}

export function stepRun(run, input, dt) {
  run.justHook = false;
  run.justCut = false;
  run.justLost = false;
  run.justDeliver = false;
  run.aimX = input.ax;
  run.aimY = input.ay;
  if (run.mode !== 'play') return;

  if (input.hook && hookCable(run, input.ax, input.ay)) run.hooks += 1;
  if (input.cut) cutCable(run);

  stepBoat(run, input, dt);
  stepLogs(run, dt);
  stepSnag(run, dt);
  stepSplashes(run, dt);
  for (const drop of run.rain) {
    drop.y += drop.v * dt;
    if (drop.y > 720) {
      drop.y = 0;
      drop.x = run.rng() * FIELD_W;
    }
  }
  run.time += dt;
  run.bannerT = Math.max(0, run.bannerT - dt);

  const onWharf = run.boat.y > 600 && run.boat.x > 520 && run.boat.x < 760;
  if (onWharf && run.crates > 0 && !run.cleared) {
    run.unload += dt;
    if (run.unload > 0.32) {
      run.unload = 0;
      run.crates -= 1;
      run.delivered += 1;
      run.justDeliver = true;
    }
  }

  if (!run.cleared && run.delivered >= run.level.quota) {
    run.cleared = true;
    const left = run.fog / run.level.fog;
    const star = run.lost === 0 && left > 0.25 ? 3 : run.lost <= 2 ? 2 : 1;
    run.stars += star;
    run.record = storeReach(run.reach, star);
    run.banner = star === 3 ? 'Clean landing' : 'The wharf holds';
    run.bannerT = 1.4;
  }
  if (run.cleared) {
    if (run.bannerT <= 0) advance(run);
    return;
  }
  run.fog -= dt;
  if (run.fog <= 0 || run.crates + run.delivered < run.level.quota) finish(run, 'defeat');
}

export function restartRun(run) {
  const next = createRun((run.seed + 1) >>> 0);
  Object.assign(run, next);
  run.mode = 'title';
}
