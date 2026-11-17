export function placeHurdle(run) {
  if (run.mode !== 'play' || run.cleared) return false;
  if (run.hurdleCool > 0 || run.hurdles.length >= 4) return false;
  run.hurdles.push({ x: run.shepherd.x, y: run.shepherd.y, w: 86, h: 18 });
  run.hurdleCool = 0.7;
  return true;
}

export function stepHurdles(run, dt) {
  run.hurdleCool = Math.max(0, run.hurdleCool - dt);
}

export function pushHurdles(entity, hurdles, pad) {
  for (const hurdle of hurdles) {
    const dx = entity.x - hurdle.x;
    const dy = entity.y - hurdle.y;
    const halfW = hurdle.w / 2 + pad;
    const halfH = hurdle.h / 2 + pad;
    if (Math.abs(dx) >= halfW || Math.abs(dy) >= halfH) continue;
    if (halfW - Math.abs(dx) < halfH - Math.abs(dy)) {
      entity.x += Math.sign(dx || 1) * (halfW - Math.abs(dx));
    } else {
      entity.y += Math.sign(dy || 1) * (halfH - Math.abs(dy));
    }
  }
}
