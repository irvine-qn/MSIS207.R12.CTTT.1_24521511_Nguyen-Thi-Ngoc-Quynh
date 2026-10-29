/** Frequency-bin counts the user can pick from (fftSize = bins × 2). */
export const FFT_BIN_OPTIONS = [256, 512] as const;
export const DEFAULT_FFT_BINS: (typeof FFT_BIN_OPTIONS)[number] = 256;

export const VISUALIZER_DEFAULTS = {
  barWidth: 4,
  barGap: 2,
  colorTheme: "#a78bfa",
} as const;

/** How fast visualizer bars fall after a peak (0–1, higher = slower). */
export const BAR_DECAY = 0.85;
/** Upper limit for the rounded corners on top of each bar, in px. */
export const BAR_MAX_RADIUS = 3;

/** How often the progress bar reads the playhead. */
export const PLAYHEAD_POLL_MS = 250;

/** Decoded audio is far larger than the file on disk, so only the most recent few are kept. */
export const BUFFER_CACHE_LIMIT = 2;

/** Finished queue entries (ready / cancelled / error) disappear after this delay. */
export const QUEUE_ENTRY_TTL_MS = 5000;

/** Local media folders under /public. */
export const MEDIA_PATHS = {
  audioDir: "/audio/mock",
  audioExt: "wav",
  coverDir: "/images/covers",
  coverExt: "svg",
  coverFallback: "/images/covers/placeholder.svg",
} as const;
