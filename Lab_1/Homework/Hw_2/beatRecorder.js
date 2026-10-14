class BeatRecorder {
  constructor() {
    this.queue = [];
    this.isRecording = false;
  }

  startRecording() {
    this.clear();
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
  }

  /**
   * Adds a sound event to the FIFO queue while recording.
   * @param {string} soundId
   * @returns {{ soundId: string, timestamp: number } | null}
   */
  recordEvent(soundId) {
    if (!this.isRecording || typeof soundId !== "string" || !soundId.trim()) {
      return null;
    }

    const event = {
      soundId,
      timestamp: performance.now(),
    };

    this.queue.push(event);
    return { ...event };
  }

  /**
   * Removes and returns the oldest event in the queue.
   * @returns {{ soundId: string, timestamp: number } | null}
   */
  consumeEvent() {
    const event = this.queue.shift();
    return event ? { ...event } : null;
  }

  /**
   * Returns a snapshot without exposing the recorder's internal queue.
   * @returns {{ soundId: string, timestamp: number }[]}
   */
  getEvents() {
    return this.queue.map((event) => ({ ...event }));
  }

  clear() {
    this.queue.length = 0;
    this.isRecording = false;
  }
}

export const beatRecorder = new BeatRecorder();
