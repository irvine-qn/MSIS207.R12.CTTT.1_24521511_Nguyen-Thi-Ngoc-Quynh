"use client";

import { useEffect, useRef, type RefObject } from "react";
import { BAR_DECAY, BAR_MAX_RADIUS } from "@/config/audio";
import type { VisualizerConfig } from "@/types/audio";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  config: VisualizerConfig;
  isPlaying: boolean;
  className?: string;
  ariaLabel?: string;
}

function stopLoop(frameIdRef: RefObject<number | null>): void {
  if (frameIdRef.current !== null) {
    cancelAnimationFrame(frameIdRef.current);
    frameIdRef.current = null;
  }
}

export default function AudioVisualizer({
  analyser,
  config,
  isPlaying,
  className,
  ariaLabel = "Biểu đồ tần số âm thanh",
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef(analyser);
  const configRef = useRef(config);
  const animationFrameIdRef = useRef<number | null>(null);
  const drawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    analyserRef.current = analyser;
    configRef.current = config;
  }, [analyser, config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");
    if (!canvas || !canvasCtx) return;

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
      canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gradient = null;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let data = new Uint8Array(0);
    let smoothed = new Float32Array(0);

    const draw = () => {
      animationFrameIdRef.current = requestAnimationFrame(draw);
      canvasCtx.clearRect(0, 0, width, height);

      const node = analyserRef.current;
      if (!node) return;

      // fftBins is applied by AudioEngine; the buffer follows the node's bin count.
      const { barWidth, barGap, colorTheme } = configRef.current;
      if (data.length !== node.frequencyBinCount) {
        data = new Uint8Array(node.frequencyBinCount);
      }
      node.getByteFrequencyData(data);

      const step = barWidth + barGap;
      const barCount = Math.max(1, Math.floor(width / step));
      if (smoothed.length !== barCount) smoothed = new Float32Array(barCount);

      if (!gradient || gradientColor !== colorTheme) {
        gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, colorTheme);
        // Fade the bar tips when the color is #rrggbb; other formats stay solid.
        const isHex = /^#[0-9a-f]{6}$/i.test(colorTheme);
        gradient.addColorStop(1, isHex ? `${colorTheme}55` : colorTheme);
        gradientColor = colorTheme;
      }
      canvasCtx.fillStyle = gradient;

      const binsPerBar = data.length / barCount;
      const radius = Math.min(barWidth / 2, BAR_MAX_RADIUS);
      canvasCtx.beginPath();
      for (let i = 0; i < barCount; i++) {
        const start = Math.floor(i * binsPerBar);
        const end = Math.max(start + 1, Math.floor((i + 1) * binsPerBar));
        let sum = 0;
        for (let b = start; b < end; b++) sum += data[b] ?? 0;
        const target = sum / (end - start) / 255;

        const prev = smoothed[i] ?? 0;
        const value =
          target > prev ? target : prev * BAR_DECAY + target * (1 - BAR_DECAY);
        smoothed[i] = value;

        const h = Math.max(1, value * height);
        canvasCtx.roundRect(i * step, height - h, barWidth, h, [radius, radius, 0, 0]);
      }
      canvasCtx.fill();
    };
    drawRef.current = draw;

    return () => {
      stopLoop(animationFrameIdRef);
      drawRef.current = null;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !drawRef.current) return;
    drawRef.current();
    return () => stopLoop(animationFrameIdRef);
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      className={className ?? "h-40 w-full rounded-lg bg-zinc-950"}
    />
  );
}
