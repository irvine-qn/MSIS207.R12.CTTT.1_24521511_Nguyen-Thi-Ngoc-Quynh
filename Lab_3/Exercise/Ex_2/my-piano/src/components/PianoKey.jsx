import { memo } from "react";
import styles from "./PianoKey.module.css";

function PianoKey({
  midi,
  freqHz,
  isBlack,
  isPressed = false,
  onPress,
  onRelease,
}) {
  const className = [
    isBlack ? styles.black : styles.white,
    isPressed ? styles.pressed : "",
  ].join(" ");

  return (
    <button
      type="button"
      className={className}
      aria-label={`MIDI ${midi}, ${freqHz.toFixed(2)} Hz`}
      aria-pressed={isPressed}
      onPointerDown={() => onPress?.(midi)}
      onPointerUp={() => onRelease?.(midi)}
      onPointerLeave={() => onRelease?.(midi)}
    />
  );
}

export default memo(PianoKey);
