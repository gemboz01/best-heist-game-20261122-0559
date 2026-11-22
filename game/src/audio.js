// audio.js — tiny WebAudio bleeps, generated, no files. Everything is guarded:
// audio only starts after a user gesture, and a missing AudioContext is fine.

export function createAudio() {
  return { ctx: null, master: null };
}

function ensure(audio) {
  if (audio.ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    audio.ctx = new AC();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.16;
    audio.master.connect(audio.ctx.destination);
    return true;
  } catch {
    return false;
  }
}

function tone(audio, freq, dur, type, when, slideTo) {
  if (!ensure(audio)) return;
  try {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    const t0 = audio.ctx.currentTime + (when || 0);
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(1, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    // Sound is garnish; a failure never stops the game.
  }
}

export function playStep(audio) {
  tone(audio, 190, 0.05, 'triangle', 0);
}

export function playPickup(audio) {
  tone(audio, 660, 0.12, 'sine', 0);
  tone(audio, 990, 0.18, 'sine', 0.09);
}

export function playSpotted(audio) {
  tone(audio, 520, 0.14, 'square', 0, 760);
}

export function playAlarm(audio) {
  tone(audio, 440, 0.22, 'sawtooth', 0, 330);
  tone(audio, 440, 0.22, 'sawtooth', 0.24, 330);
}

export function playSmoke(audio) {
  tone(audio, 300, 0.3, 'sine', 0, 120);
}

export function playEmp(audio) {
  tone(audio, 880, 0.1, 'square', 0, 220);
  tone(audio, 660, 0.14, 'square', 0.08, 180);
}

export function playWin(audio) {
  tone(audio, 523, 0.14, 'sine', 0);
  tone(audio, 659, 0.14, 'sine', 0.12);
  tone(audio, 784, 0.22, 'sine', 0.24);
  tone(audio, 1047, 0.3, 'sine', 0.38);
}

export function playClick(audio) {
  tone(audio, 700, 0.06, 'sine', 0);
}
