import { useCallback, useEffect, useRef, useState } from 'react'
import Keyboard from './components/Keyboard.jsx'
import Sequencer from './components/Sequencer.jsx'
import { AudioTaskQueue } from './engine/AudioTaskQueue.js'
import usePianoAudio from './hooks/usePianoAudio.js'
import { generateKeys } from './utils/keyboard.js'
import styles from './App.module.css'

const KEYS = generateKeys()
const KEY_BY_MIDI = new Map(KEYS.map((key) => [key.midi, key]))

function waitForDelay(durationMs, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, durationMs)
    const onAbort = () => {
      window.clearTimeout(timeoutId)
      reject(new DOMException('Playback stopped', 'AbortError'))
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export default function App() {
  const { noteOn: playNote, noteOff, pressedSet, stopAll } = usePianoAudio()
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('Ready')
  const queueRef = useRef(null)
  const recordedTasksRef = useRef([])
  const playbackRef = useRef(null)
  const playbackTimersRef = useRef(new Set())
  const lastTaskTimeRef = useRef(null)
  const recordingStartsRef = useRef(new Map())

  if (!queueRef.current) queueRef.current = new AudioTaskQueue()

  const onNoteOn = useCallback((midi) => {
    const key = KEY_BY_MIDI.get(midi)
    if (!key) return
    playNote(midi, key.freqHz)

    if (recording) {
      const now = performance.now()
      const deltaMs = lastTaskTimeRef.current === null ? 0 : now - lastTaskTimeRef.current
      const id = `${midi}-${now}`
      recordedTasksRef.current = [...recordedTasksRef.current, {
        id,
        midi,
        freqHz: key.freqHz,
        durationMs: 0,
        deltaMs,
      }]
      recordingStartsRef.current.set(midi, { id, startedAt: now })
      lastTaskTimeRef.current = now
    }
  }, [playNote, recording])

  const onNoteOff = useCallback((midi) => {
    noteOff(midi)
    const started = recordingStartsRef.current.get(midi)
    if (!started) return
    const durationMs = performance.now() - started.startedAt
    recordedTasksRef.current = recordedTasksRef.current.map((task) => (
      task.id === started.id ? { ...task, durationMs } : task
    ))
    recordingStartsRef.current.delete(midi)
  }, [noteOff])

  const onRecord = useCallback(() => {
    recordedTasksRef.current = []
    recordingStartsRef.current.clear()
    lastTaskTimeRef.current = null
    setRecording(true)
    setStatus('Recording')
  }, [])

  const onStop = useCallback(() => {
    playbackRef.current?.abort()
    playbackRef.current = null
    playbackTimersRef.current.forEach(window.clearTimeout)
    playbackTimersRef.current.clear()
    setRecording(false)
    setStatus('Stopped')
    recordingStartsRef.current.forEach(({ id, startedAt }) => {
      const durationMs = performance.now() - startedAt
      recordedTasksRef.current = recordedTasksRef.current.map((task) => (
        task.id === id ? { ...task, durationMs } : task
      ))
    })
    recordingStartsRef.current.clear()
    stopAll()
    queueRef.current.clear()
  }, [stopAll])

  const onPlay = useCallback(async () => {
    onStop()
    setRecording(false)
    const tasks = recordedTasksRef.current
    if (tasks.length === 0) {
      setStatus('No notes recorded')
      return
    }

    tasks.forEach((task) => queueRef.current.enqueue({ ...task }))
    const controller = new AbortController()
    playbackRef.current = controller
    setStatus('Playing')

    try {
      for (const task of queueRef.current.drain()) {
        await waitForDelay(task.deltaMs, controller.signal)
        controller.signal.throwIfAborted()
        const key = KEY_BY_MIDI.get(task.midi)
        if (!key) continue
        playNote(task.midi, task.freqHz)
        const timeoutId = window.setTimeout(() => {
          playbackTimersRef.current.delete(timeoutId)
          noteOff(task.midi)
        }, task.durationMs)
        playbackTimersRef.current.add(timeoutId)
      }
      setStatus('Playback complete')
    } catch (error) {
      if (error.name === 'AbortError') return
      setStatus('Playback failed')
    } finally {
      if (playbackRef.current === controller) playbackRef.current = null
    }
  }, [noteOff, onStop, playNote])

  useEffect(() => () => {
    playbackRef.current?.abort()
    playbackTimersRef.current.forEach(window.clearTimeout)
    playbackTimersRef.current.clear()
    queueRef.current.clear()
  }, [])

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1>88-Key Piano</h1>
        <p>Polyphonic piano and FIFO sequencer</p>
      </header>
      <Keyboard
        keys={KEYS}
        onNoteOff={onNoteOff}
        onNoteOn={onNoteOn}
        pressedSet={pressedSet}
      />
      <Sequencer
        onPlay={onPlay}
        onRecord={onRecord}
        onStop={onStop}
        status={status}
      />
    </main>
  )
}
