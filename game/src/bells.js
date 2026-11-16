export function ringBell(run, x, y) {
  if (run.cooldown > 0 || run.mode !== 'play' || run.cleared) return false;
  run.bells.push({ x, y, age: 0, life: 1.7, reach: 320 });
  run.cooldown = 0.42;
  run.bellsRung += 1;
  run.justRang = true;
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    run.puffs.push({
      x,
      y,
      vx: Math.cos(a) * 40,
      vy: Math.sin(a) * 40,
      age: 0,
      life: 0.45,
    });
  }
  return true;
}

export function stepBells(run, dt) {
  run.cooldown = Math.max(0, run.cooldown - dt);
  for (const bell of run.bells) bell.age += dt;
  run.bells = run.bells.filter((bell) => bell.age < bell.life);
  for (const puff of run.puffs) {
    puff.age += dt;
    puff.x += puff.vx * dt;
    puff.y += puff.vy * dt;
  }
  run.puffs = run.puffs.filter((puff) => puff.age < puff.life);
}
