let ctx = null;
let muted = false;
let nextNote = 0;
const SONG = [220, 247, 294, 330, 294, 262, 247, 220];

function context() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, when, dur, type, gain) {
  if (muted || !ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, when);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

export function unlockAudio() {
  context();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function playHook() {
  const audio = context();
  tone(180, audio.currentTime, 0.12, 'triangle', 0.06);
}

export function playCut() {
  const audio = context();
  const now = audio.currentTime;
  tone(140, now, 0.08, 'square', 0.04);
  tone(90, now + 0.04, 0.12, 'sawtooth', 0.03);
}

export function playDeliver() {
  const audio = context();
  tone(392, audio.currentTime, 0.16, 'sine', 0.06);
}

export function playLoss() {
  const audio = context();
  tone(110, audio.currentTime, 0.28, 'triangle', 0.07);
}

export function stepScore() {
  const audio = context();
  const now = audio.currentTime;
  if (now < nextNote) return;
  const note = SONG[Math.floor(now) % SONG.length];
  tone(note, now, 0.18, 'sine', 0.025);
  nextNote = now + 0.45;
}
