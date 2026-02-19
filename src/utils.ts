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
  
  if (diff.days > 1) {
    return `${Math.floor(diff.days)} days ago`
  } else if (diff.hours > 1) {
    return `${Math.floor(diff.hours)} hours ago`
  } else if (diff.minutes > 1) {
    return `${Math.floor(diff.minutes)} minutes ago`
  } else {
    return 'Just now'
  }
}

export function formatDisplayDate(dateString: string | null): string {
  if (!dateString) return '—'
  const dt = DateTime.fromISO(dateString)
  if (!dt.isValid) return '—'
  return dt.toFormat('MM/dd/yyyy')
}
