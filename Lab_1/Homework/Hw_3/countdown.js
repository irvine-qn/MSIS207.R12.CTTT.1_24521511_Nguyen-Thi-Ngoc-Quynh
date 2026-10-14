/**
 * @param {string} targetISOString - Target timestamp in ISO 8601 format (e.g., "2030-01-01T00:00:00Z").
 * @param {Function} onTick - Callback function receiving the formatted time object or status messages.
 * @param {Function} onComplete - Callback function triggered when the countdown reaches zero.
 * @returns {Object} An object with a stop() method to clear the interval.
 */
export function startCountdown(targetISOString, onTick, onComplete) {
  const targetTime = Date.parse(targetISOString);
  if (isNaN(targetTime)) {
    onTick({ error: "Invalid ISO 8601 timestamp provided." });
    return { stop: () => {} };
  }

  const updateTimer = () => {
    const now = Date.now();
    const difference = targetTime - now;

    if (difference <= 0) {
      clearInterval(timerId);
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
  };

  updateTimer();

  const timerId = setInterval(updateTimer, 1000);

  return {
    stop: () => clearInterval(timerId),
  };
}
