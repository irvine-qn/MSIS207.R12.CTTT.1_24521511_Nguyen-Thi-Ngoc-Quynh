import type { AudioTask } from "@/types/audio";

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeController: AbortController | null = null;

  constructor(private readonly audioContext: BaseAudioContext) {}

  enqueue(trackUrl: string): Promise<AudioBuffer> {
    return new Promise<AudioBuffer>((resolve, reject) => {
      this.queue.push({
        trackUrl,
        controller: new AbortController(),
        resolve,
        reject,
      });
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
    try {
      const response = await fetch(task.trackUrl, { signal });
      if (!response.ok) {
        throw new Error(
          `Failed to load ${task.trackUrl}: HTTP ${response.status}`,
        );
      }
      data = await response.arrayBuffer();
      signal.throwIfAborted();
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
