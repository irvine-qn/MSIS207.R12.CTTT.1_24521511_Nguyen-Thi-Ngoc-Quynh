import { createContext, useContext, useMemo, useState } from 'react'
import { normalizeAppeal, validateAppeal } from '../../../shared/appealRules.js'
import { postAppeal } from '../api/tribunalApi.js'

const AppealFormContext = createContext(null)

const FIELD_NAMES = ['playerID', 'reason', 'evidenceUrl', 'contactEmail']
const IDLE_SUBMISSION = { state: 'idle', message: '', serverErrors: {} }

export function AppealFormProvider({ playerID, isLocked = false, children }) {
  const [values, setValues] = useState(() => ({ playerID, reason: '', evidenceUrl: '', contactEmail: '' }))
  const [touched, setTouched] = useState({})
  const [submission, setSubmission] = useState(IDLE_SUBMISSION)

  const errors = useMemo(() => validateAppeal(values), [values])
  const isValid = Object.keys(errors).length === 0
  const isSubmitting = submission.state === 'submitting'
  const isSubmitted = submission.state === 'success'
  const isDisabled = isLocked || isSubmitting || isSubmitted

  function setField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setSubmission((prev) => ({
      ...prev,
      serverErrors: Object.fromEntries(Object.entries(prev.serverErrors).filter(([key]) => key !== name)),
    }))
  }

  function markTouched(name) {
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  function getFieldError(name) {
    return (touched[name] ? errors[name] : undefined) ?? submission.serverErrors[name]
  }

  async function submit() {
    setTouched(Object.fromEntries(FIELD_NAMES.map((name) => [name, true])))
    if (!isValid || isDisabled) return

    setSubmission({ state: 'submitting', message: '', serverErrors: {} })
    try {
      const result = await postAppeal(normalizeAppeal(values))
      setSubmission({ state: 'success', message: `Đã gửi kháng cáo, mã hồ sơ kháng cáo ${result.id}.`, serverErrors: {} })
    } catch (err) {
      setSubmission({ state: 'error', message: err.message, serverErrors: err.errors ?? {} })
    }
  }

  const contextValue = {
    values,
    errors,
    isValid,
    isLocked,
    isDisabled,
    isSubmitting,
    submission,
    setField,
    markTouched,
    getFieldError,
    submit,
  }

  return <AppealFormContext.Provider value={contextValue}>{children}</AppealFormContext.Provider>
}

export function useFormContext() {
  const context = useContext(AppealFormContext)
  if (!context) throw new Error('useFormContext must be used inside AppealFormProvider')
  return context
}
