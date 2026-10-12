import { useEffect, useRef, useSyncExternalStore } from 'react'

// One stream per tab, shared by every subscriber. Craft serves it only when its realtime module is on;
// anywhere else the request is not an event stream, so it closes for good and callers keep polling.
const listeners = new Map()
const connectionListeners = new Set()
let source = null
let unavailable = false
let connected = false
let dropped = false

const setConnected = (value) => {
  if (connected === value) return
  connected = value
  connectionListeners.forEach((fn) => fn())
}

const open = () => {
  if (source || unavailable || typeof EventSource === 'undefined') return
  source = new EventSource('/.craft/events')
  source.onopen = () => {
    setConnected(true)
    // Changes made while the stream was down were never pushed: a frame without data makes callers re-read.
    if (dropped)
      listeners.forEach((set, jobId) =>
        set.forEach((fn) => fn({ jobId, mode: 'resync' }))
      )
    dropped = false
  }
  source.onmessage = (event) => {
    let frame
    try {
      frame = JSON.parse(event.data)
    } catch {
      return
    }
    if (frame?.jobId) {
      listeners
        .get(String(frame.jobId).toLowerCase())
        ?.forEach((fn) => fn(frame))
    }
  }
  source.onerror = () => {
    // CONNECTING is a dropped stream the browser retries; CLOSED means this host has no stream for us.
    setConnected(false)
    dropped = true
    if (source?.readyState === EventSource.CLOSED) {
      source = null
      unavailable = true
    }
  }
}

const closeIfIdle = () => {
  if (listeners.size === 0 && source) {
    source.close()
    source = null
    setConnected(false)
  }
}

/** Put a pushed row in place by its key, or append it; list endpoints key async deployment rows by Name. */
export const mergeRow = (rows, row, key = 'Name') => {
  const list = Array.isArray(rows) ? rows : []
  return list.some((r) => r?.[key] === row[key])
    ? list.map((r) => (r?.[key] === row[key] ? row : r))
    : [...list, row]
}

const subscribeConnection = (fn) => {
  connectionListeners.add(fn)
  return () => connectionListeners.delete(fn)
}

/**
 * Follow Craft realtime events for one or more job/queue ids. Returns whether the stream is connected:
 * while it is, the server pushes every change to the jobs this user may read (reading a job through the
 * API grants it), so callers stop polling and only poll again when the stream is down or unavailable.
 */
export const useCraftJobEvents = (jobIds, onEvent) => {
  const handler = useRef(onEvent)
  useEffect(() => {
    handler.current = onEvent
  })
  const key = []
    .concat(jobIds ?? [])
    .filter(Boolean)
    .map((id) => String(id).toLowerCase())
    .join(',')

  useEffect(() => {
    if (!key) return undefined
    const ids = key.split(',')
    const fn = (frame) => handler.current?.(frame)
    ids.forEach((id) => {
      if (!listeners.has(id)) listeners.set(id, new Set())
      listeners.get(id).add(fn)
    })
    open()
    return () => {
      ids.forEach((id) => {
        const set = listeners.get(id)
        set?.delete(fn)
        if (set?.size === 0) listeners.delete(id)
      })
      closeIfIdle()
    }
  }, [key])

  return useSyncExternalStore(
    subscribeConnection,
    () => !!key && connected,
    () => false
  )
}
