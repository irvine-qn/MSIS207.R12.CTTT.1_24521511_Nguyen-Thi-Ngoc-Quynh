import { useId } from 'react'
import { useFormContext } from './AppealFormContext.jsx'
import styles from './AppealForm.module.css'

export default function InputField({ name, label, type = 'text', multiline = false, hint = '', autoComplete = 'off' }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const { values, setField, markTouched, getFieldError } = useFormContext()
  const error = getFieldError(name)
  const describedBy = [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined

  const controlProps = {
    id,
    name,
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
    onBlur: () => markTouched(name),
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    className: styles.control,
    autoComplete,
  }

  return (
    <p className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {multiline ? <textarea rows={5} {...controlProps} /> : <input type={type} {...controlProps} />}
      {hint && (
        <small id={hintId} className={styles.hint}>
          {hint}
        </small>
      )}
      {error && (
        <small id={errorId} role="alert" className={styles.error}>
          {error}
        </small>
      )}
    </p>
  )
}
