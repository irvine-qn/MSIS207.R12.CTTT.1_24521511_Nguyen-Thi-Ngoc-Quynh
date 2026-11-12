import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_VOICES = 8

export default function usePianoAudio() {
  const audioContextRef = useRef(null)
  const activeVoicesRef = useRef(new Map())
  const [pressedSet, setPressedSet] = useState(() => new Set())

  const stopVoice = useCallback((midi) => {
    const voice = activeVoicesRef.current.get(midi)
    if (!voice) return

    const now = voice.context.currentTime
    voice.gain.gain.cancelScheduledValues(now)
    voice.gain.gain.setTargetAtTime(0, now, 0.035)
    voice.oscillator.stop(now + 0.15)
    activeVoicesRef.current.delete(midi)
  }, [])

  const noteOn = useCallback((midi, freqHz) => {
    let context = audioContextRef.current
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) return
      context = new AudioContextClass()
      audioContextRef.current = context
    }
    if (context.state === 'suspended') void context.resume()

    if (activeVoicesRef.current.has(midi)) return
    if (activeVoicesRef.current.size >= MAX_VOICES) {
      const oldestMidi = activeVoicesRef.current.keys().next().value
      if (oldestMidi !== undefined) {
        stopVoice(oldestMidi)
        setPressedSet((previous) => {
          const next = new Set(previous)
          next.delete(oldestMidi)
          return next
        })
      }
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freqHz, context.currentTime)
    gain.gain.setValueAtTime(0, context.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, context.currentTime + 0.02)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    activeVoicesRef.current.set(midi, { context, oscillator, gain })
    setPressedSet((previous) => new Set(previous).add(midi))
  }, [stopVoice])

  const noteOff = useCallback((midi) => {
    stopVoice(midi)
    setPressedSet((previous) => {
      if (!previous.has(midi)) return previous
      const next = new Set(previous)
      next.delete(midi)
      return next
    })
  }, [stopVoice])

  const stopAll = useCallback(() => {
    Array.from(activeVoicesRef.current.keys()).forEach(stopVoice)
    setPressedSet(new Set())
  }, [stopVoice])

  useEffect(() => () => {
    activeVoicesRef.current.forEach((voice) => {
      voice.gain.gain.cancelScheduledValues(voice.context.currentTime)
      voice.gain.gain.setTargetAtTime(0, voice.context.currentTime, 0.01)
      voice.oscillator.stop(voice.context.currentTime + 0.05)
    })
    activeVoicesRef.current.clear()
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close()
    }
  }, [])

  return { noteOn, noteOff, pressedSet, stopAll }
}
