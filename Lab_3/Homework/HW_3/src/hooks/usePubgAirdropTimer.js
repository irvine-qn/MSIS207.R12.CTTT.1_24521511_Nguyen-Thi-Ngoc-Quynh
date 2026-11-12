import { useEffect, useState } from 'react'

const getRemainingMs = (targetEpochMs) => Math.max(0, targetEpochMs - Date.now())

export function usePubgAirdropTimer(targetEpochMs) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(targetEpochMs))

  useEffect(() => {
    let timerId = 0
    const tick = () => {
      const next = getRemainingMs(targetEpochMs)
      setRemainingMs(next)
      if (next > 0) {
        timerId = setTimeout(tick, next % 1000 || 1000)
      }
    }

    tick()

    return () => clearTimeout(timerId)
  }, [targetEpochMs])

  return { remainingMs }
}
