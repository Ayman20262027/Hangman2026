/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound synthesizer
// Zero external audio files, instant response, zero latency.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Read persisted mute preference
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('hangman_muted');
        if (saved !== null) {
          this.muted = saved === 'true';
        }
      } catch {
        // ignore
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('hangman_muted', String(this.muted));
    } catch {
      // ignore
    }
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    try {
      localStorage.setItem('hangman_muted', String(mute));
    } catch {
      // ignore
    }
  }

  // Tactile typewriter / wood click for keyboard typing
  public playKeyClick(letterIndex: number = 0) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Subtle pitch variation depending on letter
    const baseFreq = 420 + (letterIndex % 7) * 25;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Bright harmonious chime for correct guesses, scales up with combo streak
  public playCorrectLetter(combo: number = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    const note = baseNotes[Math.min(combo - 1, baseNotes.length - 1)];

    // Fundamental chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(note * 1.5, t); // perfect fifth overtone

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  // Ominous heavy wood thud & rope creak for wrong guesses
  public playWrongLetter(mistakesLeft: number = 5) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Low hollow impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const pitch = Math.max(70, 110 - (6 - mistakesLeft) * 8);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch * 1.8, t);
    osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);

    // 2. Creaking rope friction noise burst
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.12, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
  }

  // Mystical ethereal shimmer when revealing a hint
  public playHintReveal() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const arpeggio = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6

    arpeggio.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  // Triumphant victory fanfare with sparkling chords
  public playVictory() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: 0.0, dur: 0.12 }, // C5
      { f: 659.25, time: 0.12, dur: 0.12 }, // E5
      { f: 783.99, time: 0.24, dur: 0.15 }, // G5
      { f: 1046.5, time: 0.40, dur: 0.55 }, // C6
      { f: 1318.51, time: 0.42, dur: 0.55 }, // E6 harmony
    ];

    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.time);

      gain.gain.setValueAtTime(0.18, t + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.05);
    });
  }

  // Tragic descending doom chord and resonant rumble for game over
  public playGameOver() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { f: 220.0, delay: 0.0 }, // A3
      { f: 174.61, delay: 0.15 }, // F3
      { f: 146.83, delay: 0.32 }, // D3
      { f: 110.0, delay: 0.5 }, // A2 deep drone
    ];

    chords.forEach((c) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(c.f, t + c.delay);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t + c.delay);
      filter.frequency.exponentialRampToValueAtTime(120, t + c.delay + 0.8);

      gain.gain.setValueAtTime(0.15, t + c.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.delay + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + c.delay);
      osc.stop(t + c.delay + 0.95);
    });
  }

  // Subtle clean UI button click
  public playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.02);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const soundEngine = new SoundEngine();
