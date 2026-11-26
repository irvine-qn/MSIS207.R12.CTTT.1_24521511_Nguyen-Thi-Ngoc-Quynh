import { useEffect, useState } from 'react'

const TICK_MS = 1000

function getRemaining(deadline) {
  if (!Number.isFinite(deadline)) return 0
  return Math.max(0, deadline - Date.now())
}

export function useAppealSlaTimer(deadline) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline))

  useEffect(() => {
    const sync = () => setRemaining(getRemaining(deadline))
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') sync()
    }

    sync()
    const intervalId = setInterval(sync, TICK_MS)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [deadline])

  return { remaining, isExpired: remaining <= 0 }
}
