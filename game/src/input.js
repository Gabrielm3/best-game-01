import { FIELD_H, FIELD_W } from './field.js';

export function createInput(canvas) {
  const keys = new Set();
  const held = {
    ax: FIELD_W * 0.55,
    ay: FIELD_H * 0.5,
    ring: false,
    start: false,
    pause: false,
    mute: false,
  };

  function place(event) {
    const rect = canvas.getBoundingClientRect();
    held.ax = ((event.clientX - rect.left) / rect.width) * FIELD_W;
    held.ay = ((event.clientY - rect.top) / rect.height) * FIELD_H;
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (keys.has(key)) return;
    keys.add(key);
    if (key === ' ' || key === 'enter') held.start = true;
    if (key === ' ') held.ring = true;
    if (key === 'escape' || key === 'p') held.pause = true;
    if (key === 'm') held.mute = true;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointerdown', (event) => {
    place(event);
    held.ring = true;
    held.start = true;
  });
  canvas.addEventListener('pointermove', place);

  return {
    take(shepherd) {
      let x = 0;
      let y = 0;
      if (keys.has('arrowleft') || keys.has('a')) x -= 1;
      if (keys.has('arrowright') || keys.has('d')) x += 1;
      if (keys.has('arrowup') || keys.has('w')) y -= 1;
      if (keys.has('arrowdown') || keys.has('s')) y += 1;
      const length = Math.hypot(x, y) || 1;
      let ax = held.ax;
      let ay = held.ay;
      if (keys.has(' ') || (held.ring && keys.has(' '))) {
        const dx = 1120 - shepherd.x;
        const dy = 390 - shepherd.y;
        const dist = Math.hypot(dx, dy) || 1;
        ax = shepherd.x + (dx / dist) * 170;
        ay = shepherd.y + (dy / dist) * 170;
      }
      const snapshot = {
        x: x === 0 && y === 0 ? 0 : x / length,
        y: x === 0 && y === 0 ? 0 : y / length,
        ax,
        ay,
        ring: held.ring,
        start: held.start,
        pause: held.pause,
        mute: held.mute,
      };
      held.ring = false;
      held.start = false;
      held.pause = false;
      held.mute = false;
      return snapshot;
    },
  };
}
