const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SEMITONES_PER_OCTAVE = 12
const MIDI_OCTAVE_OFFSET = 1

export function midiToNoteName(midi) {
  const octave = Math.floor(midi / SEMITONES_PER_OCTAVE) - MIDI_OCTAVE_OFFSET
  return `${NOTE_NAMES[midi % SEMITONES_PER_OCTAVE]}${octave}`
}
