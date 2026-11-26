import { Suspense, useId } from 'react'
import { NavLink, Outlet, useSearchParams } from 'react-router'
import { people } from '../data/people.js'
import Skeleton from '../components/Skeleton.jsx'
import styles from './PeopleLayout.module.css'

export default function PeopleLayout() {
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const keyword = query.trim().toLowerCase()
  const filteredPeople = people.filter((person) => person.name.toLowerCase().includes(keyword))

  const handleSearch = (event) => {
    const value = event.target.value
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set('q', value)
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true }
    )
  }

  return (
    <section className={styles.grid}>
      <nav aria-label="People" className={styles.list}>
        <h2 className={styles.heading}>People</h2>
        <p className={styles.search}>
          <label htmlFor={searchId}>Search by name</label>
          <input id={searchId} type="search" value={query} onChange={handleSearch} />
        </p>
        {filteredPeople.length === 0 ? (
          <p>No singer matches "{query}".</p>
        ) : (
          <ul>
            {filteredPeople.map((person) => (
              <li key={person.id}>
                <NavLink
                  to={{ pathname: person.id, search: searchParams.toString() }}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  {person.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
      <Suspense fallback={<Skeleton variant="detail" />}>
        <Outlet />
      </Suspense>
    </section>
  )
}
