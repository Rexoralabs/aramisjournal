/**
 * Premium sound effects system using Web Audio API
 * Synthesizes minimal, luxury tones without external files
 */

export type SoundEffect = 'send' | 'receive' | 'success' | 'click' | 'swoosh' | 'chime';

interface ToneConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  fadeOut?: number;
}

const toneConfigs: Record<Exclude<SoundEffect, 'chime'>, ToneConfig> = {
  send: { frequency: 880, duration: 0.08, type: 'sine', gain: 0.15, fadeOut: 0.05 },
  receive: { frequency: 660, duration: 0.12, type: 'sine', gain: 0.12, fadeOut: 0.08 },
  success: { frequency: 523, duration: 0.15, type: 'sine', gain: 0.1, fadeOut: 0.1 },
  click: { frequency: 1200, duration: 0.03, type: 'sine', gain: 0.08 },
  swoosh: { frequency: 400, duration: 0.12, type: 'sine', gain: 0.08, fadeOut: 0.1 },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.audioContext;
  }

  play(effect: SoundEffect): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    if (effect === 'chime') {
      this.playChime(ctx);
      return;
    }

    const config = toneConfigs[effect];
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.gain, ctx.currentTime + 0.01);

    const fadeStart = config.duration - (config.fadeOut || 0.02);
    gainNode.gain.setValueAtTime(config.gain, ctx.currentTime + fadeStart);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  /** Ambient chime: overlapping C5 + G5 with gentle decay */
  private playChime(ctx: AudioContext): void {
    const notes = [523.25, 783.99]; // C5, G5
    const duration = 1.2;
    const gain = 0.08;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const delay = i * 0.15;
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
  }

  toggle(value: boolean): void {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();