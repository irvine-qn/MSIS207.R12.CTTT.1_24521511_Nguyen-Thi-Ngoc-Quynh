import styles from './Panel.module.css'

export default function PortalHome() {
  return (
    <section className={styles.panel} aria-labelledby="portal-home-title">
      <h1 id="portal-home-title">Hội đồng kháng cáo Fair-Play</h1>
      <p>Chọn một người chơi trên thanh điều hướng để xem hồ sơ và gửi kháng cáo.</p>
    </section>
  )
}
