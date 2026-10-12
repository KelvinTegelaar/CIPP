import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class FakeEventSource {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 2
  static instances = []
  constructor(url) {
    this.url = url
    this.readyState = FakeEventSource.CONNECTING
    this.closed = false
    FakeEventSource.instances.push(this)
  }
  close() {
    this.closed = true
    this.readyState = FakeEventSource.CLOSED
  }
  connect() {
    this.readyState = FakeEventSource.OPEN
    this.onopen?.(new Event('open'))
  }
  emit(frame) {
    this.onmessage?.({ data: JSON.stringify(frame) })
  }
  fail(readyState) {
    this.readyState = readyState
    this.onerror?.(new Event('error'))
  }
}

// The hook keeps one stream per tab in module state, so each test loads a fresh copy.
const loadHook = async () => {
  vi.resetModules()
  return (await import('../../src/hooks/use-craft-events')).useCraftJobEvents
}

const QUEUE = '6F1C2B8E-1D2A-4C1E-9F0A-3B2C1D4E5F60'
const OTHER = '0a0b0c0d-0000-4000-8000-000000000001'

describe('useCraftJobEvents', () => {
  beforeEach(() => {
    FakeEventSource.instances = []
    vi.stubGlobal('EventSource', FakeEventSource)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('delivers a frame only to the job it names, whatever the GUID case', async () => {
    const useCraftJobEvents = await loadHook()
    const mine = vi.fn()
    const theirs = vi.fn()
    renderHook(() => useCraftJobEvents(QUEUE, mine))
    renderHook(() => useCraftJobEvents(OTHER, theirs))

    act(() =>
      FakeEventSource.instances[0].emit({
        jobId: QUEUE.toLowerCase(),
        mode: 'update',
        data: { CompletedTasks: 3 },
      })
    )

    expect(mine).toHaveBeenCalledWith(
      expect.objectContaining({ data: { CompletedTasks: 3 } })
    )
    expect(theirs).not.toHaveBeenCalled()
  })

  it('reports connected only while the stream is open, so callers poll whenever it is down', async () => {
    const useCraftJobEvents = await loadHook()
    const { result } = renderHook(() => useCraftJobEvents(QUEUE, () => {}))
    const stream = FakeEventSource.instances[0]
    expect(result.current).toBe(false)

    act(() => stream.connect())
    expect(result.current).toBe(true)

    act(() => stream.fail(FakeEventSource.CONNECTING))
    expect(result.current).toBe(false)

    act(() => stream.connect())
    expect(result.current).toBe(true)
  })

  it('reports a caller with no job as not connected, so it never stops polling on another job stream', async () => {
    const useCraftJobEvents = await loadHook()
    renderHook(() => useCraftJobEvents(QUEUE, () => {}))
    const idle = renderHook(() => useCraftJobEvents(null, () => {}))
    act(() => FakeEventSource.instances[0].connect())

    expect(idle.result.current).toBe(false)
  })

  it('asks every follower to re-read after the stream comes back, since nothing was pushed while it was down', async () => {
    const useCraftJobEvents = await loadHook()
    const onEvent = vi.fn()
    renderHook(() => useCraftJobEvents(QUEUE, onEvent))
    const stream = FakeEventSource.instances[0]

    act(() => stream.connect())
    expect(onEvent).not.toHaveBeenCalled()

    act(() => stream.fail(FakeEventSource.CONNECTING))
    act(() => stream.connect())
    expect(onEvent).toHaveBeenCalledTimes(1)
    expect(onEvent.mock.calls[0][0]).toMatchObject({ mode: 'resync' })
    expect(onEvent.mock.calls[0][0].data).toBeUndefined()
  })

  it('never reopens a stream the host refused, so non-Craft installs just poll', async () => {
    const useCraftJobEvents = await loadHook()
    const first = renderHook(() => useCraftJobEvents(QUEUE, () => {}))
    act(() => FakeEventSource.instances[0].fail(FakeEventSource.CLOSED))
    first.unmount()

    renderHook(() => useCraftJobEvents(OTHER, () => {}))

    expect(FakeEventSource.instances).toHaveLength(1)
  })

  it('shares one stream across subscribers and closes it when the last one leaves', async () => {
    const useCraftJobEvents = await loadHook()
    const a = renderHook(() => useCraftJobEvents(QUEUE, () => {}))
    const b = renderHook(() => useCraftJobEvents([QUEUE, OTHER], () => {}))
    expect(FakeEventSource.instances).toHaveLength(1)
    expect(FakeEventSource.instances[0].url).toBe('/.craft/events')

    a.unmount()
    expect(FakeEventSource.instances[0].closed).toBe(false)
    b.unmount()
    expect(FakeEventSource.instances[0].closed).toBe(true)
  })
})

describe('mergeRow', () => {
  // Rows as Get-CIPPAsyncDeployment returns them: one per offboarded user, keyed by Name.
  const row = (Name, Status) => ({ Name, Status, Steps: [] })

  it('replaces the pushed row in place and leaves the others alone', async () => {
    const { mergeRow } = await import('../../src/hooks/use-craft-events')
    const rows = [
      row('pat@contoso.com', 'running'),
      row('sam@contoso.com', 'queued'),
    ]

    expect(mergeRow(rows, row('pat@contoso.com', 'succeeded'))).toEqual([
      row('pat@contoso.com', 'succeeded'),
      row('sam@contoso.com', 'queued'),
    ])
  })

  it('adds a row the first read had not seen yet', async () => {
    const { mergeRow } = await import('../../src/hooks/use-craft-events')

    expect(mergeRow(undefined, row('pat@contoso.com', 'queued'))).toEqual([
      row('pat@contoso.com', 'queued'),
    ])
    expect(
      mergeRow(
        [row('pat@contoso.com', 'running')],
        row('sam@contoso.com', 'queued')
      )
    ).toHaveLength(2)
  })
})
