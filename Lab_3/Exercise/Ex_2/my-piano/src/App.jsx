import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import pianoIcon from "./assets/piano.svg";
import styles from "./App.module.css";
import { generateKeys } from "./utils/generateKeys";
import Keyboard from "./components/Keyboard";
import {
  KEY_ZONES,
  buildKeyMaps,
  canShiftZone,
  getZoneRange,
} from "./utils/keyboardMap";
import { midiToNoteName } from "./utils/midiToNoteName";
import { useAudioContext } from "./hooks/useAudioContext";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useSequencer } from "./hooks/useSequencer";
import SequencerControls from "./components/SequencerControls";

const KEYS = generateKeys();
const INITIAL_SHIFTS = Object.fromEntries(
  KEY_ZONES.map((zone) => [zone.id, 0]),
);

function App() {
  const whiteKeys = KEYS.filter((key) => !key.isBlack);
  const blackCount = KEYS.length - whiteKeys.length;
  const [pressedSet, setPressedSet] = useState(() => new Set());
  const [octaveShifts, setOctaveShifts] = useState(INITIAL_SHIFTS);
  const heldCodesRef = useRef(new Map());
  const { audioState, getAudioContext } = useAudioContext();
  const { noteOn, noteOff } = useAudioEngine(getAudioContext);
  const {
    status,
    speed,
    events,
    setSpeed,
    recordPress,
    recordRelease,
    startRecording,
    stop,
  } = useSequencer();
  const { codeToMidi, midiToLabel } = useMemo(
    () => buildKeyMaps(octaveShifts),
    [octaveShifts],
  );

  const handlePress = useCallback(
    (midi) => {
      noteOn(midi);
      recordPress(midi);
      setPressedSet((prev) => {
        if (prev.has(midi)) return prev;
        const next = new Set(prev);
        next.add(midi);
        return next;
      });
    },
    [noteOn, recordPress],
  );

  const handleRelease = useCallback(
    (midi) => {
      noteOff(midi);
      recordRelease(midi);
      setPressedSet((prev) => {
        if (!prev.has(midi)) return prev;
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    },
    [noteOff, recordRelease],
  );

  const shiftZone = useCallback((zoneId, step) => {
    setOctaveShifts((prev) => {
      const zone = KEY_ZONES.find((item) => item.id === zoneId);
      const nextShift = prev[zoneId] + step;
      if (!canShiftZone(zone, nextShift)) return prev;
      return { ...prev, [zoneId]: nextShift };
    });
  }, []);

  useEffect(() => {
    const heldCodes = heldCodesRef.current;

    const handleKeyDown = (event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey)
        return;
      const shiftTarget = KEY_ZONES.find(
        (zone) => zone.downCode === event.code || zone.upCode === event.code,
      );
      if (shiftTarget) {
        event.preventDefault();
        shiftZone(shiftTarget.id, shiftTarget.upCode === event.code ? 1 : -1);
        return;
      }
      const midi = codeToMidi.get(event.code);
      if (midi === undefined) return;
      event.preventDefault();
      heldCodes.set(event.code, midi);
      handlePress(midi);
    };

    const handleKeyUp = (event) => {
      const midi = heldCodes.get(event.code);
      if (midi === undefined) return;
      heldCodes.delete(event.code);
      handleRelease(midi);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [codeToMidi, handlePress, handleRelease, shiftZone]);

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <img
          src={pianoIcon}
          className={styles.logo}
          width="64"
          height="64"
          alt="Piano icon"
        />
        <h1 className={styles.title}>Piano website</h1>
      </header>
      <section className={styles.panel} aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading">Keyboard</h2>
        <output className={styles.audioStatus} role="status">
          Audio: {audioState}
        </output>
        <dl className={styles.freqList}>
          <div className={styles.freqItem}>
            <dt>Total keys</dt>
            <dd>{KEYS.length}</dd>
          </div>
          <div className={styles.freqItem}>
            <dt>White keys</dt>
            <dd>{whiteKeys.length}</dd>
          </div>
          <div className={styles.freqItem}>
            <dt>Black keys</dt>
            <dd>{blackCount}</dd>
          </div>
        </dl>
        <ul className={styles.zoneList} aria-label="Octave shift">
          {KEY_ZONES.map((zone) => {
            const shift = octaveShifts[zone.id];
            const { first, last } = getZoneRange(zone, shift);
            return (
              <li key={zone.id} className={styles.zoneItem}>
                <button
                  type="button"
                  className={styles.shiftButton}
                  aria-label={`${zone.name} octave down`}
                  disabled={!canShiftZone(zone, shift - 1)}
                  onClick={() => shiftZone(zone.id, -1)}
                >
                  -
                </button>
                <output className={styles.zoneStatus} role="status">
                  {zone.name}: {midiToNoteName(first)} - {midiToNoteName(last)}
                </output>
                <button
                  type="button"
                  className={styles.shiftButton}
                  aria-label={`${zone.name} octave up`}
                  disabled={!canShiftZone(zone, shift + 1)}
                  onClick={() => shiftZone(zone.id, 1)}
                >
                  +
                </button>
              </li>
            );
          })}
        </ul>
        <Keyboard
          keys={KEYS}
          pressedSet={pressedSet}
          shortcutMap={midiToLabel}
          onPress={handlePress}
          onRelease={handleRelease}
        />
      </section>
      <section className={styles.panel} aria-labelledby="sequencer-heading">
        <h2 id="sequencer-heading">Sequencer</h2>
        <SequencerControls
          status={status}
          speed={speed}
          onRecord={startRecording}
          onStop={stop}
          onSpeedChange={setSpeed}
        />
        <ol className={styles.eventList} aria-label="Recorded events">
          {events.map((event) => (
            <li key={event.id} className={styles.eventItem}>
              <span>{midiToNoteName(event.midi)}</span>
              <span>{event.freqHz.toFixed(2)} Hz</span>
              <span>delta {event.deltaMs} ms</span>
              <span>duration {event.durationMs} ms</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

export default App;
