import { startCountdown } from "./countdown.js";
import { submitEventData } from "./formStateMachine.js";

// ---------- Slice 1: Countdown ----------

const target = "2030-01-01T00:00:00Z";
const display = document.getElementById("timer-display");
const stopBtn = document.getElementById("stop-btn");

const timer = startCountdown(
  target,
  (data) => {
    if (data.error) {
      display.className = "timer error";
      display.textContent = data.error;
      stopBtn.disabled = true;
      return;
    }
    display.textContent = `${data.days}d : ${data.hours}h : ${data.minutes}m : ${data.seconds}s`;
  },
  () => {
    display.textContent = "Countdown finished!";
    stopBtn.disabled = true;
  },
);

stopBtn.addEventListener("click", () => {
  timer.stop();
  stopBtn.textContent = "Timer Stopped";
  stopBtn.disabled = true;
});

// ---------- Slice 2 & 3: State-machine form ----------

const form = document.getElementById("event-form");
const titleInput = document.getElementById("eventTitle");
const descInput = document.getElementById("eventDescription");
const submitBtn = document.getElementById("submit-btn");
const successBanner = document.getElementById("success-banner");
const successText = document.getElementById("success-text");
const newEventBtn = document.getElementById("new-event-btn");
const errorBanner = document.getElementById("error-banner");
const errorText = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const titleError = document.getElementById("title-error");

const TITLE_MAX = 100;
const DESC_MAX = 500;

// Allowed transitions between the four form states
const TRANSITIONS = {
  idle: ["submitting"],
  submitting: ["success", "error"],
  success: ["idle"],
  error: ["submitting", "idle"],
};

let currentState = null;

// Trim, drop control characters, collapse whitespace and cap the length.
// Output is only ever rendered with textContent, never innerHTML.
function sanitize(value, maxLength, { multiline = false } = {}) {
  let text = String(value).normalize("NFC");
  if (multiline) {
    text = text
      .replace(/\r\n?/g, "\n")
      .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");
  } else {
    text = text.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ");
  }
  return text.trim().slice(0, maxLength);
}

function validate(title) {
  if (!title) return "Title is required.";
  if (title.length < 3) return "Title must be at least 3 characters.";
  return "";
}

function showFieldError(message) {
  titleError.textContent = message;
  titleError.style.display = message ? "block" : "none";
  titleInput.setAttribute("aria-invalid", message ? "true" : "false");
}

function setInputsDisabled(disabled) {
  titleInput.disabled = disabled;
  descInput.disabled = disabled;
  submitBtn.disabled = disabled;
  retryBtn.disabled = disabled;
}

// State Handler Function
function setFormState(state, message = "") {
  if (currentState !== null && !TRANSITIONS[currentState].includes(state)) {
    console.warn(`Invalid transition: ${currentState} -> ${state}`);
    return false;
  }
  currentState = state;

  switch (state) {
    case "idle":
      form.style.display = "block";
      setInputsDisabled(false);
      submitBtn.textContent = "Submit Event";
      successBanner.style.display = "none";
      errorBanner.style.display = "none";
      break;

    case "submitting":
      setInputsDisabled(true);
      submitBtn.textContent = "Submitting...";
      errorBanner.style.display = "none";
      break;

    case "success":
      form.style.display = "none";
      successText.textContent = message;
      successBanner.style.display = "block";
      errorBanner.style.display = "none";
      break;

    case "error":
      setInputsDisabled(false);
      submitBtn.textContent = "Submit Event";
      errorText.textContent = message || "Submission failed.";
      errorBanner.style.display = "block";
      break;
  }
  return true;
}

setFormState("idle");

// Handle Form Submission
async function handleSubmission() {
  // Only idle or error may start a new submission (blocks double-submit
  // from repeated clicks, Enter presses and the Retry button)
  if (currentState !== "idle" && currentState !== "error") return;

  const title = sanitize(titleInput.value, TITLE_MAX);
  const description = sanitize(descInput.value, DESC_MAX, { multiline: true });

  // Show the cleaned value so the user sees exactly what will be sent
  titleInput.value = title;
  descInput.value = description;

  const fieldError = validate(title);
  if (fieldError) {
    // Go back to idle so an old server error is not shown with the field error
    if (currentState === "error") setFormState("idle");
    showFieldError(fieldError);
    titleInput.focus();
    return;
  }
  showFieldError("");

  setFormState("submitting");

  try {
    await submitEventData({ eventTitle: title, eventDescription: description });
    setFormState("success", `Event "${title}" successfully submitted!`);
  } catch (err) {
    setFormState("error", err.message);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSubmission();
});

retryBtn.addEventListener("click", handleSubmission);

newEventBtn.addEventListener("click", () => {
  form.reset();
  showFieldError("");
  setFormState("idle");
  titleInput.focus();
});
