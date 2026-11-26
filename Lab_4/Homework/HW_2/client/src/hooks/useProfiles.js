import { useEffect, useState } from 'react'
import { getProfiles } from '../api/swipeApi.js'

export function useProfiles() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadProfiles() {
      try {
        const profiles = await getProfiles({ signal: controller.signal })
        if (!controller.signal.aborted) {
          setData(profiles)
          setError(null)
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

    loadProfiles()

    return () => controller.abort()
  }, [])

  return { data, loading, error }
}
