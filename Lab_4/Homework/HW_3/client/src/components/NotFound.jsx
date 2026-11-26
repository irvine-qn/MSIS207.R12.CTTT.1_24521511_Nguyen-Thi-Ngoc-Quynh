import { Link } from 'react-router'
import styles from './Panel.module.css'

export default function NotFound({ message = 'Không tìm thấy trang hoặc hồ sơ bạn yêu cầu.' }) {
  return (
    <section className={styles.panel} role="alert" aria-labelledby="not-found-title">
      <h1 id="not-found-title">404</h1>
      <p>{message}</p>
      <Link to="/">Về trang chủ</Link>
    </section>
  )
}
