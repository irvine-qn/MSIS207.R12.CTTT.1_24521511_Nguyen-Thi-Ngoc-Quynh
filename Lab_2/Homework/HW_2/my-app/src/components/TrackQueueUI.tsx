"use client";

import { useEffect, useRef, useState } from "react";
import { QUEUE_ENTRY_TTL_MS } from "@/config/audio";
import type { AudioTaskQueue } from "@/engine/AudioTaskQueue";
import type { TrackMetadata } from "@/types/audio";

type EntryStatus =
  | "queued"
  | "downloading"
  | "decoding"
  | "ready"
  | "cancelled"
  | "error";

interface QueueEntry {
  key: number;
  track: TrackMetadata;
  status: EntryStatus;
}

interface TrackQueueUIProps {
  tracks: TrackMetadata[];
  /** Created lazily so the AudioContext starts after a user gesture. */
  getQueue: () => AudioTaskQueue;
  onReady?: (track: TrackMetadata, buffer: AudioBuffer) => void;
}

const STATUS_STYLES: Record<EntryStatus, { label: string; className: string }> =
  {
    queued: { label: "Queued", className: "bg-zinc-700 text-zinc-200" },
    downloading: {
      label: "Downloading",
      className: "bg-sky-500/20 text-sky-300",
    },
    decoding: {
      label: "Decoding",
      className: "bg-amber-500/20 text-amber-300",
    },
    ready: { label: "Ready", className: "bg-emerald-500/20 text-emerald-300" },
    cancelled: { label: "Cancelled", className: "bg-zinc-800 text-zinc-500" },
    error: { label: "Error", className: "bg-red-500/20 text-red-300" },
  };

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

let nextKey = 0;

export default function TrackQueueUI({
  tracks,
  getQueue,
  onReady,
}: TrackQueueUIProps) {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [selectedId, setSelectedId] = useState(tracks[0]?.id ?? "");
  const removalTimersRef = useRef(new Set<number>());

  useEffect(() => {
    const timers = removalTimersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, []);

  const isProcessing = entries.some(
    (e) => e.status === "downloading" || e.status === "decoding",
  );

  function setStatus(key: number, status: EntryStatus): void {
    setEntries((prev) =>
      prev.map((e) => (e.key === key ? { ...e, status } : e)),
    );
  }

  /** Marks an entry as done and removes it from the list after a short delay. */
  function finishEntry(key: number, status: EntryStatus): void {
    setStatus(key, status);
    const timerId = window.setTimeout(() => {
      removalTimersRef.current.delete(timerId);
      setEntries((prev) => prev.filter((e) => e.key !== key));
    }, QUEUE_ENTRY_TTL_MS);
    removalTimersRef.current.add(timerId);
  }

  function enqueueTrack(): void {
    const track = tracks.find((t) => t.id === selectedId);
    if (!track) return;
    const key = nextKey++;
    setEntries((prev) => [...prev, { key, track, status: "queued" }]);

    getQueue()
      .enqueue(track.url, (phase) => setStatus(key, phase))
      .then((buffer) => {
        finishEntry(key, "ready");
        onReady?.(track, buffer);
      })
      .catch((err: unknown) =>
        finishEntry(key, isAbortError(err) ? "cancelled" : "error"),
      );
  }

  function clearAll(): void {
    getQueue().clearQueue();
    setEntries([]);
  }

  return (
    <section
      aria-label="Hàng đợi tải nhạc"
      className="w-full max-w-3xl rounded-2xl bg-zinc-900 p-6 text-zinc-100 shadow-xl"
    >
      <header className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Track Queue (FIFO)</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isProcessing
              ? "bg-sky-500/20 text-sky-300"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {isProcessing ? "Processing" : "Idle"}
        </span>
      </header>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="Chọn bài hát"
          className="min-w-0 flex-1 rounded-lg bg-zinc-800 px-3 py-2"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} — {t.artist}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={enqueueTrack}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-emerald-400"
        >
          Enqueue Track
        </button>
        <button
          type="button"
          onClick={() => getQueue().cancelCurrentTask()}
          disabled={!isProcessing}
          className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700 disabled:opacity-40"
        >
          Cancel Current Task
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={entries.length === 0}
          className="rounded-lg bg-red-500/80 px-4 py-2 hover:bg-red-500 disabled:opacity-40"
        >
          Clear All
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 text-center text-sm text-zinc-500">
          Hàng đợi trống.
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-zinc-800">
          {entries.map((entry, i) => {
            const style = STATUS_STYLES[entry.status];
            return (
              <li
                key={entry.key}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="min-w-0 truncate">
                  <span className="mr-2 text-zinc-500 tabular-nums">
                    {i + 1}.
                  </span>
                  {entry.track.title}
                  <span className="text-zinc-400"> — {entry.track.artist}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}
                >
                  {style.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
