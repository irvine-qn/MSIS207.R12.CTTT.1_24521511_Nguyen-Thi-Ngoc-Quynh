export function waitForReply(timeoutMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const targetEpochMs = Date.now() + timeoutMs
    const hasDocument = typeof document !== 'undefined'
    let timerId = null

    function cleanup() {
      clearTimeout(timerId)
      if (hasDocument) document.removeEventListener('visibilitychange', check)
    }

    function check() {
      const remainingMs = Math.max(0, targetEpochMs - Date.now())
      clearTimeout(timerId)
      if (remainingMs === 0) {
        cleanup()
        resolve('SEEN_NO_REPLY')
        return
      }
      timerId = setTimeout(check, remainingMs)
    }

    signal.addEventListener(
      'abort',
      () => {
        cleanup()
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
    if (hasDocument) document.addEventListener('visibilitychange', check)
    check()
  })
}
