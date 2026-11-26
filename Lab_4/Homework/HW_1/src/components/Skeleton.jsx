import styles from './Skeleton.module.css';

export default function Skeleton({ count = 6 }) {
  return (
    <section aria-busy="true" aria-live="polite" aria-label="Loading gallery">
      <ul className={styles.grid}>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className={styles.tile} />
        ))}
      </ul>
    </section>
  );
}
