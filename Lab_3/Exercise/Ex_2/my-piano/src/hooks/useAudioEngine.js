import { useCallback, useEffect, useRef } from "react";
import { midiToFreq } from "../utils/midiToFreq";

const OSCILLATOR_TYPE = "triangle";
const VOICE_GAIN = 0.2;
const MAX_VOICES = 8;
const RELEASE_FLOOR = 0.0001;
const RELEASE_SECONDS = 0.04;

export function useAudioEngine(getAudioContext) {
  const activeVoicesRef = useRef(new Map());

  const noteOff = useCallback((midi) => {
    const activeVoices = activeVoicesRef.current;
    const voice = activeVoices.get(midi);
    if (!voice) return;
    activeVoices.delete(midi);

    const { osc, gain } = voice;
    const context = osc.context;
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    if (context.state === "closed") {
      osc.onended();
      return;
    }

    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(RELEASE_FLOOR, now + RELEASE_SECONDS);
    osc.stop(now + RELEASE_SECONDS);
  }, []);

  const noteOn = useCallback(
    (midi) => {
      const context = getAudioContext();
      if (!context) return;
      noteOff(midi);

      const activeVoices = activeVoicesRef.current;
      if (activeVoices.size >= MAX_VOICES) {
        const oldestMidi = activeVoices.keys().next().value;
        noteOff(oldestMidi);
      }

      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = OSCILLATOR_TYPE;
      osc.frequency.value = midiToFreq(midi);
      gain.gain.value = VOICE_GAIN;
      osc.connect(gain).connect(context.destination);
      osc.start();

      activeVoices.set(midi, { osc, gain });
    },
    [getAudioContext, noteOff],
  );

  useEffect(() => {
    const activeVoices = activeVoicesRef.current;
    return () => {
      [...activeVoices.keys()].forEach(noteOff);
    };
  }, [noteOff]);

  return { noteOn, noteOff };
}
