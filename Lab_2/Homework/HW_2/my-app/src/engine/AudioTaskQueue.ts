import type { AudioTask } from "@/types/audio";

export type TaskPhase = "downloading" | "decoding";
export type PhaseListener = (phase: TaskPhase) => void;

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeController: AbortController | null = null;
  private phaseListeners = new WeakMap<AudioTask, PhaseListener>();

  constructor(private readonly audioContext: BaseAudioContext) {}

  get processing(): boolean {
    return this.isProcessing;
  }

  enqueue(trackUrl: string, onPhase?: PhaseListener): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      const task: AudioTask = {
        trackUrl,
        controller: new AbortController(),
        resolve,
        reject,
      };
      if (onPhase) this.phaseListeners.set(task, onPhase);
      this.queue.push(task);
      void this.processNext();
    });
  }

  cancelCurrentTask(): void {
    this.activeController?.abort();
    this.activeController = null;
  }

  clearQueue(): void {
    const pending = this.queue;
    this.queue = [];
    this.cancelCurrentTask();
    for (const task of pending) {
      task.controller.abort();
      task.reject(new DOMException("Task was cleared", "AbortError"));
    }
    pending.length = 0;
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    let task: AudioTask | null = this.queue.shift() ?? null;
    if (!task) return;

    this.isProcessing = true;
    this.activeController = task.controller;
    const { signal } = task.controller;
    let data: ArrayBuffer | null = null;
    const onPhase = this.phaseListeners.get(task);
    try {
      onPhase?.("downloading");
      const response = await fetch(task.trackUrl, { signal });
      if (!response.ok) {
        throw new Error(
          `Failed to load ${task.trackUrl}: HTTP ${response.status}`,
        );
      }
      data = await response.arrayBuffer();
      signal.throwIfAborted();
      onPhase?.("decoding");
      const buffer = await this.audioContext.decodeAudioData(data);
      signal.throwIfAborted();
      task.resolve(buffer);
    } catch (err) {
      task.reject(err);
    } finally {
      data = null;
      task = null;
      this.activeController = null;
      this.isProcessing = false;
      void this.processNext();
    }
  }
}
