import { useParams } from 'react-router'
import { useDossier } from '../hooks/useDossier.js'
import Skeleton from './Skeleton.jsx'
import NotFound from './NotFound.jsx'
import DossierDetails from './DossierDetails.jsx'
import DisproportionalityMatrix from './DisproportionalityMatrix.jsx'
import AppealSection from './AppealSection.jsx'
import panel from './Panel.module.css'
import styles from './DossierView.module.css'

export default function DossierView() {
  const { playerID } = useParams()
  const { dossier, error, isLoading, isNotFound } = useDossier(playerID)

  if (isLoading) return <Skeleton />
  if (isNotFound) return <NotFound message={`Không tồn tại hồ sơ cho người chơi "${playerID}".`} />
  if (error) {
    return (
      <section className={panel.panel} role="alert">
        <p>Không tải được hồ sơ: {error.message}</p>
      </section>
    )
  }

  return (
    <article className={styles.layout} aria-labelledby="dossier-title">
      <header className={styles.header}>
        <h1 id="dossier-title">Hồ sơ của {dossier.name}</h1>
      </header>
      <DossierDetails dossier={dossier} />
      <section className={styles.content} aria-label="Phân tích và kháng cáo">
        <DisproportionalityMatrix dossier={dossier} />
        <AppealSection key={dossier.playerID} playerID={dossier.playerID} deadline={dossier.appealDeadline} />
      </section>
    </article>
  )
}
