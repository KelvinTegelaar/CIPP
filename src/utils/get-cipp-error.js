// Keys endpoints use for the human-readable part of an error body, in priority order.
const ERROR_KEYS = [
  'result',
  'Results',
  'error',
  'Error',
  'message',
  'Message',
  'NormalizedError',
]

// Flattens whatever an endpoint put in the error body to a string. Callers interpolate the
// result into toast and banner text, where an object or array (for example the
// `[{ Error: "..." }]` body a list endpoint returns) would read "[object Object]".
const toText = (value) => {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const parts = value.map(toText).filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : undefined
  }
  if (typeof value === 'object') {
    for (const key of [...ERROR_KEYS, 'resultText']) {
      if (value[key] !== undefined) {
        const text = toText(value[key])
        if (text) return text
      }
    }
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export const getCippError = (data) => {
  const body = data?.response?.data
  if (typeof body === 'string' && body.includes('<!DOCTYPE html>')) {
    return data.message
  }
  return toText(body) ?? data?.message
}
