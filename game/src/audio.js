let ctx = null;
let muted = false;
let nextNote = 0;
const SONG = [294, 349, 440, 392, 349, 330, 294, 262];

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

export function playBell() {
  const audio = context();
  const now = audio.currentTime;
  tone(784, now, 0.35, 'sine', 0.08);
  tone(1175, now, 0.45, 'triangle', 0.04);
}

export function playSave() {
  const audio = context();
  tone(660, audio.currentTime, 0.12, 'sine', 0.05);
}

export function playLoss() {
  const audio = context();
  tone(140, audio.currentTime, 0.2, 'sawtooth', 0.03);
}

export function stepScore() {
  if (muted || !ctx) return;
  const now = ctx.currentTime;
  if (now < nextNote) return;
  const note = SONG[Math.floor(now / 0.45) % SONG.length];
  tone(note, now, 0.3, 'sine', 0.02);
  nextNote = now + 0.45;
}
