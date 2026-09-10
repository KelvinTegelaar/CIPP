const NOISE_KEYS = new Set(['tenant', 'tenantid', 'tenantfilter'])

const isIdKey = (key) => /id$/i.test(key)

export const humanizeCmdlet = (cmdlet) => {
  if (!cmdlet) return 'Alert'
  const stripped = cmdlet
    .replace(/^Get-?CIPPAlert/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
  return stripped || cmdlet
}

export const formatFieldName = (key) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

export const formatValue = (value) => {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  const text = String(value)
  // Format ISO dates from their calendar parts in UTC so the displayed day matches the
  // stored value and never drifts across timezones.
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ]\d{2}:\d{2})?/)
  if (isoMatch) {
    const date = new Date(
      Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    )
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
    }
  }
  return text
}

// ContentPreview is compact JSON truncated to 200 chars, so it's often incomplete (no
// closing brace). Parse strictly when possible, else leniently extract the complete
// "key": value pairs so we still get a readable summary instead of a raw blob.
const parsePreview = (preview) => {
  if (typeof preview !== 'string') return null
  const text = preview.trim()
  if (!text.startsWith('{')) return null
  if (text.endsWith('}')) {
    try {
      return JSON.parse(text)
    } catch {
      // fall through to lenient extraction
    }
  }
  const obj = {}
  const pairRegex = /"([^"]+)"\s*:\s*(?:"([^"]*)"|(-?\d+(?:\.\d+)?)|(true|false|null))/g
  let match
  while ((match = pairRegex.exec(text)) !== null) {
    const [, key, str, num, lit] = match
    if (str !== undefined) obj[key] = str
    else if (num !== undefined) obj[key] = Number(num)
    else obj[key] = lit === 'true' ? true : lit === 'false' ? false : null
  }
  return Object.keys(obj).length > 0 ? obj : null
}

const pickTitle = (item) => {
  const named =
    item.UserPrincipalName ??
    item.userPrincipalName ??
    item.AppName ??
    item.appName ??
    item.DisplayName ??
    item.displayName ??
    item.Message ??
    item.message
  if (named) return String(named)
  for (const [key, value] of Object.entries(item)) {
    if (NOISE_KEYS.has(key.toLowerCase())) continue
    const formatted = formatValue(value)
    if (formatted) return `${formatFieldName(key)}: ${formatted}`
  }
  return null
}

const pickDetail = (item, title) => {
  const parts = []
  for (const [key, value] of Object.entries(item)) {
    if (NOISE_KEYS.has(key.toLowerCase()) || isIdKey(key)) continue
    const formatted = formatValue(value)
    if (!formatted || formatted === title) continue
    parts.push(`${formatFieldName(key)}: ${formatted}`)
    if (parts.length >= 2) break
  }
  return parts.join(' · ')
}

export const describeAlertItem = (rawItem, contentPreview) => {
  let item = rawItem
  if (item == null) item = parsePreview(contentPreview)
  if (typeof item === 'string' && item.trim()) return { title: item.trim(), detail: '' }
  if (item && typeof item === 'object') {
    const title = pickTitle(item)
    if (title) return { title, detail: pickDetail(item, title) }
  }
  if (typeof contentPreview === 'string' && contentPreview.trim()) {
    return { title: contentPreview.trim(), detail: '' }
  }
  return { title: 'Alert item', detail: '' }
}

export const getAlertItemFields = (rawItem, contentPreview) => {
  let item = rawItem
  if (item == null) item = parsePreview(contentPreview)
  if (!item || typeof item !== 'object') return []
  const fields = []
  for (const [key, value] of Object.entries(item)) {
    if (NOISE_KEYS.has(key.toLowerCase())) continue
    const formatted = formatValue(value)
    if (!formatted) continue
    fields.push({ label: formatFieldName(key), value: formatted })
  }
  return fields
}
