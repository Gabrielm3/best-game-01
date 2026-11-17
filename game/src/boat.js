import { BANK_L, BANK_R, FIELD_H } from './field.js';

export function stepBoat(run, input, dt) {
  const boat = run.boat;
  let vx = input.x * 210;
  let vy = input.y * 160 + run.level.current;
  if (run.cable) {
    const dx = run.cable.x - boat.x;
    const dy = run.cable.y - boat.y;
    const dist = Math.hypot(dx, dy) || 1;
    vx += (dx / dist) * 150;
    vy += (dy / dist) * 150;
    if (dist < 42 || boat.y > run.cable.y + 16) run.cable = null;
  }
  boat.x = Math.max(BANK_L + 28, Math.min(BANK_R - 28, boat.x + vx * dt));
  boat.y = Math.max(78, Math.min(FIELD_H - 36, boat.y + vy * dt));
  boat.vx = vx;
}
