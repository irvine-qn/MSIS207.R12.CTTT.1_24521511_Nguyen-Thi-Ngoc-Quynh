import styles from './PhotoGrid.module.css';

export default function PhotoGrid({ photos, onSelect, registerThumb }) {
  return (
    <ul className={styles.grid}>
      {photos.map((photo) => (
        <li key={photo.id}>
          <button
            type="button"
            className={styles.thumb}
            ref={(node) => registerThumb(photo.id, node)}
            onClick={() => onSelect(photo.id)}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              className={styles.image}
            />
            <span className={styles.caption}>{photo.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
