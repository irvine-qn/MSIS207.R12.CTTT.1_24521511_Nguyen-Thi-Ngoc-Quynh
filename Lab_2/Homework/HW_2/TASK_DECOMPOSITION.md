
# Requirement Decomposition & System Architecture

**Project:** SonicFlow - Cloud Audio Mastering & Visual Processing Suite
**Assignment:** HW 2: Concurrent FIFO Audio Visualizer Queue Engine
**Focus:** Async Concurrency, Web Audio API, Zero Memory Leaks & High-Performance Canvas Animation

---

## 1. Executive Summary & Application Context

**SonicFlow** is a browser-based audio mastering and visualizer platform designed for music producers and sound engineers. Users can upload or queue multiple high-fidelity audio stems/tracks to be processed, analyzed, and visualized in real time.

The core of the application relies on an industrial-strength **FIFO Audio Queue Engine** that handles concurrent audio downloads, decoding, memory management via cancellation tokens (`AbortController`), and rendering smooth **60fps audio visualizers** without state thrashing.

---

## 2. Project Specification Decomposition

```
                    +-------------------------------------------------------+
                    | HW 2: Concurrent FIFO Audio Visualizer Queue Engine   |
                    +-------------------------------------------------------+
                                                |
        +-------------------+-------------------+-------------------+-------------------+
        |                   |                   |                   |                   |
        v                   v                   v                   v                   v
+---------------+   +---------------+   +---------------+   +---------------+   +---------------+
| Web Audio API |   | Concurrency   |   | Memory Safety |   | Performance   |   | TypeScript    |
| Engine        |   | FIFO Queue    |   | & Cleanup     |   | (60fps Canvas)|   | Contract      |
+---------------+   +---------------+   +---------------+   +---------------+   +---------------+
```

### A. Web Audio API Engine

* **Integration:** Direct integration with Web Audio API (`AudioContext`, `AudioBufferSourceNode`, `AnalyserNode`).
* **Frequency Analysis:** `AnalyserNode` configured with `fftSize = 512` or `1024` yielding **256 or 512 frequency bins** (`frequencyBinCount`).
* **Real-time Processing:** Live extraction of byte frequency data (`getByteFrequencyData`) and time-domain data.

### B. Concurrency Controller (FIFO Task Queue)

* **Sequential Queue Processing:** Queue items (`AudioTask`) are enqueued asynchronously and executed in First-In, First-Out order.
* **Concurrent Pipeline:** Simultaneous track download (`fetch`) and audio buffer decoding (`AudioContext.decodeAudioData`).
* **Promise-Based Execution:** `enqueue(trackUrl: string): Promise<AudioBuffer>` resolves when audio is fully processed and ready for playback.

### C. Memory Safety & Resource Cleanup (Zero Leak Mandate)

* **Node Disconnection:** Explicit cleanup and disconnection of `AudioBufferSourceNode` objects upon track completion or interruption.
* **Cancellation Tokens:** Integration of `AbortController` / `AbortSignal` inside queue tasks to abort pending network downloads immediately when requested or reset.
* **Context Reuse:** Prevention of duplicate `AudioContext` leaks by managing state transitions (`suspended`, `running`, `closed`).

### D. Rendering Performance (60fps Visualizer)

* **Animation Driver:** Driven strictly by `requestAnimationFrame` (rAF).
* **Zero State Thrashing:** Visualizer frame loops bypass React state updates during active playback to prevent re-render overhead. Frequency data is written directly to an HTML5 `<canvas>` or optimized SVG element.

---

## 3. Type System & Contract Alignment

### TypeScript Contract (`audio-queue-controller.ts`)

```typescript
export interface AudioTask {
  trackUrl: string;
  controller: AbortController;
  resolve: (buffer: AudioBuffer) => void;
  reject: (reason: any) => void;
}

export class AudioTaskQueue {
  private queue: AudioTask[] = [];
  private isProcessing = false;
  private activeController: AbortController | null = null;

  async enqueue(trackUrl: string): Promise<AudioBuffer> {
    const controller = new AbortController();
    return new Promise((resolve, reject) => {
      this.queue.push({ trackUrl, controller, resolve, reject });
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const currentTask = this.queue.shift()!;
    this.activeController = currentTask.controller;

    try {
      const response = await fetch(currentTask.trackUrl, {
        signal: currentTask.controller.signal,
      });
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      currentTask.resolve(audioBuffer);
    } catch (error) {
      currentTask.reject(error);
    } finally {
      this.isProcessing = false;
      this.activeController = null;
      this.processNext();
    }
  }

  public cancelCurrentTask(): void {
    if (this.activeController) {
      this.activeController.abort();
      this.activeController = null;
    }
  }
}
```

---

## 4. Architectural & Memory Flow

```
[ Track Requests ] 
        |
        v
+------------------+     push()     +-------------------+
| User Interface   | -------------> | FIFO Queue Array  |
+------------------+                +-------------------+
                                              |
                                       processNext()
                                              |
                                              v
                                    +-------------------+
                                    | AbortController   | (Active Cancellation Token)
                                    +-------------------+
                                              |
                                              v
                                    +-------------------+
                                    | fetch() Download  |
                                    +-------------------+
                                              |
                                              v
                                    +-------------------+
                                    | decodeAudioData() |
                                    +-------------------+
                                              |
                                              v
                                    +-------------------+
                                    | AnalyserNode      | (FFT 256/512 Bins)
                                    +-------------------+
                                              |
                                              v
                                    +-------------------+
                                    | 60fps Canvas Loop | (requestAnimationFrame)
                                    +-------------------+
```

---

## 5. Memory Leak Prevention & Performance Matrix

| Risk Area                  | Potential Failure Mode                                  | Mitigation Strategy in SonicFlow                                                   |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Network Requests** | Stale downloads eating bandwidth                        | Abort fetch via `AbortController.signal` on task cancel.                         |
| **Audio Nodes**      | Accumulation of disconnected `AudioBufferSourceNode`s | Explicit `.stop()`, `.disconnect()`, and garbage collection references.        |
| **Animation Loop**   | Multiple `rAF` loops running concurrently             | Store `requestAnimationFrame` ID; call `cancelAnimationFrame` on unmount/stop. |
| **React Re-renders** | Frame drops (<60fps) due to state changes               | Use mutable `useRef` for frequency data array; mutate canvas context directly.   |
