import {
  initKeyboardHandler,
  initPadClickHandler,
} from "./keyboardHandler.js";
import { audioEngine } from "./audioEngine.js";
import { beatRecorder } from "./beatRecorder.js";

initKeyboardHandler();
initPadClickHandler();

const recordButton = document.querySelector("#record-button");
const stopRecordingButton = document.querySelector("#stop-recording-button");
const replayButton = document.querySelector("#replay-button");
const clearButton = document.querySelector("#clear-button");
const recorderStatus = document.querySelector("#recorder-status");

let replayTimers = [];
let isReplaying = false;

function updateRecorderControls() {
  const hasEvents = beatRecorder.getEvents().length > 0;

  recordButton.disabled = beatRecorder.isRecording || isReplaying;
  stopRecordingButton.disabled = !beatRecorder.isRecording;
  replayButton.disabled = !hasEvents || beatRecorder.isRecording || isReplaying;
  clearButton.disabled = !hasEvents || beatRecorder.isRecording || isReplaying;
}

function updateRecorderStatus(message) {
  recorderStatus.textContent = message;
}

function cancelReplay() {
  replayTimers.forEach((timer) => window.clearTimeout(timer));
  replayTimers = [];
  isReplaying = false;
}

function playRecordedEvent(event) {
  const pad = document.querySelector(
    `.key[data-sound="${event.soundId}"]`,
  );

  if (!pad) {
    console.warn(
      `BeatRecorder: No drum pad found for sound "${event.soundId}".`,
    );
    return;
  }

  if (!audioEngine.playSound(event.soundId)) return;

  pad.classList.add("playing");
  window.setTimeout(() => pad.classList.remove("playing"), 120);
}

function replayEvents(events) {
  if (events.length === 0) return;

  cancelReplay();
  isReplaying = true;
  updateRecorderControls();
  updateRecorderStatus(`Replaying ${events.length} recorded beat(s)…`);

  const firstTimestamp = events[0].timestamp;
  events.forEach((event, index) => {
    const delay = Math.max(0, event.timestamp - firstTimestamp);
    const timer = window.setTimeout(() => {
      playRecordedEvent(event);

      if (index === events.length - 1) {
        replayTimers = [];
        isReplaying = false;
        updateRecorderControls();
        updateRecorderStatus(
          `Replay finished. ${beatRecorder.getEvents().length} beat(s) recorded.`,
        );
      }
    }, delay);
    replayTimers.push(timer);
  });
}

recordButton.addEventListener("click", () => {
  cancelReplay();
  beatRecorder.startRecording();
  updateRecorderStatus("Recording… Play the drums with the pads or A–L.");
  updateRecorderControls();
});

stopRecordingButton.addEventListener("click", () => {
  beatRecorder.stopRecording();
  const count = beatRecorder.getEvents().length;
  updateRecorderStatus(
    `Recording stopped. ${count} beat${count === 1 ? "" : "s"} recorded.`,
  );
  updateRecorderControls();
});

replayButton.addEventListener("click", () => {
  replayEvents(beatRecorder.getEvents());
});

clearButton.addEventListener("click", () => {
  cancelReplay();
  beatRecorder.clear();
  updateRecorderStatus("Recording cleared.");
  updateRecorderControls();
});

updateRecorderControls();
