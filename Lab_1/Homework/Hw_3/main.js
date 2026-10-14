import { startCountdown } from "./countdown.js";
import { submitEventData } from "./formStateMachine.js";

// ---------- Slice 1: Countdown ----------

const countdownForm = document.getElementById("countdown-form");
const dateInput = document.getElementById("eventDate");
const display = document.getElementById("timer-display");
const stopBtn = document.getElementById("stop-btn");

let timer = null;

function showTimerMessage(message, isError = false) {
  display.className = isError ? "timer error" : "timer";
  display.textContent = message;
}

countdownForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!dateInput.value) {
    showTimerMessage("Please pick an event date.", true);
    return;
  }

  // datetime-local has no timezone: read it as the user's local time,
  // then convert to a UTC ISO string ("...Z") for the countdown engine
  const eventDate = new Date(dateInput.value);
  if (eventDate.getTime() <= Date.now()) {
    showTimerMessage("Event date must be in the future.", true);
    return;
  }

  // Only one countdown at a time: clean up the previous timer first
  if (timer) timer.stop();

  showTimerMessage("");
  stopBtn.textContent = "Stop Timer";
  stopBtn.disabled = false;

  timer = startCountdown(
    eventDate.toISOString(),
    (data) => {
      if (data.error) {
        showTimerMessage(data.error, true);
        stopBtn.disabled = true;
        return;
      }
      display.textContent = `${data.days}d : ${data.hours}h : ${data.minutes}m : ${data.seconds}s`;
    },
    () => {
      showTimerMessage("The event has started!");
      stopBtn.disabled = true;
    },
  );
});

stopBtn.addEventListener("click", () => {
  if (timer) timer.stop();
  timer = null;
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
const descError = document.getElementById("description-error");

const TITLE_MIN = 3;
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

// Normalize input: trim, drop control characters and collapse whitespace.
// Length is checked in validate() so the user gets a message instead of
// silent truncation. Output is only ever rendered with textContent.
function sanitize(value, { multiline = false } = {}) {
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
  return text.trim();
}

// Rules per field: title is required (3-100 chars), description is optional (max 500)
function validate(title, description) {
  const errors = { title: "", description: "" };
  if (!title) errors.title = "Title is required.";
  else if (title.length < TITLE_MIN)
    errors.title = `Title must be at least ${TITLE_MIN} characters.`;
  else if (title.length > TITLE_MAX)
    errors.title = `Title must be at most ${TITLE_MAX} characters.`;

  if (description.length > DESC_MAX)
    errors.description = `Description must be at most ${DESC_MAX} characters.`;
  return errors;
}

function showFieldError(input, errorEl, message) {
  errorEl.textContent = message;
  errorEl.style.display = message ? "block" : "none";
  input.setAttribute("aria-invalid", message ? "true" : "false");
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

  const title = sanitize(titleInput.value);
  const description = sanitize(descInput.value, { multiline: true });

  // Show the cleaned value so the user sees exactly what will be sent
  titleInput.value = title;
  descInput.value = description;

  const errors = validate(title, description);
  showFieldError(titleInput, titleError, errors.title);
  showFieldError(descInput, descError, errors.description);

  if (errors.title || errors.description) {
    // Go back to idle so an old server error is not shown with the field error
    if (currentState === "error") setFormState("idle");
    (errors.title ? titleInput : descInput).focus();
    return;
  }

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
  showFieldError(titleInput, titleError, "");
  showFieldError(descInput, descError, "");
  setFormState("idle");
  titleInput.focus();
});
