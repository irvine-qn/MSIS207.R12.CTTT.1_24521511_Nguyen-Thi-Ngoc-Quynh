import { useId, useRef } from 'react'
import { FormContext, useFormEngine } from '../context/FormContext.js'
import InputField from '../components/InputField.jsx'
import ShowData from '../components/ShowData.jsx'
import styles from './SimpleForm.module.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formFields = [
  {
    name: 'fullName',
    label: 'Full name',
    type: 'text',
    validate: (value) => (value.length < 2 ? 'Full name must have at least 2 characters' : ''),
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validate: (value) => (EMAIL_PATTERN.test(value) ? '' : 'Email is not valid'),
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validate: (value) => (value.length < 8 ? 'Password must have at least 8 characters' : ''),
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    validate: (value, values) => {
      if (!value) return 'Please confirm your password'
      return value === values.password.trim() ? '' : 'Passwords do not match'
    },
  },
]

export default function SimpleForm() {
  const form = useFormEngine(formFields)
  const dialogRef = useRef(null)
  const dialogTitleId = useId()

  const handleSubmit = (event) => {
    event.preventDefault()
    form.touchAll()
    if (form.isValid) {
      dialogRef.current?.showModal()
    }
  }

  return (
    <FormContext.Provider value={form}>
      <section className={styles.grid}>
        <form noValidate onSubmit={handleSubmit} className={styles.form}>
          <h1>Simple form</h1>
          {formFields.map(({ name, label, type }) => (
            <InputField key={name} name={name} label={label} type={type} />
          ))}
          <button type="submit">Submit</button>
        </form>
        <ShowData />
      </section>
      <dialog ref={dialogRef} aria-labelledby={dialogTitleId} className={styles.dialog}>
        <h2 id={dialogTitleId}>Form submitted successfully</h2>
        <p>Thank you, {form.values.fullName.trim()}. Your information has been received.</p>
        <form method="dialog">
          <button type="submit">Close</button>
        </form>
      </dialog>
    </FormContext.Provider>
  )
}
