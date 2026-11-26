import { useMemo, useState } from 'react'
import { SCORE_WEIGHTS } from '../constants/swipe.js'

export function useSwipeHistory(profiles) {
  const [history, setHistory] = useState([])

  const currentProfile = profiles[history.length] ?? null

  const score = useMemo(
    () => history.reduce((total, action) => total + (SCORE_WEIGHTS[action.direction] ?? 0), 0),
    [history]
  )

  function swipe(direction) {
    if (!currentProfile) {
      return null
    }
    const action = { profileId: currentProfile._id, direction }
    setHistory((prev) => [...prev, action])
    return action
  }

  function undoLastSwipe() {
    setHistory((prev) => prev.slice(0, -1))
  }

  return { history, currentProfile, score, swipe, undoLastSwipe }
}
