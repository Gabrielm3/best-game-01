export function ripple(run, x, y) {
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    run.puffs.push({
      x,
      y,
      vx: Math.cos(angle) * 70,
      vy: Math.sin(angle) * 70,
      age: 0,
      life: 0.55,
    });
  }
}

export function stepPuffs(run, dt) {
  for (const puff of run.puffs) {
    puff.age += dt;
    puff.x += puff.vx * dt;
    puff.y += puff.vy * dt;
  }
  run.puffs = run.puffs.filter((puff) => puff.age < puff.life);
}
