import { useEffect, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

const requestInit = (body) =>
  body
    ? {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    : { credentials: 'same-origin' }

/**
 * Fetch a server-rendered PDF as a Blob (GET, or POST when `body` is given); rejects with the HTTP status.
 * An aborted `signal` drops the request, so the server can stop rendering a PDF nobody will see.
 */
export const fetchServerPdf = (url, body, signal) =>
  fetch(url, { ...requestInit(body), signal }).then((res) =>
    res.ok ? res.blob() : Promise.reject(res.status)
  )

const saveUrl = (href, fileName) => {
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Render on the server and save the result straight to a file, without a preview. */
export const downloadServerPdf = (url, body, fileName) =>
  fetchServerPdf(url, body).then((blob) => {
    const objectUrl = URL.createObjectURL(blob)
    saveUrl(objectUrl, fileName)
    URL.revokeObjectURL(objectUrl)
  })

const idle = { pdfUrl: '', loading: false, error: null }

/**
 * Fetches a server-rendered PDF as an object URL for an iframe, re-fetching when the request changes
 * and revoking the URL on change or unmount. `enabled` gates the fetch, so a dialog only renders while
 * open. `error` is the HTTP status of a failed fetch (0 for a network failure), else null.
 */
export const useServerPdf = ({ url, body, enabled = true }) => {
  const [state, setState] = useState(idle)
  const requestKey = enabled ? JSON.stringify({ url, body }) : ''

  useEffect(() => {
    if (!requestKey) {
      setState((prev) => (prev === idle ? prev : idle))
      return undefined
    }
    let objectUrl
    let cancelled = false
    const controller = new AbortController()
    setState({ pdfUrl: '', loading: true, error: null })
    fetchServerPdf(url, body, controller.signal)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setState({ pdfUrl: objectUrl, loading: false, error: null })
      })
      .catch((status) => {
        if (!cancelled)
          setState({
            pdfUrl: '',
            loading: false,
            error: typeof status === 'number' ? status : 0,
          })
      })
    return () => {
      cancelled = true
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  return {
    ...state,
    download: (fileName) => state.pdfUrl && saveUrl(state.pdfUrl, fileName),
  }
}

const centred = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 2,
  p: 4,
  textAlign: 'center',
}

/** The preview pane for a server-rendered PDF: spinner while rendering, `errorText` on failure, else the iframe. */
export const ServerPdfPane = ({ pdfUrl, loading, error, errorText, title }) => {
  if (loading) {
    return (
      <Box sx={centred}>
        <CircularProgress size={24} />
        <Typography variant="body2">Generating report…</Typography>
      </Box>
    )
  }
  if (error) {
    return (
      <Box sx={centred}>
        <Typography variant="body2" color="error">
          {errorText}
        </Typography>
      </Box>
    )
  }
  if (!pdfUrl) return null
  return (
    <iframe
      src={pdfUrl}
      title={title}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  )
}
