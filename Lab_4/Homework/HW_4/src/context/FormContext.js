import { createContext, useContext, useMemo, useState } from 'react'

export const FormContext = createContext(null)

export function useFormEngine(fields) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map(({ name }) => [name, '']))
  )
  const [touched, setTouched] = useState({})

  const errors = useMemo(
    () =>
      Object.fromEntries(
        fields
          .map(({ name, validate }) => [name, validate(values[name].trim(), values)])
          .filter(([, message]) => message)
      ),
    [fields, values]
  )

  const isValid = Object.keys(errors).length === 0

  const setField = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))
  const touchField = (name) => setTouched((prev) => ({ ...prev, [name]: true }))
  const touchAll = () => setTouched(Object.fromEntries(fields.map(({ name }) => [name, true])))

  return { fields, values, errors, touched, isValid, setField, touchField, touchAll }
}

export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used inside FormContext.Provider')
  }
  return context
}
