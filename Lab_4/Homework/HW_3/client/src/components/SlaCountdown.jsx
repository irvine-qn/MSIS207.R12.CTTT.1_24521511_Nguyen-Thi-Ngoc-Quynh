import { formatDateTime, formatDuration } from '../utils/formatTime.js'
import styles from './SlaCountdown.module.css'

export default function SlaCountdown({ deadline, remaining, isExpired }) {
  return (
    <section className={styles.box} aria-labelledby="sla-title">
      <h3 id="sla-title">Thời hạn kháng cáo</h3>
      <p>
        Hạn chót: <time dateTime={new Date(deadline).toISOString()}>{formatDateTime(deadline)}</time>
      </p>
      <output aria-live="polite" aria-atomic="true" className={isExpired ? styles.expired : styles.remaining}>
        {isExpired ? 'Đã hết hạn' : `Còn lại ${formatDuration(remaining)}`}
      </output>
    </section>
  )
}
