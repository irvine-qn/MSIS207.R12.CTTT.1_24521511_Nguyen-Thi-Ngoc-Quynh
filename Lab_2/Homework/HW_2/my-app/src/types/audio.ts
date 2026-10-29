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
  duration: number;
  coverUrl: string;
}

export type FftBins = 256 | 512;

export interface VisualizerConfig {
  fftBins: FftBins;
  barWidth: number;
  barGap: number;
  colorTheme: string;
}
