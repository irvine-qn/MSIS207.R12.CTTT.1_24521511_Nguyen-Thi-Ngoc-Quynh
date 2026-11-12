import { useEffect, useRef, useState } from "react";
import {
  initKeyboardHandler,
  initPadClickHandler,
  removeKeyboardHandler,
  removePadClickHandler,
} from "../keyboardHandler.js";
import { audioEngine } from "../audioEngine.js";
import { beatRecorder } from "../beatRecorder.js";
import styles from "./App.module.css";

const pads = [
  { key: "A", code: "KeyA", sound: "kick", label: "Kick" },
  { key: "S", code: "KeyS", sound: "snare", label: "Snare" },
  { key: "D", code: "KeyD", sound: "hihat", label: "Hi-Hat" },
  { key: "F", code: "KeyF", sound: "clap", label: "Clap" },
  { key: "G", code: "KeyG", sound: "openhat", label: "Open Hat" },
  { key: "H", code: "KeyH", sound: "boom", label: "Boom" },
  { key: "J", code: "KeyJ", sound: "ride", label: "Ride" },
  { key: "K", code: "KeyK", sound: "tom", label: "Tom" },
  { key: "L", code: "KeyL", sound: "tink", label: "Tink" },
];

export default function App() {
  const [status, setStatus] = useState("Not recording");
  const [recording, setRecording] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayTimers = useRef([]);
  const visualTimers = useRef([]);

  useEffect(() => {
    initKeyboardHandler();
    initPadClickHandler();
    return () => {
      removeKeyboardHandler();
      removePadClickHandler();
      replayTimers.current.forEach(window.clearTimeout);
      visualTimers.current.forEach(window.clearTimeout);
    };
  }, []);

  function stopReplay() {
    replayTimers.current.forEach(window.clearTimeout);
    replayTimers.current = [];
    setIsReplaying(false);
  }

  function playRecordedEvent(event) {
    const pad = document.querySelector(`.key[data-sound="${event.soundId}"]`);
    if (!pad || !audioEngine.playSound(event.soundId)) return;
    pad.classList.add("playing");
    const timer = window.setTimeout(() => pad.classList.remove("playing"), 120);
    visualTimers.current.push(timer);
  }

  function replay() {
    const events = beatRecorder.getEvents();
    if (!events.length) return;
    stopReplay();
    setIsReplaying(true);
    setStatus(`Replaying ${events.length} recorded beat(s)…`);
    const firstTimestamp = events[0].timestamp;
    replayTimers.current = events.map((event, index) => window.setTimeout(() => {
      playRecordedEvent(event);
      if (index === events.length - 1) {
        replayTimers.current = [];
        setIsReplaying(false);
        setStatus(`Replay finished. ${beatRecorder.getEvents().length} beat(s) recorded.`);
      }
    }, Math.max(0, event.timestamp - firstTimestamp)));
  }

  function startRecording() {
    stopReplay();
    beatRecorder.startRecording();
    setRecording(true);
    setHasEvents(false);
    setStatus("Recording… Play the drums with the pads or A–L.");
  }

  function stopRecording() {
    beatRecorder.stopRecording();
    const count = beatRecorder.getEvents().length;
    setRecording(false);
    setHasEvents(count > 0);
    setStatus(`Recording stopped. ${count} beat${count === 1 ? "" : "s"} recorded.`);
  }

  function clearRecording() {
    stopReplay();
    beatRecorder.clear();
    setHasEvents(false);
    setStatus("Recording cleared.");
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Drum Kit</h1>
      <section className={styles.grid} aria-label="Drum pads">
        {pads.map((pad) => (
          <button
            key={pad.sound}
            type="button"
            className={`key ${styles.pad}`}
            data-key={pad.key}
            data-code={pad.code}
            data-sound={pad.sound}
            aria-label={`${pad.label} drum, ${pad.key} key`}
          >
            <kbd>{pad.key}</kbd>
            <span>{pad.label}</span>
          </button>
        ))}
      </section>
      <section className={styles.recorder} aria-label="Beat recorder">
        <div className={styles.controls}>
          <button className={styles.control} type="button" onClick={startRecording} disabled={recording || isReplaying}>Start recording</button>
          <button className={styles.control} type="button" onClick={stopRecording} disabled={!recording}>Stop recording</button>
          <button className={styles.control} type="button" onClick={replay} disabled={!hasEvents || recording || isReplaying}>Replay</button>
          <button className={styles.control} type="button" onClick={clearRecording} disabled={!hasEvents || recording || isReplaying}>Clear</button>
        </div>
        <output className={styles.status} aria-live="polite">{status}</output>
      </section>
      <p className={styles.hint}>Keyboard: A S D F G H J K L · You can also click a pad</p>
    </main>
  );
}
