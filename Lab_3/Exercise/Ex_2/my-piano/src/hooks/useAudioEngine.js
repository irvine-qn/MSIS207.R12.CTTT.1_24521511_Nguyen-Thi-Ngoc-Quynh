import { useCallback, useEffect, useRef } from "react";
import { midiToFreq } from "../utils/midiToFreq";

const OSCILLATOR_TYPE = "triangle";
const VOICE_GAIN = 0.2;

export function useAudioEngine(getAudioContext) {
  const activeVoicesRef = useRef(new Map());

  const noteOff = useCallback((midi) => {
    const activeVoices = activeVoicesRef.current;
    const voice = activeVoices.get(midi);
    if (!voice) return;
    activeVoices.delete(midi);
    if (voice.osc.context.state !== "closed") voice.osc.stop();
    voice.osc.disconnect();
    voice.gain.disconnect();
  }, []);

  const noteOn = useCallback(
    (midi) => {
      const context = getAudioContext();
      if (!context) return;
      noteOff(midi);

      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = OSCILLATOR_TYPE;
      osc.frequency.value = midiToFreq(midi);
      gain.gain.value = VOICE_GAIN;
      osc.connect(gain).connect(context.destination);
      osc.start();

      activeVoicesRef.current.set(midi, { osc, gain });
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
