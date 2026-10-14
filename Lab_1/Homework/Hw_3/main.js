import { startCountdown } from "./countdown.js";
import { submitEventData } from "./formStateMachine.js";

const form = document.getElementById("event-form");
const titleInput = document.getElementById("eventTitle");
const descInput = document.getElementById("eventDescription");
const dateInput = document.getElementById("eventDate");
const submitBtn = document.getElementById("submit-btn");
const successBanner = document.getElementById("success-banner");
const successText = document.getElementById("success-text");
const errorBanner = document.getElementById("error-banner");
const errorText = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const titleError = document.getElementById("title-error");
const descError = document.getElementById("description-error");
const dateError = document.getElementById("date-error");
const formStatus = document.getElementById("form-status");
const eventsSection = document.getElementById("events-section");
const eventsList = document.getElementById("events-list");
const feedbackDialog = document.getElementById("feedback-dialog");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackMessage = document.getElementById("feedback-message");
const feedbackClose = document.getElementById("feedback-close");

let currentState = "idle";
let requestInFlight = false;
let retryPayload = null;
const TITLE_MIN = 3;
const TITLE_MAX = 100;
const DESC_MAX = 500;
const transitions = {
  idle: ["submitting"],
  submitting: ["success", "error"],
  success: ["submitting"],
  error: ["submitting", "idle"],
};

function sanitize(value, multiline = false) {
  let result = String(value).normalize("NFC");
  if (multiline) {
    result = result.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
  } else {
    result = result.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ");
  }
  return result.trim();
}

function showFieldError(input, element, message) {
  element.textContent = message;
  element.style.display = message ? "block" : "none";
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function showFeedback(type, title, message) {
  feedbackDialog.classList.toggle("is-error", type === "error");
  feedbackIcon.textContent = type === "error" ? "!" : "✓";
  feedbackTitle.textContent = title;
  feedbackMessage.textContent = message;
  if (!feedbackDialog.open) feedbackDialog.showModal();
}

feedbackClose.addEventListener("click", () => feedbackDialog.close());

function setFormState(state, message = "") {
  if (!transitions[currentState].includes(state)) return false;
  currentState = state;
  const busy = state === "submitting";
  [titleInput, descInput, dateInput].forEach((input) => { input.disabled = busy; });
  submitBtn.disabled = busy;
  retryBtn.disabled = busy;

  if (state === "idle") {
    successBanner.style.display = "none";
    errorBanner.style.display = "none";
    submitBtn.textContent = "Submit event";
    formStatus.textContent = "Ready when you are.";
  } else if (state === "submitting") {
    successBanner.style.display = "none";
    errorBanner.style.display = "none";
    submitBtn.textContent = "Submitting…";
    formStatus.textContent = "Submitting your event…";
  } else if (state === "success") {
    successText.textContent = message;
    successBanner.style.display = "block";
    errorBanner.style.display = "none";
    submitBtn.textContent = "Submit event";
    formStatus.textContent = "Event added below. You can submit another event.";
  } else if (state === "error") {
    errorText.textContent = message || "Submission failed. Please try again.";
    errorBanner.style.display = "block";
    submitBtn.textContent = "Submit event";
    formStatus.textContent = "Your event was not submitted.";
  } else {
    submitBtn.textContent = "Submit event";
    formStatus.textContent = "Ready when you are.";
  }
  return true;
}

function validLocalDateTime(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const expected = [Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5])];
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getFullYear() !== expected[0] || date.getMonth() !== expected[1] || date.getDate() !== expected[2] || date.getHours() !== expected[3] || date.getMinutes() !== expected[4]) return null;
  return date;
}

function validate(title, description, startDate) {
  const errors = { title: "", description: "", date: "" };
  if (!title) errors.title = "Please enter an event title.";
  else if (title.length < TITLE_MIN) errors.title = `Use at least ${TITLE_MIN} characters.`;
  else if (title.length > TITLE_MAX) errors.title = `Use no more than ${TITLE_MAX} characters.`;
  if (description.length > DESC_MAX) errors.description = `Use no more than ${DESC_MAX} characters.`;
  if (!startDate) errors.date = "Choose a valid event start date and time.";
  else if (startDate.getTime() <= Date.now()) errors.date = "The event start time must be in the future.";
  return errors;
}

function appendEvent(eventData) {
  eventsSection.hidden = false;
  const row = document.createElement("tr");
  const eventCell = document.createElement("td");
  const title = document.createElement("strong");
  title.className = "event-title";
  title.textContent = eventData.eventTitle;
  eventCell.append(title);
  if (eventData.eventDescription) {
    const description = document.createElement("span");
    description.className = "event-description";
    description.textContent = eventData.eventDescription;
    eventCell.append(description);
  }

  const dateCell = document.createElement("td");
  dateCell.className = "event-start";
  dateCell.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(eventData.startDate);
  const countdownCell = document.createElement("td");
  countdownCell.className = "event-countdown";
  countdownCell.setAttribute("aria-live", "off");
  const countdownGrid = document.createElement("div");
  countdownGrid.className = "countdown-grid";
  const countdownValues = ["days", "hours", "minutes", "seconds"].map((unit) => {
    const tile = document.createElement("div");
    tile.className = `countdown-tile countdown-${unit}`;
    const value = document.createElement("strong");
    value.className = "countdown-value";
    const label = document.createElement("span");
    label.className = "countdown-label";
    label.textContent = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" }[unit];
    tile.append(value, label);
    countdownGrid.append(tile);
    return value;
  });
  countdownCell.append(countdownGrid);
  row.append(eventCell, dateCell, countdownCell);
  eventsList.prepend(row);

  startCountdown(eventData.startDate.toISOString(), (remaining) => {
    if (remaining.error) {
      countdownCell.textContent = "Unable to calculate countdown.";
      return;
    }
    countdownValues.forEach((value, index) => {
      value.textContent = [remaining.days, remaining.hours, remaining.minutes, remaining.seconds][index];
    });
  }, () => {
    const started = document.createElement("span");
    started.className = "event-started-label";
    started.textContent = "Event started ✨";
    countdownCell.replaceChildren(started);
    row.classList.add("event-started");
  });
  requestAnimationFrame(() => row.scrollIntoView({ behavior: "smooth", block: "center" }));
}

async function sendEvent(payload) {
  if (requestInFlight || (currentState !== "idle" && currentState !== "success" && currentState !== "error")) return;
  requestInFlight = true;
  retryPayload = payload;
  setFormState("submitting");
  try {
    const result = await submitEventData({
      eventTitle: payload.eventTitle,
      eventDescription: payload.eventDescription,
      eventStart: payload.startDate.toISOString(),
    });
    if (!result || result.success !== true) throw new Error(result?.message || "Submission failed. Please try again.");
    appendEvent(payload);
    form.reset();
    [
      [titleInput, titleError],
      [descInput, descError],
      [dateInput, dateError],
    ].forEach(([input, errorEl]) => showFieldError(input, errorEl, ""));
    retryPayload = null;
    setFormState("success", `${payload.eventTitle} was submitted successfully.`);
    showFeedback("success", "Event created", `${payload.eventTitle} was added to the countdown list.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed. Please try again.";
    setFormState("error", message);
    showFeedback("error", "Could not create event", message);
  } finally {
    requestInFlight = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (requestInFlight) return;
  successBanner.style.display = "none";
  if (currentState === "error") setFormState("idle");
  const title = sanitize(titleInput.value);
  const description = sanitize(descInput.value, true);
  const startDate = validLocalDateTime(dateInput.value);
  titleInput.value = title;
  descInput.value = description;

  const errors = validate(title, description, startDate);
  showFieldError(titleInput, titleError, errors.title);
  showFieldError(descInput, descError, errors.description);
  showFieldError(dateInput, dateError, errors.date);
  if (errors.title || errors.description || errors.date) {
    const message = "Please correct the highlighted fields before submitting.";
    formStatus.textContent = message;
    showFeedback("error", "Event not created", message);
    (errors.title ? titleInput : errors.description ? descInput : dateInput).focus();
    return;
  }
  sendEvent({ eventTitle: title, eventDescription: description, startDate });
});

retryBtn.addEventListener("click", () => {
  if (retryPayload) sendEvent(retryPayload);
});
