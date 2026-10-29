"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AudioVisualizer from "@/components/AudioVisualizer";
import TrackQueueUI from "@/components/TrackQueueUI";
import { mockTracks } from "@/data/mockTracks";
import { AudioEngine } from "@/engine/AudioEngine";
import { AudioTaskQueue } from "@/engine/AudioTaskQueue";
import type { FftBins, TrackMetadata, VisualizerConfig } from "@/types/audio";

type PlayerStatus = "idle" | "loading" | "playing" | "paused";

/** Decoded tracks are large (~100 MB each), so keep only the most recent few. */
const CACHE_LIMIT = 2;

const STATUS_LABEL: Record<PlayerStatus, string> = {
  idle: "Sẵn sàng",
  loading: "Đang tải…",
  playing: "Đang phát",
  paused: "Tạm dừng",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export default function Home() {
  const engineRef = useRef<AudioEngine | null>(null);
  const queueRef = useRef<AudioTaskQueue | null>(null);
  const cacheRef = useRef(new Map<string, AudioBuffer>());
  // Bumped on every track request so slow, outdated loads never start playing.
  const requestIdRef = useRef(0);

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fftBins, setFftBins] = useState<FftBins>(256);

  const config = useMemo<VisualizerConfig>(
    () => ({ fftBins, barWidth: 4, barGap: 2, colorTheme: "#a78bfa" }),
    [fftBins],
  );

  const current = mockTracks[currentIndex];

  // The AudioContext may only start after a user gesture, so create it on demand.
  function getEngine(): AudioEngine {
    if (!engineRef.current) {
      engineRef.current = AudioEngine.getInstance();
      setAnalyser(engineRef.current.getAnalyser());
    }
    return engineRef.current;
  }

  function getQueue(): AudioTaskQueue {
    queueRef.current ??= new AudioTaskQueue(getEngine().getContext());
    return queueRef.current;
  }

  function cacheBuffer(trackId: string, buffer: AudioBuffer): void {
    const cache = cacheRef.current;
    cache.delete(trackId);
    cache.set(trackId, buffer);
    while (cache.size > CACHE_LIMIT) {
      const oldest = cache.keys().next().value;
      if (oldest === undefined) break;
      cache.delete(oldest);
    }
  }

  async function playIndex(index: number): Promise<void> {
    const track = mockTracks[index];
    if (!track) return;
    const requestId = ++requestIdRef.current;
    const engine = getEngine();

    setCurrentIndex(index);
    setElapsed(0);
    setError(null);

    try {
      let buffer = cacheRef.current.get(track.id);
      if (!buffer) {
        // Stop the old track right away and drop any download it no longer needs.
        engine.stopAndClean();
        setStatus("loading");
        getQueue().clearQueue();
        buffer = await getQueue().enqueue(track.url);
        cacheBuffer(track.id, buffer);
      }
      if (requestId !== requestIdRef.current) return;

      await engine.play(buffer, 0, () => {
        void playIndex((index + 1) % mockTracks.length);
      });
      setStatus("playing");
    } catch (err) {
      if (isAbortError(err) || requestId !== requestIdRef.current) return;
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Không phát được bài hát");
    }
  }

  async function togglePlay(): Promise<void> {
    const engine = getEngine();
    if (status === "playing") {
      await engine.pause();
      setStatus("paused");
    } else if (status === "paused") {
      await engine.resume();
      setStatus("playing");
    } else if (status === "idle") {
      await playIndex(currentIndex);
    }
  }

  function handleQueueReady(track: TrackMetadata, buffer: AudioBuffer): void {
    cacheBuffer(track.id, buffer);
    if (!engineRef.current?.isActive) {
      void playIndex(mockTracks.findIndex((t) => t.id === track.id));
    }
  }

  // Poll the playhead a few times per second; the visualizer has its own rAF loop.
  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      setElapsed(engineRef.current?.getCurrentTime() ?? 0);
    }, 250);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      AudioEngine.getInstance().stopAndClean();
      cache.clear();
    };
  }, []);

  if (!current) return null;

  const progress = Math.min(100, (elapsed / current.duration) * 100);
  const isPlaying = status === "playing";

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-violet-300 to-fuchsia-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              SonicFlow
            </h1>
            <p className="text-sm text-zinc-400">Real-time audio visualizer</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section
            aria-label="Đang phát"
            className="rounded-3xl bg-zinc-900/70 p-6 ring-1 ring-white/10 backdrop-blur"
          >
            <div className="flex items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.coverUrl}
                alt={`Ảnh bìa ${current.title}`}
                className={`h-28 w-28 rounded-2xl object-cover shadow-lg shadow-violet-900/40 transition-transform duration-500 ${
                  isPlaying ? "scale-100" : "scale-95"
                }`}
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isPlaying
                      ? "bg-violet-500/20 text-violet-300"
                      : status === "loading"
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </span>
                <h2 className="mt-2 truncate text-2xl font-bold">{current.title}</h2>
                <p className="truncate text-zinc-400">{current.artist}</p>
              </div>
            </div>

            <AudioVisualizer
              analyser={analyser}
              config={config}
              isPlaying={isPlaying}
              className="mt-6 h-56 w-full rounded-2xl bg-black/40"
            />

            <div className="mt-5">
              <div
                role="progressbar"
                aria-label="Tiến độ bài hát"
                aria-valuemin={0}
                aria-valuemax={Math.round(current.duration)}
                aria-valuenow={Math.round(elapsed)}
                className="h-1.5 overflow-hidden rounded-full bg-zinc-800"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-[width] duration-200 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs tabular-nums text-zinc-500">
                <span>{formatTime(elapsed)}</span>
                <span>{formatTime(current.duration)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Bài trước"
                  onClick={() =>
                    void playIndex((currentIndex - 1 + mockTracks.length) % mockTracks.length)
                  }
                  className="grid h-11 w-11 place-items-center rounded-full bg-zinc-800 text-lg hover:bg-zinc-700"
                >
                  ⏮
                </button>
                <button
                  type="button"
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                  onClick={() => void togglePlay()}
                  disabled={status === "loading"}
                  className="grid h-14 w-14 place-items-center rounded-full bg-violet-500 text-2xl text-white shadow-lg shadow-violet-900/50 transition hover:scale-105 hover:bg-violet-400 disabled:animate-pulse disabled:hover:scale-100"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  type="button"
                  aria-label="Bài tiếp theo"
                  onClick={() => void playIndex((currentIndex + 1) % mockTracks.length)}
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
                {([256, 512] as const).map((bins) => (
                  <button
                    key={bins}
                    type="button"
                    role="radio"
                    aria-checked={fftBins === bins}
                    onClick={() => setFftBins(bins)}
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

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </section>

          <aside
            aria-label="Danh sách phát"
            className="rounded-3xl bg-zinc-900/70 p-4 ring-1 ring-white/10 backdrop-blur"
          >
            <h2 className="px-2 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Playlist
            </h2>
            <ul className="space-y-1">
              {mockTracks.map((track, i) => {
                const active = i === currentIndex;
                return (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => void playIndex(i)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                        active ? "bg-violet-500/15 ring-1 ring-violet-500/40" : "hover:bg-white/5"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.coverUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-medium ${active ? "text-violet-300" : ""}`}
                        >
                          {track.title}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">{track.artist}</span>
                      </span>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {formatTime(track.duration)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>

        <TrackQueueUI tracks={mockTracks} getQueue={getQueue} onReady={handleQueueReady} />
      </div>
    </main>
  );
}
