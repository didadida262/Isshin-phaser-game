export class Sfx {
  private ctx: AudioContext | null = null;

  private audio(): AudioContext | null {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      return null;
    }
    if (!this.ctx) {
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  tone(freq: number, duration = 0.08, type: OscillatorType = 'square', volume = 0.04, slide = 0): void {
    const ctx = this.audio();
    if (!ctx) {
      return;
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== 0) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  slash(): void {
    this.tone(420, 0.09, 'square', 0.05, -180);
  }

  fire(): void {
    this.tone(220, 0.16, 'sawtooth', 0.045, 320);
  }

  jump(): void {
    this.tone(280, 0.1, 'triangle', 0.04, 140);
  }

  hit(): void {
    this.tone(140, 0.12, 'square', 0.05, -80);
  }

  hurt(): void {
    this.tone(90, 0.18, 'sawtooth', 0.05, -40);
  }

  pickup(): void {
    this.tone(660, 0.08, 'sine', 0.04, 200);
  }

  win(): void {
    this.tone(523, 0.12, 'triangle', 0.05);
    window.setTimeout(() => this.tone(659, 0.12, 'triangle', 0.05), 110);
    window.setTimeout(() => this.tone(784, 0.22, 'triangle', 0.05), 220);
  }
}

export const sfx = new Sfx();
