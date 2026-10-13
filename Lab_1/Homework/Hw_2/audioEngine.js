class AudioEngine {
  constructor() {
    this.soundRegistry = new Map();
  }

  /**
   * Registers a sound identifier with its corresponding audio file path.
   * @param {string} soundName - The data-sound identifier (e.g., 'kick', 'snare').
   * @param {string} filePath - Path to the audio asset.
   */
  registerSound(soundName, filePath) {
    const audio = new Audio(filePath);
    audio.preload = "auto";

    // Graceful error handling for missing or unplayable assets
    audio.onerror = () => {
      console.warn(
        `AudioEngine: Failed to load asset for sound "${soundName}" at path "${filePath}".`,
      );
    };

    this.soundRegistry.set(soundName, audio);
  }

  /**
   * Triggers playback for a given sound identifier.
   * Supports true polyphony by cloning the base audio element, allowing
   * overlapping playback and rapid re-triggering without cutting off.
   * @param {string} soundName - The data-sound identifier to play.
   */
  playSound(soundName) {
    const baseAudio = this.soundRegistry.get(soundName);

    if (!baseAudio) {
      console.warn(
        `AudioEngine: No sound registered for identifier "${soundName}".`,
      );
      return;
    }

    const soundClone = baseAudio.cloneNode();
    soundClone.currentTime = 0;

    soundClone.play().catch((error) => {
      console.error(
        `AudioEngine: Playback error for sound "${soundName}".`,
        error,
      );
    });
  }
}

export const audioEngine = new AudioEngine();
