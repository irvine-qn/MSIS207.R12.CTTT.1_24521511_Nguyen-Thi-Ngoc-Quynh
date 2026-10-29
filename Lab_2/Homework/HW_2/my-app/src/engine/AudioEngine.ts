import { DEFAULT_FFT_BINS } from "@/config/audio";
import type { FftBins } from "@/types/audio";

/** An AnalyserNode yields fftSize / 2 frequency bins. */
const binsToFftSize = (bins: FftBins): number => bins * 2;

/**
 * Owns the single AudioContext and AnalyserNode for the app and wires
 * playback as: SourceNode -> AnalyserNode -> Destination.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private startOffset = 0;

  private constructor() {}

  get isActive(): boolean {
    return this.source !== null;
  }

  getCurrentTime(): number {
    if (!this.context || !this.source) return 0;
    return this.context.currentTime - this.startedAt + this.startOffset;
  }

  static getInstance(): AudioEngine {
    AudioEngine.instance ??= new AudioEngine();
    return AudioEngine.instance;
  }

  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = binsToFftSize(DEFAULT_FFT_BINS);
      this.analyser.connect(this.context.destination);
    }
    return this.context;
  }

  getAnalyser(): AnalyserNode {
    this.getContext();
    return this.analyser!;
  }

  setFftBins(bins: FftBins): void {
    this.getAnalyser().fftSize = binsToFftSize(bins);
  }

  /** Number of frequency bins (fftSize / 2). */
  get binCount(): number {
    return this.getAnalyser().frequencyBinCount;
  }

  getFrequencyData(target: Uint8Array<ArrayBuffer>): void {
    this.analyser?.getByteFrequencyData(target);
  }

  async play(
    buffer: AudioBuffer,
    offset = 0,
    onEnded?: () => void,
  ): Promise<void> {
    const ctx = this.getContext();
    await ctx.resume();
    this.stopAndClean();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.getAnalyser());
    source.onended = () => {
      // Ignore the event fired by stop() on a source we already replaced.
      if (this.source !== source) return;
      this.stopAndClean();
      onEnded?.();
    };
    source.start(0, offset);
    this.source = source;
    this.startedAt = ctx.currentTime;
    this.startOffset = offset;
  }

  async pause(): Promise<void> {
    await this.context?.suspend();
  }

  async resume(): Promise<void> {
    await this.context?.resume();
  }

  stopAndClean(): void {
    const source = this.source;
    if (!source) return;
    this.source = null;
    source.onended = null;
    try {
      source.stop();
    } catch {}
    source.disconnect();
    source.buffer = null;
  }

  async dispose(): Promise<void> {
    this.stopAndClean();
    this.analyser?.disconnect();
    this.analyser = null;
    await this.context?.close();
    this.context = null;
    AudioEngine.instance = null;
  }
}
