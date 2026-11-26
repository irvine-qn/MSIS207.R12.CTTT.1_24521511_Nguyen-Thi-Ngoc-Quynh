import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { FormContext, useFormEngine } from '../context/FormContext.js'
import InputField from '../components/InputField.jsx'
import styles from './Login.module.css'

const loginFields = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    validate: (value) => (value ? '' : 'Username is required'),
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validate: (value) => (value ? '' : 'Password is required'),
  },
]

export default function Login() {
  const form = useFormEngine(loginFields)
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginError, setLoginError] = useState('')
  const from = location.state?.from
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}` : '/'

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    form.touchAll()
    if (!form.isValid) return
    if (login(form.values.username.trim(), form.values.password)) {
      navigate(redirectTo, { replace: true })
    } else {
      setLoginError('Username or password is incorrect')
    }
  }

  return (
    <FormContext.Provider value={form}>
      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <h1>Login</h1>
        {from && <p>Please log in to continue to {from.pathname}.</p>}
        {loginFields.map(({ name, label, type }) => (
          <InputField key={name} name={name} label={label} type={type} />
        ))}
        {loginError && (
          <p role="alert" className={styles.error}>
            {loginError}
          </p>
        )}
        <button type="submit">Log in</button>
      </form>
    </FormContext.Provider>
  )
}
