import { useCallback, useRef, useState } from "react";
import { midiToFreq } from "../utils/midiToFreq";

export function useSequencer() {
  const [status, setStatus] = useState("idle");
  const [speed, setSpeed] = useState(1);
  const [events, setEvents] = useState([]);
  const isRecordingRef = useRef(false);
  const lastOnsetRef = useRef(0);
  const heldNotesRef = useRef(new Map());

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

  const stop = useCallback(() => {
    if (isRecordingRef.current) {
      const now = performance.now();
      [...heldNotesRef.current.keys()].forEach((midi) => finishNote(midi, now));
      isRecordingRef.current = false;
    }
    setStatus("idle");
  }, [finishNote]);

  return {
    status,
    speed,
    events,
    setSpeed,
    recordPress,
    recordRelease,
    startRecording,
    stop,
  };
}
