import { useEffect, useState } from 'react'
import { fetchDossier } from '../api/tribunalApi.js'

export function useDossier(playerID) {
  const [dossier, setDossier] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setDossier(null)
    setError(null)

    async function load() {
      try {
        const data = await fetchDossier(playerID, { signal: controller.signal })
        if (!controller.signal.aborted) setDossier(data)
      } catch (err) {
        if (!controller.signal.aborted) setError(err)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [playerID])

  return { dossier, error, isLoading, isNotFound: error?.status === 404 }
}
