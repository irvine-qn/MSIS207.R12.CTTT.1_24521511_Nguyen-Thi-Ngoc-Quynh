import { sumEffortByActor } from '../utils/effortScore.js'
import styles from './EffortSummary.module.css'

const ACTOR_LABELS = Object.freeze({ EM: 'Em', AI_DO: 'Ai đó' })

function EffortSummary({ effortLog = [] }) {
  const totals = sumEffortByActor(effortLog)

  return (
    <>
      <dl className={styles.summary}>
        <dt>Tổng effort của Em</dt>
        <dd>{totals.EM}</dd>
        <dt>Tổng effort của Ai đó</dt>
        <dd>{totals.AI_DO}</dd>
      </dl>
      <ol className={styles.log}>
        {effortLog.map((signal) => (
          <li key={signal.id}>
            {ACTOR_LABELS[signal.actor]}: {signal.steps} x {signal.multiplier} = {signal.steps * signal.multiplier}
          </li>
        ))}
      </ol>
    </>
  )
}

export default EffortSummary
