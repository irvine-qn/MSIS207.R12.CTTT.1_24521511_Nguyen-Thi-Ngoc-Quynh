"use client";

import { useEffect, useRef, useState } from "react";
import type { TrackMetadata, VisualizerConfig } from "@/types/audio";

interface AudioPlayerProps {
  tracks: TrackMetadata[];
  config: VisualizerConfig;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ tracks, config }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  // Set once the user has pressed play, so later track changes autoplay.
  const shouldAutoplayRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const current = tracks[currentIndex];

  // An AudioContext may only start after a user gesture, so build the graph lazily.
  function ensureAudioGraph(): void {
    const audio = audioRef.current;
    if (!audio || ctxRef.current) return;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = config.fftBins;
    ctx.createMediaElementSource(audio).connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
  }

  async function play(): Promise<void> {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioGraph();
    shouldAutoplayRef.current = true;
    try {
      await ctxRef.current?.resume();
      await audio.play();
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không phát được bài hát");
    }
  }

  function togglePlay(): void {
    if (isPlaying) {
      shouldAutoplayRef.current = false;
      audioRef.current?.pause();
    } else {
      void play();
    }
  }

  function selectTrack(index: number): void {
    setCurrentIndex(index);
    setElapsed(0);
  }

  useEffect(() => {
    if (analyserRef.current) analyserRef.current.fftSize = config.fftBins;
  }, [config.fftBins]);

  // Draw the frequency bars every animation frame.
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const g = canvas?.getContext("2d");
      if (!canvas || !g) return;

      g.clearRect(0, 0, canvas.width, canvas.height);
      const analyser = analyserRef.current;
      if (!analyser) return;

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      const step = config.barWidth + config.barGap;
      const barCount = Math.min(data.length, Math.floor(canvas.width / step));
      g.fillStyle = config.colorTheme;
      for (let i = 0; i < barCount; i++) {
        const h = ((data[i] ?? 0) / 255) * canvas.height;
        g.fillRect(i * step, canvas.height - h, config.barWidth, h);
      }
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [config.barWidth, config.barGap, config.colorTheme]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  if (!current) return <p className="text-zinc-400">Không có bài hát nào.</p>;

  return (
    <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 p-6 text-zinc-100 shadow-xl">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.coverUrl}
          alt={`Ảnh bìa ${current.title}`}
          className="h-24 w-24 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">{current.title}</h2>
          <p className="text-zinc-400">{current.artist}</p>
          <p className="mt-1 text-sm tabular-nums text-zinc-400">
            {formatTime(elapsed)} / {formatTime(current.duration)}
          </p>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={640}
        height={160}
        className="mt-6 h-40 w-full rounded-lg bg-zinc-950"
        aria-label="Biểu đồ tần số âm thanh"
      />

      <input
        type="range"
        min={0}
        max={current.duration}
        value={elapsed}
        onChange={(e) => {
          const t = Number(e.target.value);
          if (audioRef.current) audioRef.current.currentTime = t;
          setElapsed(t);
        }}
        className="mt-4 w-full accent-emerald-400"
        aria-label="Vị trí phát"
      />

      <div className="mt-4 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => selectTrack((currentIndex - 1 + tracks.length) % tracks.length)}
          className="rounded-full bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
        >
          ⏮ Trước
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="rounded-full bg-emerald-500 px-6 py-2 font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          {isPlaying ? "⏸ Tạm dừng" : "▶ Phát"}
        </button>
        <button
          type="button"
          onClick={() => selectTrack((currentIndex + 1) % tracks.length)}
          className="rounded-full bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
        >
          Tiếp ⏭
        </button>
      </div>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      <ul className="mt-6 divide-y divide-zinc-800">
        {tracks.map((track, i) => (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => selectTrack(i)}
              className={`flex w-full items-center justify-between px-2 py-2 text-left hover:bg-zinc-800 ${
                i === currentIndex ? "text-emerald-400" : ""
              }`}
            >
              <span>
                {i + 1}. {track.title} — <span className="text-zinc-400">{track.artist}</span>
              </span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatTime(track.duration)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <audio
        ref={audioRef}
        src={current.url}
        crossOrigin="anonymous"
        preload="metadata"
        onLoadedMetadata={() => {
          if (shouldAutoplayRef.current) void play();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onEnded={() => selectTrack((currentIndex + 1) % tracks.length)}
      />
    </div>
  );
}
