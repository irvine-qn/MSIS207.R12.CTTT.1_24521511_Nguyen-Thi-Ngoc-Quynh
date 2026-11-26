import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js'
import { AppealFormProvider } from './AppealFormContext.jsx'
import AppealForm from './AppealForm.jsx'
import SlaCountdown from './SlaCountdown.jsx'
import panel from './Panel.module.css'

export default function AppealSection({ playerID, deadline }) {
  const { remaining, isExpired } = useAppealSlaTimer(deadline)

  return (
    <section className={panel.panel} aria-labelledby="appeal-title">
      <h2 id="appeal-title">Kháng cáo</h2>
      <SlaCountdown deadline={deadline} remaining={remaining} isExpired={isExpired} />
      <AppealFormProvider playerID={playerID} isLocked={isExpired}>
        <AppealForm />
      </AppealFormProvider>
    </section>
  )
}
