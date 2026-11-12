import { useId } from 'react'
import styles from './CrateCard.module.css'

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const BUTTON_LABELS = {
  WARMUP: 'Chưa mở',
  AIRDROP_LIVE: 'Claim ngay',
  LOOTED_OUT: 'Đã hết hàng',
  EXPIRED: 'Đã kết thúc',
}

function CrateCard({ drop, phase, onClaim }) {
  const titleId = useId()

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>{drop.title}</h3>
      <dl className={styles.details}>
        <dt>Giá</dt>
        <dd>{vndFormatter.format(drop.priceVnd)}</dd>
        <dt>Còn lại</dt>
        <dd>{drop.remainingStock}</dd>
      </dl>
      <button
        type="button"
        className={styles.claimButton}
        disabled={phase !== 'AIRDROP_LIVE'}
        onClick={() => onClaim(drop.id)}
      >
        {BUTTON_LABELS[phase]}
      </button>
    </article>
  )
}

export default CrateCard
