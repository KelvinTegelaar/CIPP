import axios from 'axios'

// Captures the API traffic behind the current page for the speed dial's support-file
// generator. The recorder is armed only while the support dialog is collecting: the dialog
// forces every active (mounted) query to refetch, so everything the page reads flows
// through axios inside the capture window and is recorded here — successes included, since
// support usually needs to see what the page DID get alongside what failed.

// One oversized Graph list page must not balloon the bundle into something the user
// cannot email, so recorded bodies are capped and flagged instead of stored whole.
const MAX_BODY_CHARS = 262144

// Response headers worth keeping for diagnosis: the size of what came back, throttling
// hints, and every correlation/request id the platform (Craft / ASP.NET / App Service)
// might stamp. A transport failure returns none of these, which is itself the signal -
// the useful id then has to be found server-side, so we grab whichever the platform sets.
const CAPTURED_RESPONSE_HEADERS = [
  'content-length',
  'content-type',
  'retry-after',
  'request-id',
  'x-request-id',
  'x-correlation-id',
  'x-ms-request-id',
  'x-ms-correlation-request-id',
  'x-azure-ref',
  'traceparent',
]

// axios v1 hands back an AxiosHeaders instance (case-insensitive .get) on success, but a
// plain object survives some error paths - read both.
const readHeader = (headers, name) => {
  if (!headers) return undefined
  const direct =
    typeof headers.get === 'function' ? headers.get(name) : undefined
  return direct ?? headers[name] ?? headers[name.toLowerCase()]
}

const pickHeaders = (headers) => {
  if (!headers) return undefined
  const picked = {}
  for (const name of CAPTURED_RESPONSE_HEADERS) {
    const value = readHeader(headers, name)
    if (value != null && value !== '') picked[name] = String(value)
  }
  return Object.keys(picked).length ? picked : undefined
}

let armed = false
let seq = 0
let calls = []
// One React Query key can fire several times in a capture window (retries, or the pages of
// an infinite query). Counting them per key lets a retried failure read as one query
// instead of four unrelated calls.
let attemptCounts = new Map()

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
  const { start, seq: n, queryKey, attempt } = config.cippSupportMeta
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
  // The React Query key and attempt number turn seq 12/15/16/17 back into "one query,
  // four attempts" rather than four separate mysteries.
  if (queryKey) entry.queryKey = queryKey
  if (attempt) entry.attempt = attempt
  if (error) {
    entry.errorMessage = String(error.message ?? error)
    // axios's code (ERR_NETWORK vs ECONNABORTED vs ERR_CANCELED) is the one field that
    // separates a dropped connection from a timeout from a client abort - a null status
    // and "Network Error" alone cannot.
    if (error.code) entry.errorCode = error.code
  }
  // Present on a completed response (success or HTTP-status error); absent on a transport
  // failure, where the missing correlation id is the point.
  const responseHeaders = pickHeaders(response?.headers)
  if (responseHeaders) entry.responseHeaders = responseHeaders
  const contentLength = Number(readHeader(response?.headers, 'content-length'))
  if (Number.isFinite(contentLength)) entry.responseBytes = contentLength
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
    const meta = { start: Date.now(), seq: ++seq }
    // ApiCall stamps the React Query key onto the request config; carry it (and number
    // this attempt) into the recording so retries of one query stay grouped.
    if (config.cippQueryKey) {
      const key = String(config.cippQueryKey)
      const attempt = (attemptCounts.get(key) ?? 0) + 1
      attemptCounts.set(key, attempt)
      meta.queryKey = key
      meta.attempt = attempt
    }
    config.cippSupportMeta = meta
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
  attemptCounts = new Map()
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
