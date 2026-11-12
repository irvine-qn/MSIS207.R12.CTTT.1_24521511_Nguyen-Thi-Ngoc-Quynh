import styles from './Sequencer.module.css'

export default function Sequencer({ status, onRecord, onPlay, onStop }) {
  return (
    <section aria-labelledby="sequencer-title" className={styles.sequencer}>
      <h2 id="sequencer-title">Sequencer</h2>
      <output aria-live="polite" role="status">{status}</output>
      <div className={styles.controls}>
        <button onClick={onRecord} type="button">Record</button>
        <button onClick={onPlay} type="button">Play</button>
        <button onClick={onStop} type="button">Stop</button>
      </div>
    </section>
  )
}
