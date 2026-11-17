import { FIELD_H, FIELD_W } from './field.js';
import { pushHurdles } from './hurdles.js';

export function createSheep(run) {
  const { spawn } = run.level;
  const list = [];
  for (let i = 0; i < run.level.sheep; i += 1) {
    const column = i % 4;
    const row = Math.floor(i / 4);
    list.push({
      x: spawn.x + column * 28 + run.rng() * 10,
      y: spawn.y + row * 26 - 40 + run.rng() * 8,
      vx: 0,
      vy: 0,
      fear: 0,
      gone: '',
      wx: (run.rng() - 0.5) * 30,
      wy: (run.rng() - 0.5) * 30,
      wander: run.rng(),
    });
  }
  return list;
}

function pushRocks(entity, rocks, pad) {
  for (const rock of rocks) {
    const dx = entity.x - rock.x;
    const dy = entity.y - rock.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const limit = rock.r + pad;
    if (dist < limit) {
      entity.x += (dx / dist) * (limit - dist);
      entity.y += (dy / dist) * (limit - dist);
    }
  }
}

export function stepSheep(run, dt) {
  const { sheep, bells, wolves, rocks, fold, level } = run;
  for (const one of sheep) {
    if (one.gone) continue;
    let ax = level.windX;
    let ay = level.windY;
    let count = 0;
    let sepX = 0;
    let sepY = 0;
    let alX = 0;
    let alY = 0;
    let coX = 0;
    let coY = 0;
    for (const other of sheep) {
      if (other === one || other.gone) continue;
      const dx = one.x - other.x;
      const dy = one.y - other.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      if (dist < 40) {
        sepX += dx / dist;
        sepY += dy / dist;
        alX += other.vx;
        alY += other.vy;
        coX += other.x;
        coY += other.y;
        count += 1;
      }
    }
    if (count) {
      ax += sepX * 110;
      ay += sepY * 110;
      ax += (alX / count - one.vx) * 0.55;
      ay += (alY / count - one.vy) * 0.55;
      ax += (coX / count - one.x) * 0.55;
      ay += (coY / count - one.y) * 0.55;
    }
    one.wander -= dt;
    if (one.wander <= 0) {
      one.wander = 0.8 + run.rng() * 1.4;
      one.wx = (run.rng() - 0.5) * 36;
      one.wy = (run.rng() - 0.5) * 36;
    }
    ax += one.wx;
    ay += one.wy;

    let bell = null;
    for (const item of bells) {
      const dist = Math.hypot(item.x - one.x, item.y - one.y);
      const reach = item.reach * (1 - item.age / item.life);
      if (dist < reach && (!bell || item.age < bell.age)) bell = item;
    }
    if (bell) {
      ax += (bell.x - one.x) * 2.4;
      ay += (bell.y - one.y) * 2.4;
    }

    for (const wolf of wolves) {
      if (wolf.delay > 0) continue;
      const dist = Math.hypot(wolf.x - one.x, wolf.y - one.y) || 0.001;
      if (dist < 150) {
        ax += ((one.x - wolf.x) / dist) * 260;
        ay += ((one.y - wolf.y) / dist) * 260;
        one.fear = 1;
      }
    }

    one.vx = (one.vx + ax * dt) * 0.9;
    one.vy = (one.vy + ay * dt) * 0.9;
    const speed = Math.hypot(one.vx, one.vy);
    const max = one.fear > 0.2 ? 185 : 108;
    if (speed > max) {
      one.vx = (one.vx / speed) * max;
      one.vy = (one.vy / speed) * max;
    }
    one.x += one.vx * dt;
    one.y += one.vy * dt;
    one.fear = Math.max(0, one.fear - dt);
    pushRocks(one, rocks, 14);
    pushHurdles(one, run.hurdles, 12);
    one.x = Math.max(28, Math.min(FIELD_W - 28, one.x));
    one.y = Math.max(96, Math.min(FIELD_H - 28, one.y));
    if (
      one.x > fold.x + 4 &&
      one.y > fold.y + 16 &&
      one.y < fold.y + fold.h - 16
    ) {
      one.gone = 'saved';
      run.saved += 1;
      run.justSaved = true;
    }
  }
}
