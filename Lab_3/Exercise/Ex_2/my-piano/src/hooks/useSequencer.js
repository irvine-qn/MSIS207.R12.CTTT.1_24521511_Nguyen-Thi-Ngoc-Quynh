import { useCallback, useEffect, useRef, useState } from "react";
import { midiToFreq } from "../utils/midiToFreq";

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timerId = setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);
    function handleAbort() {
      clearTimeout(timerId);
      reject(signal.reason);
    }
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export function useSequencer({ noteOn, noteOff }) {
  const [status, setStatus] = useState("idle");
  const [speed, setSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const isRecordingRef = useRef(false);
  const lastOnsetRef = useRef(0);
  const heldNotesRef = useRef(new Map());
  const controllerRef = useRef(null);
  const playingNotesRef = useRef(new Set());

  const finishNote = useCallback((midi, releaseTime) => {
    const held = heldNotesRef.current.get(midi);
    if (!held) return;
    heldNotesRef.current.delete(midi);
    const durationMs = Math.round(releaseTime - held.startTime);
    setEvents((prev) =>
      prev.map((event) =>
        event.id === held.id ? { ...event, durationMs } : event,
      ),
    );
  }, []);

  const recordPress = useCallback(
    (midi) => {
      if (!isRecordingRef.current) return;
      const startTime = performance.now();
      finishNote(midi, startTime);

      const event = {
        id: crypto.randomUUID(),
        midi,
        freqHz: midiToFreq(midi),
        durationMs: 0,
        deltaMs: Math.round(startTime - lastOnsetRef.current),
      };
      lastOnsetRef.current = startTime;
      heldNotesRef.current.set(midi, { id: event.id, startTime });
      setEvents((prev) => [...prev, event]);
    },
    [finishNote],
  );

  const recordRelease = useCallback(
    (midi) => {
      if (!isRecordingRef.current) return;
      finishNote(midi, performance.now());
    },
    [finishNote],
  );

  const startRecording = useCallback(() => {
    heldNotesRef.current.clear();
    lastOnsetRef.current = performance.now();
    isRecordingRef.current = true;
    setEvents([]);
    setStatus("recording");
  }, []);

  const cancelReplay = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    playingNotesRef.current.forEach((midi) => noteOff(midi));
    playingNotesRef.current.clear();
  }, [noteOff]);

  const play = useCallback(async () => {
    if (events.length === 0) return;
    cancelReplay();
    const controller = new AbortController();
    const { signal } = controller;
    const playingNotes = playingNotesRef.current;
    controllerRef.current = controller;
    setStatus("playing");

    const playNote = async (event) => {
      noteOn(event.midi);
      playingNotes.add(event.midi);
      try {
        await wait(event.durationMs / speed, signal);
      } catch (err) {
        if (err.name === "AbortError") return;
        throw err;
      }
      noteOff(event.midi);
      playingNotes.delete(event.midi);
    };

    try {
      const pendingNotes = [];
      for (const event of events) {
        await wait(event.deltaMs / speed, signal);
        pendingNotes.push(playNote(event));
      }
      await Promise.all(pendingNotes);
    } catch (err) {
      if (err.name === "AbortError") return;
      throw err;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setStatus("idle");
      }
    }
  }, [events, speed, noteOn, noteOff, cancelReplay]);

  const stop = useCallback(() => {
    if (isRecordingRef.current) {
      const now = performance.now();
      [...heldNotesRef.current.keys()].forEach((midi) => finishNote(midi, now));
      isRecordingRef.current = false;
    }
    cancelReplay();
    setStatus("idle");
  }, [finishNote, cancelReplay]);

  useEffect(() => cancelReplay, [cancelReplay]);

  return {
    status,
    speed,
    events,
    setSpeed,
    recordPress,
    recordRelease,
    startRecording,
    play,
    stop,
  };
}
