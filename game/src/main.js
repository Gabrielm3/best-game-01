import { playCut, playDeliver, playHook, playLoss, stepScore, toggleMute, unlockAudio } from './audio.js';
import { paint } from './draw.js';
import { STEP } from './field.js';
import { createInput } from './input.js';
import { createRun, restartRun, stepRun } from './run.js';
import { loadSave } from './save.js';
import { stageShot } from './shots.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed')) || 1;
const run = shotName ? stageShot(shotName, seed) : createRun(seed);
if (!shotName) {
  run.record = loadSave();
  run.best = run.record.best;
}

const input = createInput(canvas);

function paintStatus() {
  status.textContent = `Cutwater. ${run.level.name}. Wharf ${run.delivered} of ${run.level.quota}. Crates ${run.crates}.`;
}

if (shotName) {
  paint(ctx, run);
  paintStatus();
  requestAnimationFrame(() => {
    window.__shotReady = true;
  });
} else {
  let last = performance.now();
  let acc = 0;
  const loop = (now) => {
    acc += Math.min(0.05, (now - last) / 1000);
    last = now;
    const snap = input.take();
    if (snap.mute) toggleMute();
    if (snap.start && run.mode === 'title') {
      unlockAudio();
      run.mode = 'play';
    } else if (snap.start && (run.mode === 'victory' || run.mode === 'defeat')) {
      unlockAudio();
      restartRun(run);
      run.record = loadSave();
      run.best = run.record.best;
    } else if (snap.pause && run.mode === 'play') run.mode = 'pause';
    else if (snap.pause && run.mode === 'pause') run.mode = 'play';
    let acted = false;
    while (acc >= STEP) {
      stepRun(run, { ...snap, hook: snap.hook && !acted, cut: snap.cut && !acted }, STEP);
      if (snap.hook || snap.cut) acted = true;
      acc -= STEP;
    }
    if (run.justHook) playHook();
    if (run.justCut) playCut();
    if (run.justDeliver) playDeliver();
    if (run.justLost) playLoss();
    if (run.mode === 'play') stepScore();
    paint(ctx, run);
    paintStatus();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
