/** fftSize 512 gives 256 frequency bins. */
const FFT_SIZE = 512;

/**
 * Owns the single AudioContext and AnalyserNode for the app and wires
 * playback as: SourceNode -> AnalyserNode -> Destination.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;

  private constructor() {}

  static getInstance(): AudioEngine {
    AudioEngine.instance ??= new AudioEngine();
    return AudioEngine.instance;
  }

  /**
   * Created lazily: browsers only allow an AudioContext to start after a
   * user gesture, and `window` does not exist during server rendering.
   */
  getContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = FFT_SIZE;
      this.analyser.connect(this.context.destination);
    }
    return this.context;
  }

  getAnalyser(): AnalyserNode {
    this.getContext();
    return this.analyser!;
  }

  /** Number of frequency bins (fftSize / 2). */
  get binCount(): number {
    return this.getAnalyser().frequencyBinCount;
  }

  /** Fills `target` with the current frequency data (0–255 per bin). */
  getFrequencyData(target: Uint8Array<ArrayBuffer>): void {
    this.analyser?.getByteFrequencyData(target);
  }

  /**
   * Plays a decoded buffer from `offset` seconds, replacing whatever is
   * playing. Resolves `onEnded` only when the track finishes on its own.
   */
  async play(buffer: AudioBuffer, offset = 0, onEnded?: () => void): Promise<void> {
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
  }

  async pause(): Promise<void> {
    await this.context?.suspend();
  }

  async resume(): Promise<void> {
    await this.context?.resume();
  }

  /** Stops the current source and detaches it so it can be garbage-collected. */
  stopAndClean(): void {
    const source = this.source;
    if (!source) return;
    this.source = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // Already stopped.
    }
    source.disconnect();
    source.buffer = null;
  }

  /** Releases everything, including the AudioContext itself. */
  async dispose(): Promise<void> {
    this.stopAndClean();
    this.analyser?.disconnect();
    this.analyser = null;
    await this.context?.close();
    this.context = null;
    AudioEngine.instance = null;
  }
}
