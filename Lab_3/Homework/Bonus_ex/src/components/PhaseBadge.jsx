import styles from './PhaseBadge.module.css'

const PHASE_LABELS = Object.freeze({
  FRIENDS: 'Bạn bè',
  DATING_NO_LOVE: 'Hẹn hò nhưng không yêu, chắc chắn bạn là LỐP ;)',
  OFFICIAL_LOVE: 'Có danh phận rồi nè',
  GHOSTED_EXIT: 'Bị ghost, rời đi',
})

function PhaseBadge({ phase = 'FRIENDS' }) {
  return (
    <p className={`${styles.badge} ${styles[phase] ?? ''}`}>
      <span className={styles.caption}>Trạng thái</span>
      <strong>{PHASE_LABELS[phase] ?? phase}</strong>
    </p>
  )
}

export default PhaseBadge
