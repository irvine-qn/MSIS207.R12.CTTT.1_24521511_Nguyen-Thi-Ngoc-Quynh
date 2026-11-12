const SERVER_LATENCY_MS = 800

const serverStock = new Map([
  ['pvs-vip-ticket', 1],
  ['gcoin-crate', 10],
])

export function claimCrateRequest(dropId, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Claim aborted', 'AbortError'))
      return
    }

    const timerId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      const stock = serverStock.get(dropId) ?? 0
      if (stock <= 0) {
        resolve(new Response(null, { status: 409 }))
        return
      }
      serverStock.set(dropId, stock - 1)
      resolve(new Response(null, { status: 200 }))
    }, SERVER_LATENCY_MS)

    function handleAbort() {
      clearTimeout(timerId)
      reject(new DOMException('Claim aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}
