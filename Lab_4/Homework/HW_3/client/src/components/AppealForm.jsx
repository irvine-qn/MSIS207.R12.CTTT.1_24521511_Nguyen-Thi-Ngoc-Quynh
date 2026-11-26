import { REASON_MAX_LENGTH, REASON_MIN_LENGTH } from '../../../shared/appealRules.js'
import { useFormContext } from './AppealFormContext.jsx'
import InputField from './InputField.jsx'
import styles from './AppealForm.module.css'

export default function AppealForm() {
  const { isLocked, isDisabled, isSubmitting, submission, submit } = useFormContext()

  function handleSubmit(event) {
    event.preventDefault()
    submit()
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit} aria-labelledby="appeal-form-title">
      <h3 id="appeal-form-title">Đơn kháng cáo</h3>
      <fieldset className={styles.fieldset} disabled={isDisabled}>
        <legend className={styles.legend}>Thông tin kháng cáo</legend>
        <InputField
          name="reason"
          label="Lý do kháng cáo"
          multiline
          hint={`Từ ${REASON_MIN_LENGTH} đến ${REASON_MAX_LENGTH} ký tự.`}
        />
        <InputField name="evidenceUrl" label="Link bằng chứng" type="url" hint="Bắt buộc dùng HTTPS." />
        <InputField name="contactEmail" label="Email liên hệ" type="email" autoComplete="email" />
        <button type="submit" className={styles.submit}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi kháng cáo'}
        </button>
      </fieldset>
      {isLocked && (
        <p role="alert" className={styles.error}>
          Đã hết hạn kháng cáo, form đã bị khóa.
        </p>
      )}
      <output aria-live="polite" className={submission.state === 'error' ? styles.error : styles.success}>
        {submission.message}
      </output>
    </form>
  )
}
