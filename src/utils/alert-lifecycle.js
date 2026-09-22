// Helpers for the tracked alert items ListAlertResults returns: one row per alert item with a
// Status (Open, Acknowledged, Snoozed, Resolved) and the ISO timestamps the backend keeps.

export const ALERT_STATUS_ORDER = [
  'Open',
  'Acknowledged',
  'Snoozed',
  'Resolved',
]

export const ACTIVE_ALERT_STATUSES = ['Open', 'Acknowledged']

export const FLAP_THRESHOLD = 3

const parseIso = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// "just now", "5m ago", "3h ago", "2d ago". Empty string when the value is missing or invalid.
export const describeAge = (value, now = new Date()) => {
  const date = parseIso(value)
  if (!date) return ''
  const seconds = Math.max(
    0,
    Math.round((now.getTime() - date.getTime()) / 1000)
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export const isFlapping = (item) =>
  Number(item?.ReopenCount ?? 0) >= FLAP_THRESHOLD

export const summarizeAlertItems = (items) => {
  const counts = { Open: 0, Acknowledged: 0, Snoozed: 0, Resolved: 0 }
  for (const item of Array.isArray(items) ? items : []) {
    if (item?.Status in counts) counts[item.Status] += 1
  }
  return counts
}

// Open first (flapping items at the top), then acknowledged, snoozed and resolved; newest
// activity first within each group.
export const sortAlertItems = (items) => {
  const statusRank = (status) => {
    const index = ALERT_STATUS_ORDER.indexOf(status)
    return index === -1 ? ALERT_STATUS_ORDER.length : index
  }
  const activityTime = (item) => {
    const date = parseIso(
      item?.Status === 'Resolved' ? item?.ResolvedAt : item?.LastSeen
    )
    return date ? date.getTime() : 0
  }
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const rank = statusRank(a?.Status) - statusRank(b?.Status)
    if (rank !== 0) return rank
    const flap = Number(isFlapping(b)) - Number(isFlapping(a))
    if (flap !== 0) return flap
    return activityTime(b) - activityTime(a)
  })
}

// One-line status text for a row on the dashboard card.
export const describeAlertStatus = (item, now = new Date()) => {
  if (!item) return ''
  const parts = []
  switch (item.Status) {
    case 'Resolved':
      parts.push(`Resolved ${describeAge(item.ResolvedAt, now)}`.trim())
      break
    case 'Snoozed': {
      const until = Number(item.SnoozeUntil)
      if (until === -1) parts.push('Snoozed indefinitely')
      else if (Number.isFinite(until) && until > 0) {
        const untilDate = new Date(until * 1000).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        parts.push(`Snoozed until ${untilDate}`)
      } else parts.push('Snoozed')
      if (item.SnoozedBy) parts.push(`by ${item.SnoozedBy}`)
      break
    }
    case 'Acknowledged':
      parts.push(
        item.AcknowledgedBy
          ? `Acknowledged by ${item.AcknowledgedBy}`
          : 'Acknowledged'
      )
      if (item.AcknowledgedAt) parts.push(describeAge(item.AcknowledgedAt, now))
      break
    default: {
      const firstSeen = describeAge(item.FirstSeen, now)
      if (firstSeen) parts.push(`First seen ${firstSeen}`)
    }
  }
  if (item.Status !== 'Resolved') {
    const checked = describeAge(item.LastChecked, now)
    if (checked) parts.push(`checked ${checked}`)
  }
  return parts.filter(Boolean).join(' · ')
}
