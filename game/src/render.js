// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The look is a deep-space field, a flowing aurora in three glowing bands, a comet
// wisp, golden motes, jagged void shards and spark bursts, all in canvas 2D with additive
// glow. Text that holds a number is rebuilt only when the number changes, so a frame
// allocates nothing.
import { FIELD, FONT, LIVES, PALETTE, PALETTES } from './config.js';
import { KIND_NOVA, KIND_SHIELD } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** The panel's width; its height grows with its lines: room for the title, the lines and the prompt. */
const PANEL = { width: 640, top: 150, line: 34, bottom: 76 };
const STAR_COUNT = 130;

/** A deterministic star field: the same stars every load, twinkling with time. */
function makeStars() {
  const stars = [];
  let seed = 1234567;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let index = 0; index < STAR_COUNT; index += 1) {
    stars.push({
      x: next() * FIELD.width,
      y: next() * FIELD.height,
      radius: 0.6 + next() * 1.5,
      phase: next() * Math.PI * 2,
      speed: 0.6 + next() * 1.8,
    });
  }
  return stars;
}

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const stars = makeStars();
  const scoreLabel = cachedLabel('Score ');
  const levelLabel = cachedLabel('Level ');
  const comboLabel = cachedLabel('Combo x');
  const finalLabel = cachedLabel('Score ');
  const bestLabel = cachedLabel('Best ');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  /** A soft radial glow: a bright core fading to transparent. */
  function glow(x, y, radius, color, alpha) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.globalAlpha = alpha;
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }

  function drawBackground(time, palette) {
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, FIELD.width, FIELD.height);

    // Two slow nebula washes, violet and teal, barely there.
    const nebula = context.createRadialGradient(300, 160, 0, 300, 160, 520);
    nebula.addColorStop(0, 'rgba(123,92,255,0.16)');
    nebula.addColorStop(1, 'rgba(123,92,255,0)');
    context.fillStyle = nebula;
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    const nebula2 = context.createRadialGradient(1020, 560, 0, 1020, 560, 480);
    nebula2.addColorStop(0, 'rgba(25,227,194,0.12)');
    nebula2.addColorStop(1, 'rgba(25,227,194,0)');
    context.fillStyle = nebula2;
    context.fillRect(0, 0, FIELD.width, FIELD.height);

    // Twinkling stars.
    for (const star of stars) {
      const alpha = 0.35 + 0.3 * Math.sin(time * star.speed + star.phase);
      context.globalAlpha = Math.max(0.08, alpha);
      context.fillStyle = '#dfe8ff';
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }

  /** One aurora band: a ribbon between two sine edges, filled with a vertical gradient. */
  function auroraBand(time, palette, bandIndex) {
    const colors = palette.bands;
    const baseY = 300 + bandIndex * 46;
    const amp1 = 62 - bandIndex * 12;
    const amp2 = 34 - bandIndex * 6;
    const speed1 = 0.32 + bandIndex * 0.05;
    const speed2 = 0.21 + bandIndex * 0.04;
    const thickness = 120 - bandIndex * 22;
    context.beginPath();
    for (let x = 0; x <= FIELD.width; x += 16) {
      const y = baseY + Math.sin(x * 0.0042 + time * speed1 + bandIndex * 1.7) * amp1 + Math.sin(x * 0.009 + time * speed2) * amp2;
      if (x === 0) context.moveTo(x, y - thickness / 2);
      else context.lineTo(x, y - thickness / 2);
    }
    for (let x = FIELD.width; x >= 0; x -= 16) {
      const y = baseY + Math.sin(x * 0.0042 + time * speed1 + bandIndex * 1.7) * amp1 + Math.sin(x * 0.009 + time * speed2) * amp2;
      context.lineTo(x, y + thickness / 2);
    }
    context.closePath();
    const gradient = context.createLinearGradient(0, baseY - thickness, 0, baseY + thickness);
    gradient.addColorStop(0, colors[bandIndex % colors.length]);
    gradient.addColorStop(0.5, colors[(bandIndex + 1) % colors.length]);
    gradient.addColorStop(1, colors[(bandIndex + 2) % colors.length]);
    context.globalAlpha = 0.16;
    context.fillStyle = gradient;
    context.fill();
    context.globalAlpha = 1;
  }

  /** The aurora's bright core line, the spine the bands hang from. */
  function auroraCore(time, palette) {
    context.beginPath();
    for (let x = 0; x <= FIELD.width; x += 16) {
      const y = 300 + Math.sin(x * 0.0042 + time * 0.32) * 62 + Math.sin(x * 0.009 + time * 0.21) * 34;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = palette.bands[0];
    context.globalAlpha = 0.5;
    context.lineWidth = 2.5;
    context.stroke();
    context.globalAlpha = 1;
  }

  function drawAurora(time, palette) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    auroraBand(time, palette, 0);
    auroraBand(time, palette, 1);
    auroraBand(time, palette, 2);
    auroraCore(time, palette);
    context.restore();
  }

  function drawMotes(state, palette, time) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (const mote of state.motes) {
      if (!mote.active) continue;
      const pulse = 1 + 0.18 * Math.sin(time * 5 + mote.phase);
      const radius = mote.radius * pulse;
      glow(mote.x, mote.y, radius * 3.2, palette.mote, 0.5);
      context.fillStyle = palette.mote;
      context.beginPath();
      context.arc(mote.x, mote.y, radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#fff8e0';
      context.beginPath();
      context.arc(mote.x, mote.y, radius * 0.45, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function drawShards(state, palette) {
    for (const shard of state.shards) {
      if (!shard.active) continue;
      context.save();
      context.translate(shard.x, shard.y);
      context.rotate(shard.angle);
      context.beginPath();
      for (let index = 0; index < shard.points.length; index += 1) {
        const point = shard.points[index];
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.closePath();
      context.fillStyle = '#0b0616';
      context.fill();
      context.strokeStyle = palette.shard;
      context.lineWidth = 2.5;
      context.stroke();
      context.restore();
      context.save();
      context.globalCompositeOperation = 'lighter';
      glow(shard.x, shard.y, shard.radius * 2.2, palette.shard, 0.22);
      context.restore();
    }
  }

  function drawPowerups(state, palette, time) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (const powerup of state.powerups) {
      if (!powerup.active) continue;
      const pulse = 1 + 0.15 * Math.sin(time * 6);
      if (powerup.kind === KIND_NOVA) {
        glow(powerup.x, powerup.y, powerup.radius * 3.4, '#ffffff', 0.6);
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(powerup.x, powerup.y, powerup.radius * 0.55 * pulse, 0, Math.PI * 2);
        context.fill();
      } else {
        glow(powerup.x, powerup.y, powerup.radius * 3.2, '#4fd8ff', 0.55);
        context.strokeStyle = '#4fd8ff';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(powerup.x, powerup.y, powerup.radius * 0.8 * pulse, 0, Math.PI * 2);
        context.stroke();
      }
    }
    context.restore();
  }

  function drawSparks(state) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (const spark of state.sparks) {
      if (!spark.active) continue;
      context.globalAlpha = Math.max(0, spark.life / spark.maxLife);
      context.fillStyle = spark.color;
      context.beginPath();
      context.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
    context.globalAlpha = 1;
  }

  function drawWisp(state, palette, time) {
    const wisp = state.wisp;
    // The comet trail: fading circles from the oldest kept position to the wisp.
    context.save();
    context.globalCompositeOperation = 'lighter';
    for (let index = wisp.trail.length - 1; index >= 0; index -= 1) {
      const point = wisp.trail[index];
      const fraction = 1 - index / wisp.trail.length;
      context.globalAlpha = fraction * 0.35;
      context.fillStyle = palette.bands[0];
      context.beginPath();
      context.arc(point.x, point.y, wisp.radius * (0.35 + fraction * 0.5), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
    context.globalAlpha = 1;

    // Blink while invulnerable after a hit: hidden on every other tenth of a second.
    if (wisp.invulnerable > 0 && Math.floor(wisp.invulnerable * 10) % 2 === 0) return;
    context.save();
    context.globalCompositeOperation = 'lighter';
    glow(wisp.x, wisp.y, wisp.radius * 3.4, palette.wisp, 0.75);
    context.restore();
    context.fillStyle = palette.wisp;
    context.beginPath();
    context.arc(wisp.x, wisp.y, wisp.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(wisp.x, wisp.y, wisp.radius * 0.5, 0, Math.PI * 2);
    context.fill();
    if (wisp.shield) {
      context.strokeStyle = '#4fd8ff';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(wisp.x, wisp.y, wisp.radius + 9 + 2 * Math.sin(time * 6), 0, Math.PI * 2);
      context.stroke();
    }
  }

  function drawHud(state, palette) {
    context.textBaseline = 'top';
    text(scoreLabel(state.score), 24, 18, 28, palette.text, 'left');
    text(levelLabel(state.level), FIELD.width / 2, 18, 28, palette.text, 'center');
    const lifeLabel = 'Lives';
    const lifeSize = 18;
    const lifeGap = 8;
    const firstLife = FIELD.width - 24 - LIVES * (lifeSize + lifeGap) + lifeGap;
    text(lifeLabel, firstLife - 12, 18, 28, palette.text, 'right');
    for (let life = 0; life < LIVES; life += 1) {
      const x = firstLife + life * (lifeSize + lifeGap);
      const y = 24;
      if (life < state.lives) {
        context.save();
        context.globalCompositeOperation = 'lighter';
        glow(x + lifeSize / 2, y + lifeSize / 2, lifeSize, palette.bands[0], 0.6);
        context.restore();
        context.fillStyle = palette.bands[0];
      } else {
        context.fillStyle = 'rgba(255,255,255,0.14)';
      }
      context.beginPath();
      context.arc(x + lifeSize / 2, y + lifeSize / 2, lifeSize / 2, 0, Math.PI * 2);
      context.fill();
    }
    if (state.chain >= 2) {
      const multiplier = state.chain >= 5 ? 8 : state.chain >= 4 ? 5 : state.chain >= 3 ? 3 : 2;
      context.textBaseline = 'top';
      text(comboLabel(multiplier), 24, 56, 26, palette.mote, 'left');
    }
  }

  function drawPanel(title, lines, prompt, palette) {
    const height = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const x = (FIELD.width - PANEL.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = palette.panel;
    context.globalAlpha = 0.92;
    context.fillRect(x, y, PANEL.width, height);
    context.globalAlpha = 1;
    context.strokeStyle = palette.bands[0];
    context.globalAlpha = 0.45;
    context.lineWidth = 2;
    context.strokeRect(x, y, PANEL.width, height);
    context.globalAlpha = 1;
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 78, 52, palette.text, 'center');
    for (let index = 0; index < lines.length; index += 1) {
      text(lines[index], FIELD.width / 2, y + PANEL.top + index * PANEL.line, 22, palette.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 38, 24, palette.mote, 'center');
  }

  const TITLE_LINES = [
    'Ride the light. Catch the golden motes, dodge the void shards.',
    'Move with arrows or WASD, or steer with the mouse. Chain motes for a combo.',
    'Nova clears the sky. A shield survives one hit. 3 lives. M mutes.',
    '',
  ];
  const PAUSED_LINES = ['The aurora will wait for you.'];
  const OVER_LINES = ['', ''];

  /** Paint one frame: the field, then the HUD or a panel for the screen the game is on. */
  function draw(state, screen, best) {
    const palette = PALETTES[(state.level - 1) % PALETTES.length];
    const time = state.time;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawBackground(time, palette);
    drawAurora(time, palette);
    drawMotes(state, palette, time);
    drawShards(state, palette);
    drawPowerups(state, palette, time);
    drawSparks(state);
    drawWisp(state, palette, time);
    if (screen === SCREEN_TITLE) {
      TITLE_LINES[3] = bestLabel(best);
      drawPanel('AURORA', TITLE_LINES, 'Press Space or click to ride', palette);
      return;
    }
    drawHud(state, palette);
    if (screen === SCREEN_PAUSED) drawPanel('Paused', PAUSED_LINES, 'Press P to resume', palette);
    else if (screen === SCREEN_OVER) {
      OVER_LINES[0] = finalLabel(state.score);
      OVER_LINES[1] = bestLabel(best);
      drawPanel('The light fades', OVER_LINES, 'Press Space or click to ride again', palette);
    }
  }

  /** CSS pixels over the canvas into playfield coordinates, for pointer steering. */
  function toField(cssX, cssY) {
    const ratio = window.devicePixelRatio || 1;
    return {
      x: (cssX * ratio - view.x) / view.scale,
      y: (cssY * ratio - view.y) / view.scale,
    };
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField };
}
