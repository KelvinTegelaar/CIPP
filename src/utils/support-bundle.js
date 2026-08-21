import axios from 'axios'

// Captures the API traffic behind the current page for the speed dial's support-file
// generator. The recorder is armed only while the support dialog is collecting: the dialog
// forces every active (mounted) query to refetch, so everything the page reads flows
// through axios inside the capture window and is recorded here — successes included, since
// support usually needs to see what the page DID get alongside what failed.

// One oversized Graph list page must not balloon the bundle into something the user
// cannot email, so recorded bodies are capped and flagged instead of stored whole.
const MAX_BODY_CHARS = 262144

let armed = false
let seq = 0
let calls = []

const serializeValue = (data, responseType) => {
  if (data === null || data === undefined) return { value: null }
  if (
    responseType === 'blob' ||
    (typeof Blob !== 'undefined' && data instanceof Blob)
  ) {
    return {
      value: `<binary ${data?.type || 'blob'}, ${data?.size ?? 'unknown'} bytes>`,
    }
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return { value: '<form data>' }
  }
  let text
  try {
    text = typeof data === 'string' ? data : JSON.stringify(data)
  } catch {
    text = String(data)
  }
  if (typeof text === 'string' && text.length > MAX_BODY_CHARS) {
    return { value: text.slice(0, MAX_BODY_CHARS), truncated: true }
  }
  // Small bodies keep their shape so the bundle stays readable as plain JSON.
  return { value: typeof data === 'string' ? data : data }
}

// By response time axios has already transformed the request payload into its wire form,
// which for CIPP means a JSON string. Parse it back so the recorded requestBody is a
// readable object rather than an escaped string inside the bundle.
const parseMaybeJson = (data) => {
  if (typeof data !== 'string') return data
  const trimmed = data.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return data
  try {
    return JSON.parse(trimmed)
  } catch {
    return data
  }
}

const record = (config, response, error) => {
  if (!config?.cippSupportMeta || config.cippSupportRecorded) return
  // HMR in dev can register the interceptors more than once; the per-request flag
  // keeps a call from being recorded twice.
  config.cippSupportRecorded = true
  const { start, seq: n } = config.cippSupportMeta
  const entry = {
    seq: n,
    startedAt: new Date(start).toISOString(),
    durationMs: Date.now() - start,
    method: (config.method || 'get').toUpperCase(),
    url: config.url,
    params: config.params ?? null,
    status: response?.status ?? null,
    success: !error,
  }
  if (error) entry.errorMessage = String(error.message ?? error)
  // The payload the client SENT matters as much as what came back - a failing write
  // usually fails because of what was in it.
  if (config.data !== undefined) {
    const requestBody = serializeValue(parseMaybeJson(config.data))
    entry.requestBody = requestBody.value
    if (requestBody.truncated) entry.requestBodyTruncated = true
  }
  const responseBody = serializeValue(response?.data, config.responseType)
  entry.responseBody = responseBody.value
  if (responseBody.truncated) entry.responseBodyTruncated = true
  calls.push(entry)
}

axios.interceptors.request.use((config) => {
  if (armed) {
    config.cippSupportMeta = { start: Date.now(), seq: ++seq }
  }
  return config
})

axios.interceptors.response.use(
  (response) => {
    record(response.config, response, null)
    return response
  },
  (error) => {
    record(error?.config, error?.response, error ?? new Error('Request failed'))
    return Promise.reject(error)
  }
)

export const armSupportRecorder = () => {
  calls = []
  seq = 0
  armed = true
}

export const disarmSupportRecorder = () => {
  armed = false
}

export const getSupportRecording = () =>
  [...calls].sort((a, b) => a.seq - b.seq)

export const getSupportRecordingCount = () => calls.length

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// A bearer token is a live credential, not an identifier — there is no support value in
// shipping one, so tokens are stripped from EVERY bundle regardless of the redaction
// option. Known token fields (/.auth/me's access_token, id_token, refresh_token and
// friends) are emptied by name, and anything shaped like a JWT is removed wherever it
// appears, error payloads included. base64url can never contain a quote or backslash,
// so the substitution cannot break the serialized JSON.
const TOKEN_FIELD_PATTERN =
  /"([A-Za-z0-9_]*(?:access|id|refresh|session)_token[A-Za-z0-9_]*)":"[^"]*"/g
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]*/g

export const stripTokens = (bundle) => {
  let text = JSON.stringify(bundle)
  let removed = 0
  text = text.replace(TOKEN_FIELD_PATTERN, (match, key) => {
    removed++
    return `"${key}":"<token removed>"`
  })
  text = text.replace(JWT_PATTERN, () => {
    removed++
    return '<jwt removed>'
  })
  return { bundle: JSON.parse(text), removed }
}

const EMAIL_PATTERN = /[A-Za-z0-9._%+'-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const GUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
const ONMICROSOFT_PATTERN =
  /[A-Za-z0-9-]+\.(?:mail\.)?onmicrosoft\.(?:com|us|de)/g

// Replaces every email address, GUID (tenant and object ids alike) and known tenant
// domain with a consistent token: the same original value always maps to the same token,
// so support can still correlate "user3 appears in the failing call and the roles list"
// without seeing who user3 is. Domains are redacted from a harvested set (email domains,
// *.onmicrosoft.* matches and the selected tenant) rather than a blind hostname regex,
// so Graph schema strings and infrastructure URLs are never mangled.
// Works on the serialized bundle: none of the matched values or tokens can contain a
// quote or backslash, so the JSON structure survives the substitution.
export const redactBundle = (bundle, { keepHostnames = [] } = {}) => {
  let text = JSON.stringify(bundle)
  const emailMap = new Map()
  const guidMap = new Map()
  const domainMap = new Map()
  const domainSet = new Set()
  // Kept hostnames must survive even when a harvested domain is their suffix — the
  // instance hostname often shares the MSP's own mail domain. Swap them for inert
  // placeholders first (nothing the email/domain/GUID patterns can match), and swap
  // them back after every substitution has run.
  const keepTokens = new Map()
  for (const host of keepHostnames.filter(Boolean)) {
    const token = `__CIPP_KEEP_${keepTokens.size}__`
    keepTokens.set(token, host)
    text = text.replace(new RegExp(escapeRegExp(host), 'gi'), token)
  }

  // Harvest tenant domains before emails are replaced, so bare occurrences of an
  // email's domain are caught too.
  for (const match of text.matchAll(EMAIL_PATTERN)) {
    domainSet.add(match[0].split('@')[1].toLowerCase())
  }
  for (const match of text.matchAll(ONMICROSOFT_PATTERN)) {
    domainSet.add(match[0].toLowerCase())
  }
  const tenant = bundle?.client?.tenant
  if (tenant && tenant !== 'AllTenants' && tenant.includes('.')) {
    domainSet.add(tenant.toLowerCase())
  }

  text = text.replace(EMAIL_PATTERN, (value) => {
    const key = value.toLowerCase()
    if (!emailMap.has(key))
      emailMap.set(key, `user${emailMap.size + 1}@redacted.invalid`)
    return emailMap.get(key)
  })

  for (const domain of domainSet) {
    if (!domainMap.has(domain))
      domainMap.set(domain, `domain${domainMap.size + 1}.invalid`)
    text = text.replace(
      new RegExp(escapeRegExp(domain), 'gi'),
      domainMap.get(domain)
    )
  }

  text = text.replace(GUID_PATTERN, (value) => {
    const key = value.toLowerCase()
    if (!guidMap.has(key)) {
      guidMap.set(
        key,
        `00000000-0000-0000-0000-${String(guidMap.size + 1).padStart(12, '0')}`
      )
    }
    return guidMap.get(key)
  })

  for (const [token, host] of keepTokens) {
    text = text.replaceAll(token, host)
  }

  return {
    bundle: JSON.parse(text),
    summary: {
      emails: emailMap.size,
      domains: domainMap.size,
      guids: guidMap.size,
    },
  }
}

export const downloadSupportBundle = (bundle) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `cipp-support-bundle_${window.location.hostname}_${timestamp}.json`
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
  return filename
}
