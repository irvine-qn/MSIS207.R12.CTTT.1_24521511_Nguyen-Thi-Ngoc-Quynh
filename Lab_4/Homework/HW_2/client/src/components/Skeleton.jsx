import styles from './Skeleton.module.css'

export default function Skeleton() {
  return (
    <section aria-busy="true" aria-label="Loading profiles" className={styles.card}>
      <span className={styles.image} />
      <span className={styles.title} />
      <span className={styles.line} />
    </section>
  )
}
