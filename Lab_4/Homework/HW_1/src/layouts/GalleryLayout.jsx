import { NavLink, Outlet } from 'react-router';
import styles from './GalleryLayout.module.css';

export default function GalleryLayout() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Photo &amp; Evidence Gallery</h1>
        <nav aria-label="Main">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            Gallery
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
