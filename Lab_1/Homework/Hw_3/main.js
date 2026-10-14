import { startCountdown } from "./countdown.js";

const target = "2030-01-01T00:00:00Z";
const display = document.getElementById("timer-display");
const stopBtn = document.getElementById("stop-btn");

const timer = startCountdown(
  target,
  (data) => {
    if (data.error) {
      display.className = "timer error";
      display.textContent = data.error;
      return;
    }
    if (data.expired) {
      display.textContent = "Event has expired!";
      return;
    }
    display.textContent = `${data.days}d : ${data.hours}h : ${data.minutes}m : ${data.seconds}s`;
  },
  () => {
    display.textContent = "Countdown finished!";
  },
);

stopBtn.addEventListener("click", () => {
  timer.stop();
  stopBtn.textContent = "Timer Stopped";
  stopBtn.disabled = true;
});
import { submitEventData } from "./formStateMachine.js";

const form = document.getElementById("event-form");
const titleInput = document.getElementById("eventTitle");
const submitBtn = document.getElementById("submit-btn");
const successBanner = document.getElementById("success-banner");
const errorBanner = document.getElementById("error-banner");
const errorText = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const titleError = document.getElementById("title-error");

// State Handler Function
function setFormState(state, errorMessage = "") {
  switch (state) {
    case "IDLE":
      form.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Event";
      titleInput.disabled = false;
      successBanner.style.display = "none";
      errorBanner.style.display = "none";
      break;

    case "SUBMITTING":
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      titleInput.disabled = true;
      errorBanner.style.display = "none";
      break;

    case "SUCCESS":
      form.style.display = "none";
      successBanner.style.display = "block";
      errorBanner.style.display = "none";
      break;

    case "ERROR":
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Event";
      titleInput.disabled = false;
      errorText.textContent = errorMessage || "Submission failed.";
      errorBanner.style.display = "block";
      break;
  }
}

// Handle Form Submission
async function handleSubmission() {
  const titleValue = titleInput.value.trim();

  // Client-side validation
  if (!titleValue) {
    titleError.style.display = "block";
    return;
  }
  titleError.style.display = "none";

  setFormState("SUBMITTING");

  try {
    await submitEventData({ eventTitle: titleValue });
    setFormState("SUCCESS");
  } catch (err) {
    setFormState("ERROR", err.message);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSubmission();
});

retryBtn.addEventListener("click", () => {
  handleSubmission();
});
