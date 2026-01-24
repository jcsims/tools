import type { DrumInstrument } from './types';

let audioContext: AudioContext | null = null;

// Cached noise buffers to avoid creating new buffers on every sound
const noiseBufferCache: Map<number, AudioBuffer> = new Map();

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
      // Clear cache when context is recreated
      noiseBufferCache.clear();
    } catch (e) {
      console.error('Failed to create AudioContext:', e);
      return null;
    }
  }
  return audioContext;
}

/**
 * Get or create a noise buffer of the specified duration.
 * Buffers are cached and reused to reduce GC pressure.
 */
function getNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  // Round duration to avoid too many cache entries
  const durationMs = Math.round(duration * 1000);

  let buffer = noiseBufferCache.get(durationMs);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const noiseData = buffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    noiseBufferCache.set(durationMs, buffer);
  }
  return buffer;
}

// Synthesize drum sounds using Web Audio API
export function playDrumSound(instrument: DrumInstrument): void {
  if (instrument === 'rest') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (instrument) {
    case 'kick':
      playKick(ctx, now);
      break;
    case 'snare':
      playSnare(ctx, now);
      break;
    case 'hihat':
      playHiHat(ctx, now, false);
      break;
    case 'hihat-open':
      playHiHat(ctx, now, true);
      break;
    case 'crash':
      playCymbal(ctx, now, 'crash');
      break;
    case 'ride':
      playCymbal(ctx, now, 'ride');
      break;
    case 'high-tom':
      playTom(ctx, now, 200);
      break;
    case 'mid-tom':
      playTom(ctx, now, 150);
      break;
    case 'floor-tom':
      playTom(ctx, now, 100);
      break;
    case 'practice-pad':
      playPracticePad(ctx, now);
      break;
  }
}

function playKick(ctx: AudioContext, time: number): void {
  // Oscillator for the body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

  oscGain.gain.setValueAtTime(1, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.3);

  // Click for attack
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();

  click.type = 'triangle';
  click.frequency.setValueAtTime(800, time);
  click.frequency.exponentialRampToValueAtTime(100, time + 0.02);

  clickGain.gain.setValueAtTime(0.5, time);
  clickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);

  click.connect(clickGain);
  clickGain.connect(ctx.destination);

  click.start(time);
  click.stop(time + 0.02);
}

function playSnare(ctx: AudioContext, time: number): void {
  // Noise for the snare wires
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx, 0.2);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.5, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.2);

  // Oscillator for the body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);

  oscGain.gain.setValueAtTime(0.7, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.1);
}

function playHiHat(ctx: AudioContext, time: number, open: boolean): void {
  const duration = open ? 0.3 : 0.08;

  // Noise
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx, duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + duration);
}

function playCymbal(ctx: AudioContext, time: number, type: 'crash' | 'ride'): void {
  const duration = type === 'crash' ? 1.5 : 0.5;
  const filterFreq = type === 'crash' ? 3000 : 5000;

  // Noise
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx, duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + duration);
}

function playTom(ctx: AudioContext, time: number, freq: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.5, time);
  osc.frequency.exponentialRampToValueAtTime(freq, time + 0.1);

  gain.gain.setValueAtTime(0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.3);
}

function playPracticePad(ctx: AudioContext, time: number): void {
  // Short, dry "tick" sound simulating stick on rubber pad
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(400, time);
  osc.frequency.exponentialRampToValueAtTime(200, time + 0.02);

  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

// Resume audio context if suspended (needed for browser autoplay policies)
export async function resumeAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
}
