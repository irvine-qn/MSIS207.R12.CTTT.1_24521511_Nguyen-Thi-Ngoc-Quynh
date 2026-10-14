// ISO 8601 timestamp with an explicit timezone: Z or a numeric UTC offset.
const ISO_WITH_TZ =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|([+-])(\d{2}):(\d{2}))$/;

function isValidTimestamp(match) {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] || 0);
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) return false;
  if (match[10] !== undefined && (Number(match[10]) > 23 || Number(match[11]) > 59)) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= monthDays[month - 1];
}

/** Start a drift-resistant countdown to a timezone-qualified ISO timestamp. */
export function startCountdown(targetISOString, onTick, onComplete) {
  const match = typeof targetISOString === "string" ? targetISOString.match(ISO_WITH_TZ) : null;
  const targetTime = match && isValidTimestamp(match) ? Date.parse(targetISOString) : NaN;
  if (!Number.isFinite(targetTime)) {
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
    if (stopped) return;
    const difference = targetTime - Date.now();
    if (difference <= 0) {
      stop();
      onComplete({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }
    const totalSeconds = Math.floor(difference / 1000);
    onTick({
      days: String(Math.floor(totalSeconds / 86400)).padStart(2, "0"),
      hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"),
      minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
      seconds: String(totalSeconds % 60).padStart(2, "0"),
      expired: false,
    });
    clearTimeout(timerId);
    timerId = setTimeout(updateTimer, (difference % 1000) + 10);
  };
  function onVisibilityChange() {
    if (!stopped && document.visibilityState === "visible") updateTimer();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);
  updateTimer();
  return { stop };
}
