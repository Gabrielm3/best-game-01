import { FIELD_H, FIELD_W } from './field.js';

export function createInput(canvas) {
  const keys = new Set();
  const held = {
    ax: FIELD_W * 0.5,
    ay: FIELD_H * 0.5,
    hook: false,
    cut: false,
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
    if (key === ' ') held.cut = true;
    if (key === 'escape' || key === 'p') held.pause = true;
    if (key === 'm') held.mute = true;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointerdown', (event) => {
    place(event);
    held.hook = true;
    held.start = true;
  });
  canvas.addEventListener('pointermove', place);

  return {
    take() {
      let x = 0;
      let y = 0;
      if (keys.has('arrowleft') || keys.has('a')) x -= 1;
      if (keys.has('arrowright') || keys.has('d')) x += 1;
      if (keys.has('arrowup') || keys.has('w')) y -= 1;
      if (keys.has('arrowdown') || keys.has('s')) y += 1;
      const length = Math.hypot(x, y) || 1;
      const snapshot = {
        x: x === 0 && y === 0 ? 0 : x / length,
        y: x === 0 && y === 0 ? 0 : y / length,
        ax: held.ax,
        ay: held.ay,
        hook: held.hook,
        cut: held.cut,
        start: held.start,
        pause: held.pause,
        mute: held.mute,
      };
      held.hook = false;
      held.cut = false;
      held.start = false;
      held.pause = false;
      held.mute = false;
      return snapshot;
    },
  };
}
