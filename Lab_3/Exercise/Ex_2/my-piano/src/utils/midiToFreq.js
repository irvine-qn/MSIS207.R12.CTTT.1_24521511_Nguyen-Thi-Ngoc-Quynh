const A4_MIDI = 69
const A4_FREQ_HZ = 440
const SEMITONES_PER_OCTAVE = 12

export function midiToFreq(midi) {
  return A4_FREQ_HZ * 2 ** ((midi - A4_MIDI) / SEMITONES_PER_OCTAVE)
}
