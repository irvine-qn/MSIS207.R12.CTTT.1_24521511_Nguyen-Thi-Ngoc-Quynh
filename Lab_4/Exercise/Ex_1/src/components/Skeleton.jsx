import styles from './Skeleton.module.css'

export default function Skeleton({ variant = 'page', lines = 4 }) {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading content"
      className={variant === 'detail' ? styles.detail : styles.page}
    >
      <span className={styles.title} />
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className={styles.line} />
      ))}
    </section>
  )
}
