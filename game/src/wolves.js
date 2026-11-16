import { FIELD_H, FIELD_W } from './field.js';

export function createWolves(run) {
  return run.level.wolves.map((wolf) => ({
    x: wolf.x,
    y: wolf.y,
    homeX: wolf.x,
    homeY: wolf.y,
    speed: wolf.speed,
    delay: wolf.delay,
    bite: 0,
  }));
}

export function stepWolves(run, dt) {
  for (const wolf of run.wolves) {
    wolf.delay -= dt;
    if (wolf.delay > 0) continue;
    const shepherdDist = Math.hypot(run.shepherd.x - wolf.x, run.shepherd.y - wolf.y) || 0.001;
    let targetX = wolf.homeX + Math.sin(run.time * 0.7 + wolf.homeY) * 30;
    let targetY = wolf.homeY + Math.cos(run.time * 0.5 + wolf.homeX) * 20;
    if (shepherdDist < 130) {
      targetX = wolf.x + (wolf.x - run.shepherd.x) * 2;
      targetY = wolf.y + (wolf.y - run.shepherd.y) * 2;
    } else {
      let prey = null;
      let preyDist = 130;
      for (const sheep of run.sheep) {
        if (sheep.gone) continue;
        const dist = Math.hypot(sheep.x - wolf.x, sheep.y - wolf.y);
        if (dist < preyDist) {
          prey = sheep;
          preyDist = dist;
        }
      }
      if (prey) {
        targetX = prey.x;
        targetY = prey.y;
      }
    }
    const dx = targetX - wolf.x;
    const dy = targetY - wolf.y;
    const dist = Math.hypot(dx, dy) || 1;
    wolf.x += (dx / dist) * wolf.speed * dt;
    wolf.y += (dy / dist) * wolf.speed * dt;
    for (const rock of run.rocks) {
      const rx = wolf.x - rock.x;
      const ry = wolf.y - rock.y;
      const rd = Math.hypot(rx, ry) || 0.001;
      if (rd < rock.r + 16) {
        wolf.x += (rx / rd) * (rock.r + 16 - rd);
        wolf.y += (ry / rd) * (rock.r + 16 - rd);
      }
    }
    wolf.x = Math.max(30, Math.min(FIELD_W - 30, wolf.x));
    wolf.y = Math.max(100, Math.min(FIELD_H - 30, wolf.y));
    if (wolf.x > run.fold.x) wolf.x = run.fold.x;
    for (const sheep of run.sheep) {
      if (sheep.gone) continue;
      if (Math.hypot(sheep.x - wolf.x, sheep.y - wolf.y) < 16) {
        sheep.gone = 'lost';
        run.lost += 1;
        run.justLost = true;
        wolf.bite = 0.25;
      }
    }
    wolf.bite = Math.max(0, wolf.bite - dt);
  }
}
