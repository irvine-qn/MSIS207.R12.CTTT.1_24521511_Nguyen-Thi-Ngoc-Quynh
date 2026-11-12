import styles from './SquadRow.module.css'

function SquadRow({ squad }) {
  return (
    <article className={styles.squad}>
      <h3 className={styles.name}>{squad.squadName}</h3>
      <dl className={styles.stats}>
        <dt>WWCD</dt>
        <dd>{squad.wwcdCount}</dd>
        <dt>Placement</dt>
        <dd>{squad.placementPts}</dd>
        <dt>Kill</dt>
        <dd>{squad.killPts}</dd>
      </dl>
    </article>
  )
}

export default SquadRow
