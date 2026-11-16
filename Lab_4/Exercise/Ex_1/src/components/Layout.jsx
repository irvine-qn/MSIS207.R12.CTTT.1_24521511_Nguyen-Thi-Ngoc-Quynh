import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import Skeleton from './Skeleton.jsx'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/people', label: 'People', end: false },
]

export default function Layout() {
  return (
    <>
      <header className={styles.header}>
        <nav aria-label="Main" className={styles.nav}>
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={styles.main}>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
