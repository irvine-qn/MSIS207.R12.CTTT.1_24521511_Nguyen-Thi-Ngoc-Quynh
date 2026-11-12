import PianoKey from './PianoKey.jsx'
import styles from './Keyboard.module.css'

export default function Keyboard({ keys, pressedSet, onNoteOn, onNoteOff }) {
  return (
    <section aria-label="Piano keyboard" className={styles.keyboard}>
      {keys.map((item) => (
        <PianoKey
          isBlack={item.isBlack}
          isPressed={pressedSet.has(item.midi)}
          key={item.id}
          midi={item.midi}
          noteName={item.noteName}
          onNoteOff={onNoteOff}
          onNoteOn={onNoteOn}
        />
      ))}
    </section>
  )
}
