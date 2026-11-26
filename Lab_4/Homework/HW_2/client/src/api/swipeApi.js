import { SWIPE_DIRECTIONS } from '../constants/swipe.js'

const API_URL = import.meta.env.VITE_API_URL ?? ''
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i

export function validateSwipe({ profileId, direction }) {
  if (typeof profileId !== 'string' || !OBJECT_ID_PATTERN.test(profileId)) {
    return 'profileId is invalid'
  }
  if (!SWIPE_DIRECTIONS.includes(direction)) {
    return `direction must be one of ${SWIPE_DIRECTIONS.join(', ')}`
  }
  return null
}

export async function getProfiles({ signal } = {}) {
  const response = await fetch(`${API_URL}/api/profiles`, { signal })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

export async function postSwipe(payload) {
  const validationError = validateSwipe(payload)
  if (validationError) {
    throw new Error(validationError)
  }
  const response = await fetch(`${API_URL}/api/swipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`)
  }
  return data
}
