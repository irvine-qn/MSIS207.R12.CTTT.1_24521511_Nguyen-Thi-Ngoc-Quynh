import { useEffect, useRef } from 'react';
import styles from './PhotoLightbox.module.css';

export default function PhotoLightbox({ photo, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null);
  const selectedPhotoId = photo?.id ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedPhotoId && !dialog.open) dialog.showModal();
    if (!selectedPhotoId && dialog.open) dialog.close();
  }, [selectedPhotoId]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') onPrev();
    if (event.key === 'ArrowRight') onNext();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="lightbox-title"
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      {photo && (
        <article className={styles.content}>
          <header className={styles.toolbar}>
            <h2 id="lightbox-title" className={styles.title}>{photo.title}</h2>
            <button
              type="button"
              className={styles.button}
              aria-label="Close photo"
              onClick={() => dialogRef.current?.close()}
            >
              ✕
            </button>
          </header>
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className={styles.image}
          />
          <footer className={styles.controls}>
            <button type="button" className={styles.button} aria-label="Previous photo" onClick={onPrev}>
              ←
            </button>
            <button type="button" className={styles.button} aria-label="Next photo" onClick={onNext}>
              →
            </button>
          </footer>
        </article>
      )}
    </dialog>
  );
}
