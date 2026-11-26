import styles from './Skeleton.module.css'

export default function Skeleton({ variant = 'page', lines = 4 }) {
  if (variant === 'people') {
    return (
      <section aria-busy="true" aria-live="polite" aria-label="Loading content" className={styles.grid}>
        <span className={styles.list}>
          <span className={styles.title} />
          {Array.from({ length: lines }, (_, index) => (
            <span key={index} className={styles.line} />
          ))}
        </span>
        <span className={styles.detail}>
          <span className={styles.title} />
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} className={styles.line} />
          ))}
        </span>
      </section>
    )
  }

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
