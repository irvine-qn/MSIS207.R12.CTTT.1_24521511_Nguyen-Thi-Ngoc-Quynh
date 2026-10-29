"use client";

import { useEffect, useRef } from "react";
import type { VisualizerConfig } from "@/types/audio";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  config: VisualizerConfig;
  className?: string;
  ariaLabel?: string;
}

const DECAY = 0.85;

export default function AudioVisualizer({
  analyser,
  config,
  className,
  ariaLabel = "Biểu đồ tần số âm thanh",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef(analyser);
  const configRef = useRef(config);

  useEffect(() => {
    analyserRef.current = analyser;
    configRef.current = config;
  }, [analyser, config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;

    let width = 0;
    let height = 0;
    let gradient: CanvasGradient | null = null;
    let gradientColor = "";

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradient = null;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let data = new Uint8Array(0);
    let smoothed = new Float32Array(0);
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      g.clearRect(0, 0, width, height);

      const node = analyserRef.current;
      if (!node) return;

      const { fftBins, barWidth, barGap, colorTheme } = configRef.current;
      if (node.fftSize !== fftBins) node.fftSize = fftBins;
      if (data.length !== node.frequencyBinCount) {
        data = new Uint8Array(node.frequencyBinCount);
      }
      node.getByteFrequencyData(data);

      const step = barWidth + barGap;
      const barCount = Math.max(1, Math.floor(width / step));
      if (smoothed.length !== barCount) smoothed = new Float32Array(barCount);

      if (!gradient || gradientColor !== colorTheme) {
        gradient = g.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, colorTheme);
        // Fade the bar tips when the color is #rrggbb; other formats stay solid.
        const isHex = /^#[0-9a-f]{6}$/i.test(colorTheme);
        gradient.addColorStop(1, isHex ? `${colorTheme}55` : colorTheme);
        gradientColor = colorTheme;
      }
      g.fillStyle = gradient;

      const binsPerBar = data.length / barCount;
      const radius = Math.min(barWidth / 2, 3);
      g.beginPath();
      for (let i = 0; i < barCount; i++) {
        const start = Math.floor(i * binsPerBar);
        const end = Math.max(start + 1, Math.floor((i + 1) * binsPerBar));
        let sum = 0;
        for (let b = start; b < end; b++) sum += data[b] ?? 0;
        const target = sum / (end - start) / 255;

        const prev = smoothed[i] ?? 0;
        const value =
          target > prev ? target : prev * DECAY + target * (1 - DECAY);
        smoothed[i] = value;

        const h = Math.max(1, value * height);
        g.roundRect(i * step, height - h, barWidth, h, [radius, radius, 0, 0]);
      }
      g.fill();
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={className ?? "h-40 w-full rounded-lg bg-zinc-950"}
    />
  );
}
