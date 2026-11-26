import { Link } from 'react-router'
import styles from './Home.module.css'

export default function NotFound() {
  return (
    <section role="alert" className={styles.home}>
      <h1>Page not found</h1>
      <Link to="/">Back to Home</Link>
    </section>
  )
}
