import { formatDateTime } from '../utils/formatTime.js'
import panel from './Panel.module.css'
import styles from './DossierDetails.module.css'

export default function DossierDetails({ dossier }) {
  return (
    <section className={panel.panel} aria-labelledby="dossier-details-title">
      <h2 id="dossier-details-title">Thông tin hồ sơ</h2>
      <dl className={styles.list}>
        <dt>Mã người chơi</dt>
        <dd>{dossier.playerID}</dd>
        <dt>Tên</dt>
        <dd>{dossier.name}</dd>
        <dt>Đội</dt>
        <dd>{dossier.team}</dd>
        <dt>Số vi phạm</dt>
        <dd>{dossier.violations.length}</dd>
        <dt>Hạn kháng cáo</dt>
        <dd>
          <time dateTime={new Date(dossier.appealDeadline).toISOString()}>{formatDateTime(dossier.appealDeadline)}</time>
        </dd>
      </dl>
    </section>
  )
}
