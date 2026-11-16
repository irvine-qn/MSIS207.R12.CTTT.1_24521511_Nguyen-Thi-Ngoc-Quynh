import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import { people } from '../data/people.js'
import Skeleton from '../components/Skeleton.jsx'
import styles from './PeopleLayout.module.css'

export default function PeopleLayout() {
  return (
    <section className={styles.grid}>
      <nav aria-label="People" className={styles.list}>
        <h2 className={styles.heading}>People</h2>
        <ul>
          {people.map((person) => (
            <li key={person.id}>
              <NavLink
                to={person.id}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {person.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Suspense fallback={<Skeleton variant="detail" />}>
        <Outlet />
      </Suspense>
    </section>
  )
}
