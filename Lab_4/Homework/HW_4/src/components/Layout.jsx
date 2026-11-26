import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import Skeleton from './Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Layout.module.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/people', label: 'People', end: false },
  { to: '/form', label: 'Form', end: false },
  { to: '/forum/general', label: 'Forum', end: false },
]

export default function Layout() {
  const { user, logout } = useAuth()

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
        {user ? (
          <p className={styles.user}>
            <span>{user.name}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </p>
        ) : (
          <NavLink to="/login" className={styles.login}>
            Login
          </NavLink>
        )}
      </header>
      <main className={styles.main}>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
