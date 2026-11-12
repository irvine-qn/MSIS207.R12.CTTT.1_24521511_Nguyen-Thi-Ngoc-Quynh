# AI Failure Audit

The issues below were found while reviewing the generated implementation and were refactored before delivery.

## 1. The React entry point rendered an empty page

- **Generated issue:** `main.jsx` mounted an empty `<main>` and did not import `App`, so the application UI was absent.
- **Refactor:** `src/main.jsx` imports `App.jsx` and mounts it under `StrictMode`.
- **Source evidence:** `src/main.jsx` contains the `App` import and `<App />` mount. The production bundle increased from 15 to 26 transformed modules after wiring the app.
- **DevTools evidence:** No browser DevTools capture was made during this implementation.

## 2. FIFO voice stealing left a key visually pressed

- **Generated issue:** Stopping the oldest oscillator removed it from the audio voice map but did not remove its MIDI value from `pressedSet`.
- **Refactor:** `src/hooks/usePianoAudio.js` removes the stolen MIDI value from a copied `Set` when the voice limit is reached.
- **Source evidence:** The FIFO branch selects the first `Map` key, stops that voice, then creates a new `Set` without the stolen MIDI value.
- **DevTools evidence:** No browser audio or React Profiler capture was made during this implementation.

## 3. Recorded notes used a fixed duration

- **Generated issue:** The first recording implementation assigned every note a fixed 300 ms duration, which did not preserve how long the user held a key.
- **Refactor:** `src/App.jsx` stores each note's start time and computes `durationMs` when the note is released or recording stops.
- **Source evidence:** `onNoteOn` records the start time; `onNoteOff` and `onStop` update the matching task immutably with the measured duration.
- **DevTools evidence:** No browser interaction capture was made during this implementation.

## Verification status

- `npm run build` completes successfully.
- A Node check confirmed the FIFO queue drains tasks in insertion order.
- React DevTools Profiler and Chrome DevTools audio behavior still require a browser session and have not been captured as evidence.
