import { memo } from 'react'
import styles from './PianoKey.module.css'

function PianoKey({ midi, noteName, isBlack, isPressed = false, onNoteOn, onNoteOff }) {
  const keyClassName = isBlack ? styles.blackKey : styles.whiteKey
  const pressedClassName = isPressed ? styles.pressed : ''

  return (
    <button
      aria-label={noteName}
      aria-pressed={isPressed}
      className={`${styles.key} ${keyClassName} ${pressedClassName}`}
      onPointerDown={() => onNoteOn(midi)}
      onPointerLeave={() => onNoteOff(midi)}
      onPointerUp={() => onNoteOff(midi)}
      type="button"
    >
      {noteName}
    </button>
  )
}

export default memo(PianoKey)
