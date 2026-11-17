import { splash } from './particles.js';

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

export function hookCable(run, x, y) {
  if (run.mode !== 'play' || run.cleared) return false;
  let best = null;
  let bestD = 78;
  for (const post of run.level.bollards) {
    const dist = Math.hypot(post.x - x, post.y - y);
    if (dist < bestD) {
      best = post;
      bestD = dist;
    }
  }
  if (!best) return false;
  if (Math.hypot(best.x - run.boat.x, best.y - run.boat.y) > 360) return false;
  run.cable = { x: best.x, y: best.y };
  run.justHook = true;
  return true;
}

export function cutCable(run) {
  if (run.mode !== 'play' || run.cleared) return false;
  if (run.snag) {
    run.snag.log.gone = true;
    run.snag = null;
    run.cuts += 1;
    run.justCut = true;
    splash(run, run.boat.x, run.boat.y);
    return true;
  }
  if (run.cable) {
    run.cable = null;
    return true;
  }
  return false;
}

export function stepSnag(run, dt) {
  if (!run.cable) {
    run.snag = null;
    return;
  }
  if (!run.snag) {
    for (const log of run.logs) {
      if (log.gone) continue;
      const dist = distToSegment(log.x, log.y, run.boat.x, run.boat.y, run.cable.x, run.cable.y);
      if (dist < 28) {
        run.snag = { log, left: 1.2 };
        break;
      }
    }
    return;
  }
  run.snag.left -= dt;
  if (run.snag.left <= 0) {
    run.crates = Math.max(0, run.crates - 1);
    run.lost += 1;
    run.cable = null;
    run.snag = null;
    run.justLost = true;
    splash(run, run.boat.x, run.boat.y);
  }
}
