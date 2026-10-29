"use client";

import { useState } from "react";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { mockTracks } from "@/data/mockTracks";
import type { FftBins, VisualizerConfig } from "@/types/audio";

export default function Home() {
  const [config, setConfig] = useState<VisualizerConfig>({
    fftBins: 256,
    barWidth: 4,
    barGap: 2,
    colorTheme: "#34d399",
  });

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-zinc-950 p-6">
      <h1 className="text-3xl font-bold text-zinc-100">Audio Visualizer Test</h1>

      <div className="flex flex-wrap items-end gap-4 text-sm text-zinc-300">
        <label className="flex flex-col gap-1">
          FFT Bins
          <select
            value={config.fftBins}
            onChange={(e) =>
              setConfig({ ...config, fftBins: Number(e.target.value) as FftBins })
            }
            className="rounded bg-zinc-800 px-2 py-1"
          >
            <option value={256}>256</option>
            <option value={512}>512</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Bar width: {config.barWidth}px
          <input
            type="range"
            min={1}
            max={12}
            value={config.barWidth}
            onChange={(e) => setConfig({ ...config, barWidth: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1">
          Bar gap: {config.barGap}px
          <input
            type="range"
            min={0}
            max={8}
            value={config.barGap}
            onChange={(e) => setConfig({ ...config, barGap: Number(e.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1">
          Màu
          <input
            type="color"
            value={config.colorTheme}
            onChange={(e) => setConfig({ ...config, colorTheme: e.target.value })}
          />
        </label>
      </div>

      <AudioPlayer tracks={mockTracks} config={config} />
    </main>
  );
}
