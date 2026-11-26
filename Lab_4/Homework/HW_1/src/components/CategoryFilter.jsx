import { Link } from 'react-router';
import styles from './CategoryFilter.module.css';

export default function CategoryFilter({ categories, activeCategory }) {
  const items = [{ value: null, label: 'All' }, ...categories.map((c) => ({ value: c, label: c }))];

  return (
    <nav aria-label="Category filter">
      <ul className={styles.list}>
        {items.map(({ value, label }) => {
          const isActive = value === activeCategory;
          return (
            <li key={label}>
              <Link
                to={value ? `?category=${encodeURIComponent(value)}` : '?'}
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
