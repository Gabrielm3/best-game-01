import { ripple, stepPuffs } from './particles.js';

export function ringBell(run, x, y) {
  if (run.cooldown > 0 || run.mode !== 'play' || run.cleared) return false;
  run.bells.push({ x, y, age: 0, life: 1.7, reach: 320 });
  run.cooldown = 0.42;
  run.bellsRung += 1;
  run.justRang = true;
  ripple(run, x, y);
  return true;
}

export function stepBells(run, dt) {
  run.cooldown = Math.max(0, run.cooldown - dt);
  for (const bell of run.bells) bell.age += dt;
  run.bells = run.bells.filter((bell) => bell.age < bell.life);
  stepPuffs(run, dt);
}
