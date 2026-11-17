export function splash(run, x, y) {
  for (let i = 0; i < 7; i += 1) {
    const angle = -Math.PI * 0.15 + (i / 6) * Math.PI * 1.3;
    run.splashes.push({
      x,
      y,
      vx: Math.cos(angle) * (40 + i * 8),
      vy: -Math.abs(Math.sin(angle)) * 90,
      age: 0,
      life: 0.45,
    });
  }
}

export function stepSplashes(run, dt) {
  for (const drop of run.splashes) {
    drop.age += dt;
    drop.vy += 280 * dt;
    drop.x += drop.vx * dt;
    drop.y += drop.vy * dt;
  }
  run.splashes = run.splashes.filter((drop) => drop.age < drop.life);
}
