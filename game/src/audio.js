// A tiny WebAudio synth: no sound files, just short oscillator notes. Every call is guarded,
// so a browser with no audio (or a muted tab) never breaks the game. M toggles mute.

const COLLECT_BASE = 523.25; // C5; the pitch climbs a semitone per combo step.
const LEVEL_NOTES = [523.25, 659.25, 783.99, 1046.5];

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context !== null) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
      return context;
    } catch {
      return null;
    }
  }

  /** One short note: a sine that fades out over `seconds`. */
  function note(frequency, seconds, gain, when = 0) {
    if (muted) return;
    const audio = ensure();
    if (audio === null) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const start = audio.currentTime + when;
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(envelope).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }

  /** A low thud for a hit: a triangle that drops in pitch. */
  function thud() {
    if (muted) return;
    const audio = ensure();
    if (audio === null) return;
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const start = audio.currentTime;
    const oscillator = audio.createOscillator();
    const envelope = audio.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220, start);
    oscillator.frequency.exponentialRampToValueAtTime(55, start + 0.22);
    envelope.gain.setValueAtTime(0.22, start);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    oscillator.connect(envelope).connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.3);
  }

  return {
    collect(comboStep) {
      const semitones = Math.min(comboStep, 8);
      note(COLLECT_BASE * 2 ** (semitones / 12), 0.18, 0.12);
    },
    hit() {
      thud();
    },
    level() {
      LEVEL_NOTES.forEach((frequency, index) => note(frequency, 0.22, 0.1, index * 0.07));
    },
    nova() {
      note(1046.5, 0.5, 0.1);
      note(1568, 0.5, 0.08, 0.06);
    },
    shield() {
      note(392, 0.25, 0.1);
      note(523.25, 0.25, 0.08, 0.08);
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
  };
}
