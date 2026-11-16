// The screenshot scenes behind ?shot=start|play|combo|end. Each one plays the real rules
// forward from a fresh world for a fixed number of steps, steered by a simple autopilot (chase
// the nearest mote, keep clear of shards), so the frame is what a short game really looks like
// and the same seed always gives the same frame.
import { FIELD, STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 26;
const COMBO_SECONDS = 16;
const END_LIMIT_SECONDS = 600;

/** How close a shard must be before the autopilot flees from it instead of chasing a mote. */
const DANGER_PLAY = 160;
const DANGER_COMBO = 95;

/** Steer toward the nearest mote, fleeing a shard that is too close. */
function autopilot(state, dangerRadius) {
  const wisp = state.wisp;
  let mote = null;
  let moteDistance = Infinity;
  for (const item of state.motes) {
    if (!item.active) continue;
    const distance = Math.hypot(item.x - wisp.x, item.y - wisp.y);
    if (distance < moteDistance) {
      moteDistance = distance;
      mote = item;
    }
  }
  let shard = null;
  let shardDistance = Infinity;
  for (const item of state.shards) {
    if (!item.active) continue;
    const distance = Math.hypot(item.x - wisp.x, item.y - wisp.y);
    if (distance < shardDistance) {
      shardDistance = distance;
      shard = item;
    }
  }

  let x = 0;
  let y = 0;
  if (mote !== null) {
    x = mote.x - wisp.x;
    y = mote.y - wisp.y;
  } else {
    // No mote in play: drift back to the middle of the field, where there is room to
    // dodge in every direction, instead of hugging the top edge where shards spawn.
    x = FIELD.width / 2 - wisp.x;
    y = FIELD.height / 2 - wisp.y;
  }
  if (shard !== null && shardDistance < dangerRadius) {
    const weight = 2.2 * (1 - shardDistance / dangerRadius);
    x += ((wisp.x - shard.x) / Math.max(1, shardDistance)) * weight;
    y += ((wisp.y - shard.y) / Math.max(1, shardDistance)) * weight;
  }
  const length = Math.hypot(x, y);
  if (length < 0.001) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

/** Run the world forward for `seconds`, steering with the autopilot, until it ends. */
function runFor(world, seconds, dangerRadius) {
  const steps = Math.floor(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    const move = autopilot(world.state, dangerRadius);
    if (world.step(STEP, move.x, move.y, false) & EVENT_OVER) break;
  }
}

/**
 * Set `world` to the named scene (start, play, combo or end; any other name is start) and
 * return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'combo' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP, 0, 0, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'combo') {
    runFor(world, COMBO_SECONDS, DANGER_COMBO);
    const over = world.state.lives === 0;
    return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
  }
  if (name === 'end') {
    for (let index = 0; index < END_LIMIT_SECONDS / STEP; index += 1) {
      const move = autopilot(world.state, 0);
      if (world.step(STEP, move.x, move.y, false) & EVENT_OVER) break;
    }
    return { screen: SCREEN_OVER, best: world.state.score };
  }
  runFor(world, PLAY_SECONDS, DANGER_PLAY);
  const over = world.state.lives === 0;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}
