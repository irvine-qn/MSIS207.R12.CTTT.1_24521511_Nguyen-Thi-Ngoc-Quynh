const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const BLACK_KEY_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function midiToNoteName(midi) {
  const pitchClass = midi % 12
  const octave = Math.floor(midi / 12) - 1

  return `${NOTE_NAMES[pitchClass]}${octave}`
}

export function generateKeys() {
  return Array.from({ length: 88 }, (_, index) => {
    const midi = index + 21

    return {
      id: `key-${midi}`,
      midi,
      noteName: midiToNoteName(midi),
      freqHz: midiToFreq(midi),
      isBlack: BLACK_KEY_PITCH_CLASSES.has(midi % 12),
    }
  })
}
