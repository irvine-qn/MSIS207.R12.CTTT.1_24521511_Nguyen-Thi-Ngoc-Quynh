import { useFormContext } from '../context/FormContext.js'
import styles from './ShowData.module.css'

export default function ShowData() {
  const { fields, values, isValid } = useFormContext()

  return (
    <section aria-label="Form data" className={styles.card}>
      <h2>Form data</h2>
      <dl className={styles.list}>
        {fields.map(({ name, label }) => (
          <div key={name} className={styles.row}>
            <dt>{label}</dt>
            <dd>{values[name] || '-'}</dd>
          </div>
        ))}
        <div className={styles.row}>
          <dt>Valid</dt>
          <dd>
            <output>{isValid ? 'Yes' : 'No'}</output>
          </dd>
        </div>
      </dl>
    </section>
  )
}
