import { useId } from 'react'
import { usePubgAirdropTimer } from '../hooks/usePubgAirdropTimer.js'
import styles from './AirdropCountdown.module.css'

const PHASE_LABELS = {
  WARMUP: 'Sắp thả hàng',
  AIRDROP_LIVE: 'Airdrop đang mở',
  LOOTED_OUT: 'Đã hết hàng',
  EXPIRED: 'Đã kết thúc',
}

const pad = (value) => String(value).padStart(2, '0')

const formatClock = (remainingMs) => {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function AirdropCountdown({ targetEpochMs }) {
  const headingId = useId()
  const { remainingMs, phase } = usePubgAirdropTimer(targetEpochMs)
  const totalSeconds = Math.ceil(remainingMs / 1000)

  return (
    <section className={styles.countdown} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>Airdrop Countdown</h2>
      <time className={styles.clock} dateTime={`PT${totalSeconds}S`} aria-hidden="true">
        {formatClock(remainingMs)}
      </time>
      <output className={styles.phase} role="status" data-phase={phase}>
        {PHASE_LABELS[phase]}
      </output>
      <p className={styles.target}>
        Thả lúc{' '}
        <time dateTime={new Date(targetEpochMs).toISOString()}>
          {new Date(targetEpochMs).toLocaleTimeString('vi-VN')}
        </time>
      </p>
    </section>
  )
}

export default AirdropCountdown
