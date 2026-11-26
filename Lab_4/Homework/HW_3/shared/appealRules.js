export const REASON_MIN_LENGTH = 30
export const REASON_MAX_LENGTH = 1000

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateAppeal(values = {}) {
  const errors = {}
  const playerID = asTrimmedString(values.playerID)
  const reason = asTrimmedString(values.reason)
  const evidenceUrl = asTrimmedString(values.evidenceUrl)
  const contactEmail = asTrimmedString(values.contactEmail)

  if (!playerID) errors.playerID = 'Thiếu mã người chơi.'

  if (!reason) errors.reason = 'Vui lòng nhập lý do kháng cáo.'
  else if (reason.length < REASON_MIN_LENGTH) errors.reason = `Lý do cần ít nhất ${REASON_MIN_LENGTH} ký tự.`
  else if (reason.length > REASON_MAX_LENGTH) errors.reason = `Lý do không vượt quá ${REASON_MAX_LENGTH} ký tự.`

  if (!evidenceUrl) errors.evidenceUrl = 'Vui lòng nhập link bằng chứng.'
  else if (!isHttpsUrl(evidenceUrl)) errors.evidenceUrl = 'Link bằng chứng phải là URL HTTPS hợp lệ.'

  if (!contactEmail) errors.contactEmail = 'Vui lòng nhập email liên hệ.'
  else if (!EMAIL_PATTERN.test(contactEmail)) errors.contactEmail = 'Email liên hệ không hợp lệ.'

  return errors
}

export function normalizeAppeal(values = {}) {
  return {
    playerID: asTrimmedString(values.playerID),
    reason: asTrimmedString(values.reason),
    evidenceUrl: asTrimmedString(values.evidenceUrl),
    contactEmail: asTrimmedString(values.contactEmail),
  }
}
