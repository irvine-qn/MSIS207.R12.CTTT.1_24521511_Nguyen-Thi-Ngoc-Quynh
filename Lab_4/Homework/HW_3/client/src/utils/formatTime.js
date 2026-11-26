const pad = (value) => String(value).padStart(2, '0')

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days} ngày ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatDateTime(value) {
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}
