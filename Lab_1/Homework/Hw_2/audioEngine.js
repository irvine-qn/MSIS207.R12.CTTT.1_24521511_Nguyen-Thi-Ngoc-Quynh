const SOUND_NAMES = new Set([
  "kick",
  "snare",
  "hihat",
  "clap",
  "openhat",
  "boom",
  "ride",
  "tom",
  "tink",
]);

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.noiseBuffer = null;
  }

  playSound(soundName) {
    if (!SOUND_NAMES.has(soundName)) {
      console.warn(`AudioEngine: Unknown sound "${soundName}".`);
      return false;
    }

    try {
      const context = this.getAudioContext();
      if (context.state === "suspended") {
        context.resume().catch((error) => {
          console.error("AudioEngine: Failed to resume audio playback.", error);
        });
      }

      this.playSoundEffect(context, soundName);
      return true;
    } catch (error) {
      console.error(`AudioEngine: Failed to play sound "${soundName}".`, error);
      return false;
    }
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioContextConstructor =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("This browser does not support the Web Audio API.");
      }

      this.audioContext = new AudioContextConstructor();
    }

    return this.audioContext;
  }

  getNoiseBuffer(context) {
    if (!this.noiseBuffer) {
      const buffer = context.createBuffer(
        1,
        context.sampleRate * 2,
        context.sampleRate,
      );
      const channel = buffer.getChannelData(0);

      for (let index = 0; index < channel.length; index += 1) {
        channel[index] = Math.random() * 2 - 1;
      }

      this.noiseBuffer = buffer;
    }

    return this.noiseBuffer;
  }

  playTone(context, frequency, endFrequency, duration, volume, type = "sine") {
    const startTime = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      startTime + duration,
    );
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  playNoise(context, duration, volume, filterType, frequency, bursts) {
    const startTime = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer(context);
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);

    for (const [offset, peak, burstDuration] of bursts) {
      const burstStart = startTime + offset;
      gain.gain.setValueAtTime(0.0001, burstStart);
      gain.gain.linearRampToValueAtTime(peak * volume, burstStart + 0.004);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        burstStart + burstDuration,
      );
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  playSoundEffect(context, soundName) {
    switch (soundName) {
      case "kick":
        this.playTone(context, 155, 48, 0.42, 0.85);
        this.playNoise(context, 0.025, 0.2, "highpass", 1200, [
          [0, 1, 0.02],
        ]);
        break;
      case "snare":
        this.playTone(context, 190, 105, 0.13, 0.28, "triangle");
        this.playNoise(context, 0.2, 0.58, "bandpass", 1800, [
          [0, 1, 0.18],
        ]);
        break;
      case "hihat":
        this.playNoise(context, 0.12, 0.28, "highpass", 7200, [
          [0, 1, 0.1],
        ]);
        break;
      case "clap":
        this.playNoise(context, 0.24, 0.65, "bandpass", 1400, [
          [0, 1, 0.025],
          [0.035, 0.7, 0.025],
          [0.07, 0.48, 0.14],
        ]);
        break;
      case "openhat":
        this.playNoise(context, 0.48, 0.26, "highpass", 5800, [
          [0, 1, 0.45],
        ]);
        break;
      case "boom":
        this.playTone(context, 92, 34, 0.55, 0.9);
        this.playNoise(context, 0.16, 0.24, "lowpass", 500, [
          [0, 1, 0.14],
        ]);
        break;
      case "ride":
        this.playNoise(context, 0.62, 0.24, "highpass", 6400, [
          [0, 1, 0.58],
        ]);
        this.playTone(context, 3200, 2800, 0.42, 0.035, "square");
        this.playTone(context, 4700, 4100, 0.38, 0.025, "square");
        break;
      case "tom":
        this.playTone(context, 220, 95, 0.3, 0.72, "triangle");
        break;
      case "tink":
        this.playTone(context, 1320, 780, 0.16, 0.32);
        break;
    }
  }
}

export const audioEngine = new AudioEngine();
