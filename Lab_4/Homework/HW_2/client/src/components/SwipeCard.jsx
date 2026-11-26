import styles from './SwipeCard.module.css'

export default function SwipeCard({ profile }) {
  const { name, age, bio, imageUrl } = profile
  return (
    <article className={styles.card} aria-label={`${name}, ${age}`}>
      <img
        className={styles.image}
        src={imageUrl}
        alt={`Profile photo of ${name}`}
        width="600"
        height="800"
        draggable="false"
      />
      <header className={styles.info}>
        <h2 className={styles.name}>
          {name}, {age}
        </h2>
        <p className={styles.bio}>{bio}</p>
      </header>
    </article>
  )
}
