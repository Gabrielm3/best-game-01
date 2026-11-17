import { BANK_L, BANK_R, FIELD_H } from './field.js';

export function createLogs(run) {
  const logs = [];
  for (let i = 0; i < run.level.logs; i += 1) {
    logs.push(spawn(run, 80 + run.rng() * (FIELD_H - 160)));
  }
  return logs;
}

function spawn(run, y) {
  return {
    x: BANK_L + 40 + run.rng() * (BANK_R - BANK_L - 80),
    y,
    vx: run.level.current * 0.15 * (run.rng() - 0.5),
    gone: false,
    spin: run.rng() * Math.PI,
  };
}

export function stepLogs(run, dt) {
  for (const log of run.logs) {
    if (log.gone) continue;
    log.y += (run.level.current + 70) * dt;
    log.x += log.vx * dt * 8;
    log.spin += dt;
    if (log.y > FIELD_H + 40) {
      const next = spawn(run, -30);
      log.x = next.x;
      log.y = next.y;
      log.vx = next.vx;
    }
  }
}
