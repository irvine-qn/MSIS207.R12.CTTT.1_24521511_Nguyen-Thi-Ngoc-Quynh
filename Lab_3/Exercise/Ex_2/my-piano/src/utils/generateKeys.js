import { midiToFreq } from './midiToFreq.js'

const FIRST_MIDI = 21
const LAST_MIDI = 108
const SEMITONES_PER_OCTAVE = 12
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

export function generateKeys() {
  return Array.from({ length: LAST_MIDI - FIRST_MIDI + 1 }, (_, offset) => {
    const midi = FIRST_MIDI + offset
    return {
      id: `key-${midi}`,
      midi,
      freqHz: midiToFreq(midi),
      isBlack: BLACK_PITCH_CLASSES.has(midi % SEMITONES_PER_OCTAVE),
    }
  })
}
