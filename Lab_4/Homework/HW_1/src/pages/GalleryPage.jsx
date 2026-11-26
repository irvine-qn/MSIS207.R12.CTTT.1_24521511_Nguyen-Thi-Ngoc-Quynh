import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../data/photos.js';
import CategoryFilter from '../components/CategoryFilter.jsx';
import PhotoGrid from '../components/PhotoGrid.jsx';
import PhotoLightbox from '../components/PhotoLightbox.jsx';
import styles from './GalleryPage.module.css';

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const thumbRefs = useRef(new Map());
  const lastOpenedId = useRef(searchParams.get('photoId'));

  const category = searchParams.get('category');
  const selectedPhotoId = searchParams.get('photoId');
  const isValidCategory = category === null || CATEGORIES.includes(category);

  const visiblePhotos = useMemo(
    () => (category === null ? PHOTOS : PHOTOS.filter((p) => p.category === category)),
    [category]
  );

  const selectedIndex = visiblePhotos.findIndex((p) => p.id === selectedPhotoId);
  const selectedPhoto = selectedIndex === -1 ? null : visiblePhotos[selectedIndex];

  const updateParams = (photoId, options) => {
    const next = new URLSearchParams(searchParams);
    if (photoId) next.set('photoId', photoId);
    else next.delete('photoId');
    setSearchParams(next, options);
  };

  const registerThumb = (id, node) => {
    if (node) thumbRefs.current.set(id, node);
    else thumbRefs.current.delete(id);
  };

  const openPhoto = (id, options) => {
    lastOpenedId.current = id;
    updateParams(id, options);
  };

  const handleClose = () => {
    if (selectedPhotoId) updateParams(null);
    thumbRefs.current.get(lastOpenedId.current)?.focus();
  };

  const step = (offset) => {
    if (selectedIndex === -1) return;
    const nextIndex = (selectedIndex + offset + visiblePhotos.length) % visiblePhotos.length;
    openPhoto(visiblePhotos[nextIndex].id, { replace: true });
  };

  return (
    <section aria-labelledby="gallery-heading">
      <h2 id="gallery-heading" className={styles.heading}>Photos</h2>
      <CategoryFilter categories={CATEGORIES} activeCategory={category} />

      {!isValidCategory || visiblePhotos.length === 0 ? (
        <output className={styles.empty}>
          {isValidCategory ? 'No photos in this category.' : `Category "${category}" does not exist.`}
        </output>
      ) : (
        <PhotoGrid
          photos={visiblePhotos}
          onSelect={(id) => openPhoto(id)}
          registerThumb={registerThumb}
        />
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        onClose={handleClose}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </section>
  );
}
