import styles from './Skeleton.module.css'

export default function Skeleton({ label = 'Đang tải hồ sơ' }) {
  return (
    <section aria-busy="true" aria-label={label} className={styles.card}>
      <span className={styles.title} />
      <span className={styles.line} />
      <span className={styles.line} />
      <span className={styles.block} />
    </section>
  )
}
