// The game's rules and state, with no drawing and no browser in it: the wisp, the pool of
// motes, shards, power-ups and sparks, spawning, collisions, combo, score, lives and level.
// step() advances one fixed step and returns what happened as bit flags, so the caller can
// react (and play sounds) without the world knowing about screens or sound. Nothing here
// allocates after createWorld returns.
import {
  COMBO_STEPS,
  COMBO_WINDOW,
  FIELD,
  LEVEL_MAX,
  LIVES,
  MOTE,
  MOTES_PER_LEVEL,
  POOL,
  POWERUP,
  SHARD,
  WISP,
} from './config.js';

export const KIND_MOTE = 0;
export const KIND_SHARD = 1;
export const KIND_NOVA = 2;
export const KIND_SHIELD = 3;

export const EVENT_MOTE = 1;
export const EVENT_HIT = 2;
export const EVENT_OVER = 4;
export const EVENT_LEVEL = 8;
export const EVENT_NOVA = 16;
export const EVENT_SHIELD = 32;

function circleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const reach = ar + br;
  return dx * dx + dy * dy < reach * reach;
}

export function createWorld(random) {
  const wisp = {
    x: FIELD.width / 2,
    y: FIELD.height / 2,
    radius: WISP.radius,
    invulnerable: 0,
    shield: false,
    trail: [],
  };
  for (let index = 0; index < WISP.trail; index += 1) wisp.trail.push({ x: wisp.x, y: wisp.y });

  const motes = [];
  for (let index = 0; index < POOL.motes; index += 1) {
    motes.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, sway: 0, phase: 0, radius: MOTE.radius });
  }
  const shards = [];
  for (let index = 0; index < POOL.shards; index += 1) {
    shards.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, radius: SHARD.radius, spin: 0, angle: 0, points: [] });
  }
  const powerups = [];
  for (let index = 0; index < POOL.powerups; index += 1) {
    powerups.push({ active: false, kind: KIND_NOVA, x: 0, y: 0, vy: 0, radius: POWERUP.radius });
  }
  const sparks = [];
  for (let index = 0; index < POOL.sparks; index += 1) {
    sparks.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#ffffff' });
  }

  const state = {
    wisp,
    motes,
    shards,
    powerups,
    sparks,
    score: 0,
    lives: LIVES,
    level: 1,
    motesCollected: 0,
    chain: 0,
    comboTimer: 0,
    elapsed: 0,
    moteTimer: 0.4,
    shardTimer: 1.2,
    powerupTimer: POWERUP.interval,
    time: 0,
  };

  function reset() {
    wisp.x = FIELD.width / 2;
    wisp.y = FIELD.height / 2;
    wisp.invulnerable = 0;
    wisp.shield = false;
    for (let index = 0; index < WISP.trail; index += 1) {
      wisp.trail[index].x = wisp.x;
      wisp.trail[index].y = wisp.y;
    }
    for (const mote of motes) mote.active = false;
    for (const shard of shards) shard.active = false;
    for (const powerup of powerups) powerup.active = false;
    for (const spark of sparks) spark.active = false;
    state.score = 0;
    state.lives = LIVES;
    state.level = 1;
    state.motesCollected = 0;
    state.chain = 0;
    state.comboTimer = 0;
    state.elapsed = 0;
    state.moteTimer = 0.4;
    state.shardTimer = 1.2;
    state.powerupTimer = POWERUP.interval;
    state.time = 0;
  }

  function free(pool) {
    for (let index = 0; index < pool.length; index += 1) if (!pool[index].active) return pool[index];
    return null;
  }

  function spawnSparks(x, y, color, count, speed) {
    let made = 0;
    for (let index = 0; index < sparks.length && made < count; index += 1) {
      const spark = sparks[index];
      if (spark.active) continue;
      spark.active = true;
      spark.x = x;
      spark.y = y;
      const angle = random() * Math.PI * 2;
      const velocity = speed * (0.4 + random() * 0.8);
      spark.vx = Math.cos(angle) * velocity;
      spark.vy = Math.sin(angle) * velocity;
      spark.maxLife = 0.45 + random() * 0.4;
      spark.life = spark.maxLife;
      spark.size = 1.5 + random() * 2.5;
      spark.color = color;
      made += 1;
    }
  }

  function spawnMote() {
    const mote = free(motes);
    if (mote === null) return;
    mote.active = true;
    mote.x = 40 + random() * (FIELD.width - 80);
    mote.y = -20;
    mote.vy = MOTE.speed + MOTE.speedPerLevel * (state.level - 1) + random() * 20;
    mote.vx = 0;
    mote.sway = 24 + random() * 30;
    mote.phase = random() * Math.PI * 2;
  }

  function shardPoints(radius) {
    const points = [];
    const count = 6;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const reach = radius * (0.72 + random() * 0.45);
      points.push({ x: Math.cos(angle) * reach, y: Math.sin(angle) * reach });
    }
    return points;
  }

  function spawnShard() {
    const shard = free(shards);
    if (shard === null) return;
    const active = shards.reduce((count, item) => count + (item.active ? 1 : 0), 0);
    const cap = SHARD.maxAtOnce + Math.floor((state.level - 1) / 2);
    if (active >= cap) return;
    shard.active = true;
    shard.x = 40 + random() * (FIELD.width - 80);
    shard.y = -24;
    shard.vy = SHARD.speed + SHARD.speedPerLevel * (state.level - 1) + random() * 30;
    shard.vx = 0;
    shard.spin = (random() - 0.5) * 2.4;
    shard.angle = random() * Math.PI * 2;
    shard.points = shardPoints(shard.radius);
  }

  function spawnPowerup() {
    const powerup = free(powerups);
    if (powerup === null) return;
    powerup.active = true;
    powerup.kind = random() < 0.5 ? KIND_NOVA : KIND_SHIELD;
    powerup.x = 60 + random() * (FIELD.width - 120);
    powerup.y = -20;
    powerup.vy = 55;
  }

  function moteInterval() {
    return Math.max(MOTE.minInterval, MOTE.interval * MOTE.intervalScale ** (state.level - 1));
  }

  function shardInterval() {
    return Math.max(SHARD.minInterval, SHARD.interval * SHARD.intervalScale ** (state.level - 1));
  }

  function comboMultiplier() {
    return COMBO_STEPS[Math.min(Math.max(state.chain - 1, 0), COMBO_STEPS.length - 1)];
  }

  /**
   * One fixed step. `mx` and `my` are the wisp's wanted direction (-1..1 each). With
   * `harmless` set (the title screen's backdrop) things drift but nothing scores and nothing
   * can hit the wisp.
   */
  function step(dt, mx, my, harmless) {
    let events = 0;
    state.time += dt;
    if (!harmless) state.elapsed += dt;
    const level = Math.min(LEVEL_MAX, 1 + Math.floor(state.motesCollected / MOTES_PER_LEVEL));
    if (!harmless && level > state.level) {
      state.level = level;
      events |= EVENT_LEVEL;
    }

    // The wisp: move, clamp to the field, and remember the trail for the comet tail.
    const length = Math.hypot(mx, my);
    if (length > 0.001) {
      const nx = mx / Math.max(1, length);
      const ny = my / Math.max(1, length);
      wisp.x = Math.min(FIELD.width - wisp.radius, Math.max(wisp.radius, wisp.x + nx * WISP.speed * dt));
      wisp.y = Math.min(FIELD.height - wisp.radius, Math.max(wisp.radius, wisp.y + ny * WISP.speed * dt));
    }
    for (let index = WISP.trail - 1; index > 0; index -= 1) {
      wisp.trail[index].x = wisp.trail[index - 1].x;
      wisp.trail[index].y = wisp.trail[index - 1].y;
    }
    wisp.trail[0].x = wisp.x;
    wisp.trail[0].y = wisp.y;
    if (wisp.invulnerable > 0) wisp.invulnerable = Math.max(0, wisp.invulnerable - dt);

    // The combo fades if the chain is left alone too long.
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.chain = 0;
    }

    // Spawning.
    state.moteTimer -= dt;
    if (state.moteTimer <= 0) {
      spawnMote();
      state.moteTimer += moteInterval();
    }
    state.shardTimer -= dt;
    if (state.shardTimer <= 0) {
      spawnShard();
      state.shardTimer += shardInterval();
    }
    state.powerupTimer -= dt;
    if (state.powerupTimer <= 0) {
      spawnPowerup();
      state.powerupTimer += POWERUP.interval + random() * POWERUP.intervalJitter;
    }

    // Motes drift down with a sway and are collected on touch.
    for (const mote of motes) {
      if (!mote.active) continue;
      mote.y += mote.vy * dt;
      mote.x += Math.sin(state.time * 1.6 + mote.phase) * mote.sway * dt;
      if (mote.y > FIELD.height + 24) {
        mote.active = false;
        continue;
      }
      if (harmless) continue;
      if (!circleHit(mote.x, mote.y, mote.radius, wisp.x, wisp.y, wisp.radius)) continue;
      mote.active = false;
      state.chain += 1;
      state.comboTimer = COMBO_WINDOW;
      state.motesCollected += 1;
      const gained = MOTE.points * comboMultiplier();
      state.score += gained;
      spawnSparks(mote.x, mote.y, '#ffd76a', 10, 160);
      events |= EVENT_MOTE;
    }

    // Shards drift down, bend toward the wisp, and cost a life on touch.
    for (const shard of shards) {
      if (!shard.active) continue;
      const dx = wisp.x - shard.x;
      const dy = wisp.y - shard.y;
      const distance = Math.hypot(dx, dy) || 1;
      shard.vx += (dx / distance) * SHARD.homing * SHARD.speed * dt * 0.12;
      shard.vy += (dy / distance) * SHARD.homing * SHARD.speed * dt * 0.05;
      shard.x += shard.vx * dt;
      shard.y += shard.vy * dt;
      shard.angle += shard.spin * dt;
      if (shard.y > FIELD.height + 32 || shard.x < -40 || shard.x > FIELD.width + 40) {
        shard.active = false;
        continue;
      }
      if (harmless || wisp.invulnerable > 0) continue;
      if (!circleHit(shard.x, shard.y, shard.radius * 0.85, wisp.x, wisp.y, wisp.radius)) continue;
      shard.active = false;
      spawnSparks(wisp.x, wisp.y, '#ff5470', 16, 220);
      if (wisp.shield) {
        wisp.shield = false;
        wisp.invulnerable = WISP.invulnerable;
        state.chain = 0;
        events |= EVENT_HIT;
        continue;
      }
      state.lives -= 1;
      state.chain = 0;
      wisp.invulnerable = WISP.invulnerable;
      events |= EVENT_HIT;
      if (state.lives === 0) {
        events |= EVENT_OVER;
        break;
      }
    }

    // Power-ups drift down and are collected on touch.
    for (const powerup of powerups) {
      if (!powerup.active) continue;
      powerup.y += powerup.vy * dt;
      if (powerup.y > FIELD.height + 24) {
        powerup.active = false;
        continue;
      }
      if (harmless) continue;
      if (!circleHit(powerup.x, powerup.y, powerup.radius, wisp.x, wisp.y, wisp.radius)) continue;
      powerup.active = false;
      if (powerup.kind === KIND_NOVA) {
        let cleared = 0;
        for (const shard of shards) {
          if (!shard.active) continue;
          spawnSparks(shard.x, shard.y, '#ffffff', 6, 200);
          shard.active = false;
          cleared += 1;
        }
        state.score += cleared * POWERUP.novaPoints;
        spawnSparks(wisp.x, wisp.y, '#ffffff', 26, 320);
        events |= EVENT_NOVA;
      } else {
        wisp.shield = true;
        events |= EVENT_SHIELD;
      }
    }

    // Sparks fade and drift.
    for (const spark of sparks) {
      if (!spark.active) continue;
      spark.life -= dt;
      if (spark.life <= 0) {
        spark.active = false;
        continue;
      }
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= 0.985;
      spark.vy *= 0.985;
    }

    return events;
  }

  reset();
  return { state, reset, step, comboMultiplier, spawnSparks };
}
