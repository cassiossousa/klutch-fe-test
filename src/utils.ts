import {DateTime} from 'luxon'

export function formatDate(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('MM/dd/yyyy')
}

export function formatDateTime(timestamp: number): string {
  return DateTime.fromMillis(timestamp).toFormat('MM/dd/yyyy h:mm a')
}

export function relativeTime(timestamp: number): string {
  const dt = DateTime.fromMillis(timestamp)
  const now = DateTime.now()
  const diff = now.diff(dt, ['days', 'hours', 'minutes'])

  const daysFloor = Math.floor(diff.days)
  if (daysFloor > 1)   return `${daysFloor} days ago`
  if (daysFloor === 1) return `1 day ago`

  const hoursFloor = Math.floor(diff.hours)
  if (hoursFloor > 1)   return `${hoursFloor} hours ago`
  if (hoursFloor === 1) return `1 hour ago`

  const minutesFloor = Math.floor(diff.minutes)
  if (minutesFloor > 1)   return `${minutesFloor} minutes ago`
  if (minutesFloor === 1) return `1 minute ago`

  return 'Just now'
}

export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return '—'
  const dt = DateTime.fromISO(dateString)
  if (!dt.isValid) return '—'
  return dt.toFormat('MM/dd/yyyy')
}
