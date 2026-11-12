import { useId, useState } from 'react'
import styles from './EffortForm.module.css'

function readNumber(e) {
  const value = e.target.valueAsNumber
  return Number.isNaN(value) ? null : value
}

function EffortForm({ onLogEffort = () => {} }) {
  const actorId = useId()
  const stepsId = useId()
  const multiplierId = useId()
  const [actor, setActor] = useState('EM')
  const [steps, setSteps] = useState(null)
  const [multiplier, setMultiplier] = useState(null)

  const isValid = steps !== null && steps > 0 && multiplier !== null && multiplier > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    onLogEffort({ id: crypto.randomUUID(), actor, steps, multiplier })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor={actorId}>Ai cố gắng</label>
      <select id={actorId} value={actor} onChange={(e) => setActor(e.target.value)}>
        <option value="EM">Em</option>
        <option value="AI_DO">Ai đó</option>
      </select>

      <label htmlFor={stepsId}>Số bước</label>
      <input
        id={stepsId}
        type="number"
        min="1"
        step="1"
        value={steps ?? ''}
        onChange={(e) => setSteps(readNumber(e))}
      />

      <label htmlFor={multiplierId}>Hệ số</label>
      <input
        id={multiplierId}
        type="number"
        min="0.01"
        step="0.01"
        value={multiplier ?? ''}
        onChange={(e) => setMultiplier(readNumber(e))}
      />

      <button type="submit" className={styles.submit} disabled={!isValid}>
        Ghi nhận effort
      </button>
    </form>
  )
}

export default EffortForm
