export function waitForReply(timeoutMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timerId = setTimeout(() => resolve('SEEN_NO_REPLY'), timeoutMs)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timerId)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}
