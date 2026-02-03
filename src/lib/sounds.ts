/**
 * Premium sound effects system using Web Audio API
 * Synthesizes minimal, luxury tones without external files
 */

export type SoundEffect = 'send' | 'receive' | 'success' | 'click' | 'swoosh';

interface ToneConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  fadeOut?: number;
}

const toneConfigs: Record<SoundEffect, ToneConfig> = {
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

    // Resume context if suspended (required for autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const config = toneConfigs[effect];
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    // Fade in
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(config.gain, ctx.currentTime + 0.01);

    // Fade out
    const fadeStart = config.duration - (config.fadeOut || 0.02);
    gainNode.gain.setValueAtTime(config.gain, ctx.currentTime + fadeStart);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  }

  toggle(value: boolean): void {
    this.enabled = value;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
