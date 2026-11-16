import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export function useForumMessages(forum) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!forum) {
      return
    }

    const controller = new AbortController()

    async function loadMessages() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/api/messages/${encodeURIComponent(forum)}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        const data = await response.json()
        if (!controller.signal.aborted) {
          setMessages(data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
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
