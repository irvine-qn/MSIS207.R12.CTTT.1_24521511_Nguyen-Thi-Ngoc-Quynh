import { useId } from "react";
import styles from "./SequencerControls.module.css";

const SPEED_OPTIONS = [
  { id: "speed-half", value: 0.5, label: "0.5x" },
  { id: "speed-normal", value: 1, label: "1.0x" },
  { id: "speed-double", value: 2, label: "2.0x" },
];

const STATUS_TEXT = {
  idle: "Idle",
  recording: "Recording",
  playing: "Playing",
};

function SequencerControls({
  status = "idle",
  speed = 1,
  onRecord,
  onPlay,
  onStop,
  onSpeedChange,
}) {
  const speedId = useId();
  const isIdle = status === "idle";

  return (
    <section className={styles.controls} aria-label="Sequencer">
      <fieldset className={styles.buttons}>
        <legend className={styles.legend}>Sequencer</legend>
        <button
          type="button"
          className={styles.record}
          disabled={!isIdle || !onRecord}
          onClick={onRecord}
        >
          Record
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!isIdle || !onPlay}
          onClick={onPlay}
        >
          Play
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={isIdle || !onStop}
          onClick={onStop}
        >
          Stop Sequence
        </button>
      </fieldset>
      <p className={styles.field}>
        <label htmlFor={speedId}>Speed</label>
        <select
          id={speedId}
          className={styles.select}
          value={speed}
          disabled={!isIdle}
          onChange={(event) => onSpeedChange?.(Number(event.target.value))}
        >
          {SPEED_OPTIONS.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </p>
      <output className={styles.status} role="status" data-status={status}>
        {STATUS_TEXT[status]}
      </output>
    </section>
  );
}

export default SequencerControls;
