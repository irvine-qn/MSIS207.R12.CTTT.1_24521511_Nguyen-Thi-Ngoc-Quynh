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
