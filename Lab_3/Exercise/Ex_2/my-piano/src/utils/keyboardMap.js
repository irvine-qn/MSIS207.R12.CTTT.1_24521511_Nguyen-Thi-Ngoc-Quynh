const MIN_MIDI = 21
const MAX_MIDI = 108
const SEMITONES_PER_OCTAVE = 12

export const KEY_ZONES = [
  {
    id: 'lower',
    name: 'Zone 1',
    downCode: 'ArrowLeft',
    upCode: 'ArrowRight',
    baseMidi: 48,
    bindings: [
      { code: 'KeyZ', label: 'Z' },
      { code: 'KeyS', label: 'S' },
      { code: 'KeyX', label: 'X' },
      { code: 'KeyD', label: 'D' },
      { code: 'KeyC', label: 'C' },
      { code: 'KeyV', label: 'V' },
      { code: 'KeyG', label: 'G' },
      { code: 'KeyB', label: 'B' },
      { code: 'KeyH', label: 'H' },
      { code: 'KeyN', label: 'N' },
      { code: 'KeyJ', label: 'J' },
      { code: 'KeyM', label: 'M' },
      { code: 'Comma', label: ',' },
      { code: 'KeyL', label: 'L' },
      { code: 'Period', label: '.' },
      { code: 'Semicolon', label: ';' },
      { code: 'Slash', label: '/' },
    ],
  },
  {
    id: 'upper',
    name: 'Zone 2',
    downCode: 'ArrowDown',
    upCode: 'ArrowUp',
    baseMidi: 72,
    bindings: [
      { code: 'KeyQ', label: 'Q' },
      { code: 'Digit2', label: '2' },
      { code: 'KeyW', label: 'W' },
      { code: 'Digit3', label: '3' },
      { code: 'KeyE', label: 'E' },
      { code: 'KeyR', label: 'R' },
      { code: 'Digit5', label: '5' },
      { code: 'KeyT', label: 'T' },
      { code: 'Digit6', label: '6' },
      { code: 'KeyY', label: 'Y' },
      { code: 'Digit7', label: '7' },
      { code: 'KeyU', label: 'U' },
      { code: 'KeyI', label: 'I' },
      { code: 'Digit9', label: '9' },
      { code: 'KeyO', label: 'O' },
      { code: 'Digit0', label: '0' },
      { code: 'KeyP', label: 'P' },
      { code: 'BracketLeft', label: '[' },
      { code: 'Equal', label: '=' },
      { code: 'BracketRight', label: ']' },
    ],
  },
]


export function getZoneStart(zone, octaveShift) {
  return zone.baseMidi + octaveShift * SEMITONES_PER_OCTAVE
}

export function getZoneRange(zone, octaveShift) {
  const start = getZoneStart(zone, octaveShift)
  const end = start + zone.bindings.length - 1
  return { first: Math.max(start, MIN_MIDI), last: Math.min(end, MAX_MIDI) }
}

export function canShiftZone(zone, octaveShift) {
  const { first, last } = getZoneRange(zone, octaveShift)
  return first <= last
}

export function buildKeyMaps(octaveShifts) {
  const codeToMidi = new Map()
  const midiToLabel = new Map()

  KEY_ZONES.forEach((zone) => {
    const start = getZoneStart(zone, octaveShifts[zone.id])
    zone.bindings.forEach((binding, offset) => {
      const midi = start + offset
      if (midi < MIN_MIDI || midi > MAX_MIDI) return
      codeToMidi.set(binding.code, midi)
      const existing = midiToLabel.get(midi)
      midiToLabel.set(midi, existing ? `${existing}/${binding.label}` : binding.label)
    })
  })

  return { codeToMidi, midiToLabel }
}
