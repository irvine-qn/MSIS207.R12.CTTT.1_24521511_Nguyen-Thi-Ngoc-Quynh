import { memo } from "react";
import { midiToNoteName } from "../utils/midiToNoteName";
import styles from "./PianoKey.module.css";

function PianoKey({
  midi,
  freqHz,
  isBlack,
  isPressed = false,
  shortcut = "",
  onPress,
  onRelease,
}) {
  const noteName = midiToNoteName(midi);
  const className = [
    isBlack ? styles.black : styles.white,
    isPressed ? styles.pressed : "",
  ].join(" ");

  return (
    <button
      type="button"
      className={className}
      aria-label={`${noteName}, MIDI ${midi}, ${freqHz.toFixed(2)} Hz${shortcut ? `, key ${shortcut}` : ""}`}
      aria-pressed={isPressed}
      onPointerDown={() => onPress?.(midi)}
      onPointerUp={() => onRelease?.(midi)}
      onPointerLeave={() => onRelease?.(midi)}
    >
      {shortcut && <kbd className={styles.shortcut}>{shortcut}</kbd>}
      <span className={styles.note}>{noteName}</span>
    </button>
  );
}

export default memo(PianoKey);
