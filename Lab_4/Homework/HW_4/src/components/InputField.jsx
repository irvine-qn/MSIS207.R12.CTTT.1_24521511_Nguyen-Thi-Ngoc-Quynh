import { useId } from 'react'
import { useFormContext } from '../context/FormContext.js'
import styles from './InputField.module.css'

export default function InputField({ name, label, type = 'text' }) {
  const id = useId()
  const errorId = `${id}-error`
  const { values, errors, touched, setField, touchField } = useFormContext()
  const error = touched[name] ? errors[name] : undefined

  return (
    <p className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={values[name]}
        onChange={(event) => setField(name, event.target.value)}
        onBlur={() => touchField(name)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </p>
  )
}
