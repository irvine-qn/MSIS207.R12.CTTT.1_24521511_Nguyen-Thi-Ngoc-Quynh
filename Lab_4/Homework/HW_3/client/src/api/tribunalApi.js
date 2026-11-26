const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(body?.error ?? `Request failed with status ${response.status}`)
    error.status = response.status
    error.errors = body?.errors ?? {}
    throw error
  }
  return body
}

export function fetchDossier(playerID, { signal } = {}) {
  return request(`/api/dossiers/${encodeURIComponent(playerID)}`, { signal })
}

export function postAppeal(payload, { signal } = {}) {
  return request('/api/appeals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
}
