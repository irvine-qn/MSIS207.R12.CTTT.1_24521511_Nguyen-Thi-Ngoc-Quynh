"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AudioVisualizer from "@/components/AudioVisualizer";
import CoverImage from "@/components/CoverImage";
import TrackQueueUI from "@/components/TrackQueueUI";
import {
  BUFFER_CACHE_LIMIT,
  DEFAULT_FFT_BINS,
  FFT_BIN_OPTIONS,
  PLAYHEAD_POLL_MS,
  VISUALIZER_DEFAULTS,
} from "@/config/audio";
import { mockTracks } from "@/data/mockTracks";
import { AudioEngine } from "@/engine/AudioEngine";
import { AudioTaskQueue } from "@/engine/AudioTaskQueue";
import type { FftBins, TrackMetadata, VisualizerConfig } from "@/types/audio";

type PlayerStatus = "idle" | "loading" | "playing" | "paused";

const PLAYER_STATUS_LABEL: Record<PlayerStatus, string> = {
  idle: "Idle",
  loading: "Loading",
  playing: "Playing",
  paused: "Paused",
};

const PLAYER_STATUS_STYLE: Record<PlayerStatus, string> = {
  idle: "bg-zinc-800 text-zinc-400",
  loading: "bg-sky-500/20 text-sky-300",
  playing: "bg-violet-500/20 text-violet-300",
  paused: "bg-zinc-800 text-zinc-300",
};

function formatTime(seconds: number | undefined): string {
  if (seconds === undefined) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export default function SonicFlowPage() {
  const tracks = mockTracks;

  const engineRef = useRef<AudioEngine | null>(null);
  const queueRef = useRef<AudioTaskQueue | null>(null);
  const bufferCacheRef = useRef(new Map<string, AudioBuffer>());
  // Bumped on every track request so slow, outdated loads never start playing.
  const playRequestIdRef = useRef(0);
  const pendingTrackUrlRef = useRef<string | null>(null);

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fftBins, setFftBins] = useState<FftBins>(DEFAULT_FFT_BINS);

  const visualizerConfig = useMemo<VisualizerConfig>(
    () => ({ fftBins, ...VISUALIZER_DEFAULTS }),
    [fftBins],
  );

  const currentTrack = tracks[currentIndex];
  const currentDuration = currentTrack ? trackDurations[currentTrack.id] : undefined;

  // The AudioContext may only start after a user gesture, so create it on demand.
  function getEngine(): AudioEngine {
    if (!engineRef.current) {
      engineRef.current = AudioEngine.getInstance();
      engineRef.current.setFftBins(fftBins);
      setAnalyser(engineRef.current.getAnalyser());
    }
    return engineRef.current;
  }

  function getQueue(): AudioTaskQueue {
    queueRef.current ??= new AudioTaskQueue(getEngine().getContext());
    return queueRef.current;
  }

  function rememberBuffer(track: TrackMetadata, buffer: AudioBuffer): void {
    setTrackDurations((prev) => ({ ...prev, [track.id]: buffer.duration }));

    const cache = bufferCacheRef.current;
    cache.delete(track.id);
    cache.set(track.id, buffer);
    while (cache.size > BUFFER_CACHE_LIMIT) {
      const oldestId = cache.keys().next().value;
      if (oldestId === undefined) break;
      cache.delete(oldestId);
    }
  }

  async function playTrackAt(index: number): Promise<void> {
    const track = tracks[index];
    if (!track) return;
    const requestId = ++playRequestIdRef.current;
    const engine = getEngine();
    const queue = getQueue();

    setCurrentIndex(index);
    setElapsedSeconds(0);
    setErrorMessage(null);

    // Only the previous playlist request is dropped; tracks queued by hand stay.
    if (pendingTrackUrlRef.current && pendingTrackUrlRef.current !== track.url) {
      queue.cancelTask(pendingTrackUrlRef.current);
    }

    try {
      let buffer = bufferCacheRef.current.get(track.id);
      if (!buffer) {
        engine.stopAndClean();
        setPlayerStatus("loading");
        pendingTrackUrlRef.current = track.url;
        buffer = await queue.enqueue(track.url);
        rememberBuffer(track, buffer);
      }
      if (requestId !== playRequestIdRef.current) return;
      pendingTrackUrlRef.current = null;

      await engine.play(buffer, 0, () => {
        void playTrackAt((index + 1) % tracks.length);
      });
      setPlayerStatus("playing");
    } catch (err) {
      if (isAbortError(err) || requestId !== playRequestIdRef.current) return;
      pendingTrackUrlRef.current = null;
      setPlayerStatus("idle");
      setErrorMessage(
        `Không phát được "${track.title}". Kiểm tra file ${track.url} trong thư mục public.`,
      );
    }
  }

  async function togglePlayback(): Promise<void> {
    const engine = getEngine();
    if (playerStatus === "playing") {
      await engine.pause();
      setPlayerStatus("paused");
    } else if (playerStatus === "paused") {
      await engine.resume();
      setPlayerStatus("playing");
    } else if (playerStatus === "idle") {
      await playTrackAt(currentIndex);
    }
  }

  function changeFftBins(bins: FftBins): void {
    setFftBins(bins);
    engineRef.current?.setFftBins(bins);
  }

  function handleQueuedTrackReady(track: TrackMetadata, buffer: AudioBuffer): void {
    rememberBuffer(track, buffer);
    if (!engineRef.current?.isActive) {
      void playTrackAt(tracks.findIndex((t) => t.id === track.id));
    }
  }

  // The progress bar only needs a few updates per second; the visualizer has its own rAF loop.
  useEffect(() => {
    if (playerStatus !== "playing") return;
    const intervalId = window.setInterval(() => {
      setElapsedSeconds(engineRef.current?.getCurrentTime() ?? 0);
    }, PLAYHEAD_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [playerStatus]);

  useEffect(() => {
    const bufferCache = bufferCacheRef.current;
    const queueHolder = queueRef;
    const engineHolder = engineRef;
    return () => {
      queueHolder.current?.clearQueue();
      void engineHolder.current?.dispose();
      bufferCache.clear();
    };
  }, []);

  if (!currentTrack) return null;

  const isPlaying = playerStatus === "playing";
  const progressPercent = currentDuration
    ? Math.min(100, (elapsedSeconds / currentDuration) * 100)
    : 0;
  const stepTrack = (offset: number) =>
    void playTrackAt((currentIndex + offset + tracks.length) % tracks.length);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header>
          <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            SonicFlow
          </h1>
          <p className="text-sm text-zinc-400">Real-time audio visualizer</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section
            aria-label="Now playing"
            className="rounded-3xl bg-zinc-900/70 p-6 ring-1 ring-white/10 backdrop-blur"
          >
            <div className="flex items-center gap-5">
              <CoverImage
                src={currentTrack.coverUrl}
                alt={`Ảnh bìa ${currentTrack.title}`}
                className={`h-28 w-28 rounded-2xl object-cover shadow-lg shadow-violet-900/40 transition-transform duration-500 ${
                  isPlaying ? "scale-100" : "scale-95"
                }`}
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAYER_STATUS_STYLE[playerStatus]}`}
                >
                  {PLAYER_STATUS_LABEL[playerStatus]}
                </span>
                <h2 className="mt-2 truncate text-2xl font-bold">{currentTrack.title}</h2>
                <p className="truncate text-zinc-400">{currentTrack.artist}</p>
              </div>
            </div>

            <AudioVisualizer
              analyser={analyser}
              config={visualizerConfig}
              isPlaying={isPlaying}
              className="mt-6 h-56 w-full rounded-2xl bg-black/40"
            />

            <div className="mt-5">
              <div
                role="progressbar"
                aria-label="Tiến độ bài hát"
                aria-valuemin={0}
                aria-valuemax={Math.round(currentDuration ?? 0)}
                aria-valuenow={Math.round(elapsedSeconds)}
                className="h-1.5 overflow-hidden rounded-full bg-zinc-800"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-[width] duration-200 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs tabular-nums text-zinc-500">
                <span>{formatTime(elapsedSeconds)}</span>
                <span>{formatTime(currentDuration)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Bài trước"
                  onClick={() => stepTrack(-1)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-lg hover:bg-zinc-700"
                >
                  ⏮
                </button>
                <button
                  type="button"
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                  onClick={() => void togglePlayback()}
                  disabled={playerStatus === "loading"}
                  className="grid h-14 w-14 place-items-center rounded-full bg-violet-500 text-2xl text-white shadow-lg shadow-violet-900/50 transition hover:scale-105 hover:bg-violet-400 disabled:animate-pulse disabled:hover:scale-100"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  type="button"
                  aria-label="Bài tiếp theo"
                  onClick={() => stepTrack(1)}
                  className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-lg hover:bg-zinc-700"
                >
                  ⏭
                </button>
              </div>

              <div
                role="radiogroup"
                aria-label="Số FFT bins"
                className="flex rounded-full bg-zinc-800 p-1 text-sm"
              >
                {FFT_BIN_OPTIONS.map((bins) => (
                  <button
                    key={bins}
                    type="button"
                    role="radio"
                    aria-checked={fftBins === bins}
                    onClick={() => changeFftBins(bins)}
                    className={`rounded-full px-4 py-1.5 transition ${
                      fftBins === bins
                        ? "bg-violet-500 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {bins} bins
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && <p className="mt-4 text-sm text-red-400">{errorMessage}</p>}
          </section>

          <aside
            aria-label="Playlist"
            className="rounded-3xl bg-zinc-900/70 p-4 ring-1 ring-white/10 backdrop-blur"
          >
            <h2 className="px-2 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Playlist
            </h2>
            <ul className="space-y-1">
              {tracks.map((track, index) => {
                const isCurrent = index === currentIndex;
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => void playTrackAt(index)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                        isCurrent ? "bg-violet-500/15 ring-1 ring-violet-500/40" : "hover:bg-white/5"
                      }`}
                    >
                      <CoverImage
                        src={track.coverUrl}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-medium ${isCurrent ? "text-violet-300" : ""}`}
                        >
                          {track.title}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">{track.artist}</span>
                      </span>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {formatTime(trackDurations[track.id])}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

        <TrackQueueUI tracks={tracks} getQueue={getQueue} onReady={handleQueuedTrackReady} />
      </div>
    </main>
  );
}
