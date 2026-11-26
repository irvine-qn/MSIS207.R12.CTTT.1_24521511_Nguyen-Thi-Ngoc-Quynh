import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const MAX_RETRIES = 3
const BASE_DELAY_MS = 500

export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }
    const onAbort = () => {
      clearTimeout(timeoutId)
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function isRetryable(err) {
  if (err.name === 'AbortError') return false
  if (err.status >= 400 && err.status < 500) return false
  return true
}

export function useForumMessages(forum) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!forum) {
      return
    }

    const controller = new AbortController()
    const { signal } = controller

    async function fetchWithRetry() {
      for (let attempt = 0; ; attempt += 1) {
        try {
          const response = await fetch(`${API_URL}/api/messages/${encodeURIComponent(forum)}`, { signal })
          if (!response.ok) {
            const httpError = new Error(`Request failed with status ${response.status}`)
            httpError.status = response.status
            throw httpError
          }
          return await response.json()
        } catch (err) {
          if (attempt >= MAX_RETRIES || !isRetryable(err) || signal.aborted) {
            throw err
          }
          await sleep(BASE_DELAY_MS * 2 ** attempt, signal)
        }
      }
    }

    async function loadMessages() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWithRetry()
        if (!signal.aborted) {
          setMessages(data)
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMessages()

    return () => controller.abort()
  }, [forum])

  if (!forum) {
    return { messages: [], loading: false, error: null }
  }

  return { messages, loading, error }
}
