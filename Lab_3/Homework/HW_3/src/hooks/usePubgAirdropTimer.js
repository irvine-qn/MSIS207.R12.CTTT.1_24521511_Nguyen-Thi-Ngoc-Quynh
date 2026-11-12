import { useEffect, useState } from 'react'
import { getDropPhase } from '../utils/getDropPhase.js'

const getRemainingMs = (targetEpochMs) => Math.max(0, targetEpochMs - Date.now())

export function usePubgAirdropTimer(targetEpochMs) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(targetEpochMs))

  useEffect(() => {
    let timerId = 0
    const tick = () => {
      clearTimeout(timerId)
      const next = getRemainingMs(targetEpochMs)
      setRemainingMs(next)
      if (next > 0) {
        timerId = setTimeout(tick, next % 1000 || 1000)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick()
    }

    tick()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timerId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [targetEpochMs])

  const phase = getDropPhase({ warmupRemainingMs: remainingMs })

  return { remainingMs, phase }
}
