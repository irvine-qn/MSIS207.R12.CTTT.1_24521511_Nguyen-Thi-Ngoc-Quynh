// ISO 8601 with an explicit timezone: "Z" or "+hh:mm" / "-hh:mm"
const ISO_WITH_TZ =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * @param {string} targetISOString - Target timestamp in ISO 8601 format (e.g., "2030-01-01T00:00:00Z").
 * @param {Function} onTick - Callback function receiving the formatted time object or status messages.
 * @param {Function} onComplete - Callback function triggered when the countdown reaches zero.
 * @returns {Object} An object with a stop() method to clear the timer.
 */
export function startCountdown(targetISOString, onTick, onComplete) {
  // Reject timestamps without a timezone: they would be parsed as local time
  const targetTime =
    typeof targetISOString === "string" && ISO_WITH_TZ.test(targetISOString)
      ? Date.parse(targetISOString)
      : NaN;

  if (isNaN(targetTime)) {
    onTick({ error: "Invalid ISO 8601 timestamp (timezone required)." });
    return { stop: () => {} };
  }

  let timerId = null;
  let stopped = false;

  const stop = () => {
    stopped = true;
    clearTimeout(timerId);
    timerId = null;
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };

  const updateTimer = () => {
    // Remaining time is always recomputed from the clock, so no drift builds up
    const difference = targetTime - Date.now();

    if (difference <= 0) {
      stop();
      onComplete({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }

    const secondsTotal = Math.floor(difference / 1000);
    const days = Math.floor(secondsTotal / (3600 * 24));
    const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;

    onTick({
      days: String(days).padStart(2, "0"),
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
      expired: false,
    });

    // Schedule the next tick right after the next whole-second boundary
    // so the display never skips or repeats a second
    clearTimeout(timerId);
    timerId = setTimeout(updateTimer, (difference % 1000) + 10);
  };

  // Browsers throttle timers in background tabs; resync when the tab returns
  function onVisibilityChange() {
    if (!stopped && document.visibilityState === "visible") updateTimer();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  updateTimer();

  return { stop };
}
