import type { FFT_BIN_OPTIONS } from "@/config/audio";

export interface AudioTask {
  trackUrl: string;
  controller: AbortController;
  resolve: (buffer: AudioBuffer) => void;
  reject: (reason: unknown) => void;
}

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  url: string;
  /** Seconds. Unknown until the file is decoded, so it is filled in at runtime. */
  duration?: number;
  coverUrl: string;
}

export type FftBins = (typeof FFT_BIN_OPTIONS)[number];

export interface VisualizerConfig {
  fftBins: FftBins;
  barWidth: number;
  barGap: number;
  colorTheme: string;
}
