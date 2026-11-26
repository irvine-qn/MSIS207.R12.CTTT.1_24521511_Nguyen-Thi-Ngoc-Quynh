import { useRef, useState } from 'react'
import { useProfiles } from '../hooks/useProfiles.js'
import { useSwipeHistory } from '../hooks/useSwipeHistory.js'
import { postSwipe } from '../api/swipeApi.js'
import { KEY_ACTIONS, SWIPE_THRESHOLD } from '../constants/swipe.js'
import SwipeCard from './SwipeCard.jsx'
import Skeleton from './Skeleton.jsx'
import styles from './SwipeDeck.module.css'

export default function SwipeDeck() {
  const { data: profiles, loading, error } = useProfiles()
  const { history, currentProfile, score, swipe, undoLastSwipe } = useSwipeHistory(profiles)
  const [saveError, setSaveError] = useState(null)
  const startPos = useRef(null)

  async function handleSwipe(direction) {
    const action = swipe(direction)
    if (!action) {
      return
    }
    try {
      await postSwipe(action)
      setSaveError(null)
    } catch (err) {
      setSaveError(err.message)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      undoLastSwipe()
      return
    }
    const direction = KEY_ACTIONS[event.key]
    if (direction) {
      event.preventDefault()
      handleSwipe(direction)
    }
  }

  function handlePointerDown(event) {
    startPos.current = { x: event.clientX, y: event.clientY }
  }

  function handlePointerUp(event) {
    if (startPos.current === null) {
      return
    }
    const dx = event.clientX - startPos.current.x
    const dy = event.clientY - startPos.current.y
    startPos.current = null
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      handleSwipe(dx > 0 ? 'right' : 'left')
    } else if (-dy > SWIPE_THRESHOLD) {
      handleSwipe('up')
    }
  }

  function handlePointerCancel() {
    startPos.current = null
  }

  if (loading) {
    return <Skeleton />
  }

  if (error) {
    return (
      <p role="alert" className={styles.error}>
        {error}
      </p>
    )
  }

  return (
    <section className={styles.deck} aria-labelledby="deck-title">
      <header className={styles.header}>
        <h1 id="deck-title" className={styles.title}>
          Hen Ho Nhung Khong Yeu
        </h1>
        <p className={styles.score}>
          Score: <output aria-live="polite">{score}</output>
        </p>
      </header>

      <section
        className={styles.stage}
        tabIndex={0}
        aria-label="Swipe area. Use arrow keys to swipe and Backspace to undo"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {currentProfile ? (
          <SwipeCard key={currentProfile._id} profile={currentProfile} />
        ) : (
          <p className={styles.empty}>No more profiles</p>
        )}
      </section>

      <nav className={styles.actions} aria-label="Swipe actions">
        <button type="button" className={styles.button} aria-label="Dislike" onClick={() => handleSwipe('left')} disabled={!currentProfile}>
          ✕
        </button>
        <button type="button" className={styles.button} aria-label="Undo last swipe" onClick={undoLastSwipe} disabled={history.length === 0}>
          ↺
        </button>
        <button type="button" className={styles.button} aria-label="Super like" onClick={() => handleSwipe('up')} disabled={!currentProfile}>
          ★
        </button>
        <button type="button" className={styles.button} aria-label="Like" onClick={() => handleSwipe('right')} disabled={!currentProfile}>
          ♥
        </button>
      </nav>

      {saveError && (
        <p role="alert" className={styles.error}>
          {saveError}
        </p>
      )}
    </section>
  )
}
