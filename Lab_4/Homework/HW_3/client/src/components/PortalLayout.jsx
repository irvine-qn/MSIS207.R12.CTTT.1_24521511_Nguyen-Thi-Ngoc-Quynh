import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import { PLAYERS } from '../constants/players.js'
import Skeleton from './Skeleton.jsx'
import styles from './PortalLayout.module.css'

export default function PortalLayout() {
  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.brand}>Fair-Play Appeal Tribunal</p>
        <nav aria-label="Hồ sơ người chơi">
          <ul className={styles.navList}>
            {PLAYERS.map((player) => (
              <li key={player.playerID}>
                <NavLink
                  to={`/dossier/${player.playerID}`}
                  className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                >
                  {player.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Suspense fallback={<Skeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </section>
  )
}
