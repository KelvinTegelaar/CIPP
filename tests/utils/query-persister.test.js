import { QueryClient } from '@tanstack/react-query'
import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from '@tanstack/react-query-persist-client'

// In-memory IndexedDB: put clones like the real one, a transaction applies all or nothing, and
// `refuse` marks values the store rejects (a private window's per-value size cap).
const fakeIndexedDB = ({ answer = true, refuse = () => false } = {}) => {
  const records = new Map()
  const puts = []
  const db = {
    createObjectStore: () => {},
    transaction: () => {
      const ops = []
      let aborted = false
      let failed = false
      const request = (op) => {
        const req = {}
        ops.push(() => (req.result = op()))
        return req
      }
      const store = {
        get: (key) => request(() => records.get(key)),
        getAllKeys: () => request(() => [...records.keys()]),
        put: (value, key) => {
          const copy = structuredClone(value)
          puts.push(key)
          if (refuse(value)) failed = true
          return request(() => (records.set(key, copy), key))
        },
        delete: (key) => request(() => records.delete(key)),
        clear: () => request(() => records.clear()),
      }
      const tx = { objectStore: () => store, abort: () => (aborted = true) }
      setTimeout(() => {
        if (aborted) return tx.onabort?.()
        if (failed) return tx.onerror?.()
        ops.forEach((op) => op())
        tx.oncomplete?.()
      })
      return tx
    },
  }
  return {
    records,
    puts,
    indexedDB: {
      open: () => {
        const req = { result: db }
        if (answer)
          setTimeout(() => (req.onupgradeneeded?.(), req.onsuccess?.()))
        return req
      },
    },
  }
}

const rows = (n, tag) => Array.from({ length: n }, (_, i) => ({ id: i, tag }))
const paged = (...pages) => ({
  pages,
  pageParams: pages.map((_, i) => (i ? `next-${i}` : null)),
})

let idb
let persister
const loadPersister = async () => {
  vi.resetModules()
  persister = await import('../../src/utils/query-persister')
}
const useIdb = async (options) => {
  idb = fakeIndexedDB(options)
  vi.stubGlobal('indexedDB', idb.indexedDB)
  await loadPersister()
}
const save = async (queryClient) => {
  await persistQueryClientSave({ queryClient, ...persister.persistOptions })
  await vi.advanceTimersByTimeAsync(1100)
}
const restoreInto = async (queryClient) => {
  const restore = persistQueryClientRestore({
    queryClient,
    ...persister.persistOptions,
  })
  await vi.advanceTimersByTimeAsync(10)
  await restore
}
const dataPuts = () => idb.puts.filter((key) => key !== 'client')

describe('query persister', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    window.localStorage.clear()
    await useIdb()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('stores each query once and never clones unchanged data again', async () => {
    const client = new QueryClient()
    client.setQueryData(['Users - a.com'], rows(3000, 'users'))
    client.setQueryData(['Groups - a.com'], rows(5, 'groups'))
    await save(client)
    expect(dataPuts()).toHaveLength(2)

    idb.puts.length = 0
    client.setQueryData(['Groups - a.com'], rows(6, 'groups'))
    await save(client)
    expect(dataPuts()).toHaveLength(1)
    expect(idb.puts).toContain('client')
  })

  it('stores a paged query a page at a time, cloning only the pages that arrived since', async () => {
    const client = new QueryClient()
    const first = { Results: rows(3, 'p0'), Metadata: { nextLink: 'next-1' } }
    client.setQueryData(['Apps - AllTenants'], paged(first))
    await save(client)
    expect(dataPuts()).toHaveLength(1)

    idb.puts.length = 0
    const second = { Results: rows(3, 'p1'), Metadata: {} }
    client.setQueryData(['Apps - AllTenants'], paged(first, second))
    await save(client)
    expect(dataPuts()).toHaveLength(1)

    await loadPersister()
    const after = new QueryClient()
    await restoreInto(after)
    expect(after.getQueryData(['Apps - AllTenants'])).toEqual(
      paged(first, second)
    )
  })

  it('restores into a new client after a reload without cloning the restored data again', async () => {
    const before = new QueryClient()
    before.setQueryData(['Users - a.com'], rows(3, 'users'))
    before.setQueryData(['count'], 7)
    await save(before)

    await loadPersister()
    const after = new QueryClient()
    await restoreInto(after)
    expect(after.getQueryData(['Users - a.com'])).toEqual(rows(3, 'users'))
    expect(after.getQueryData(['count'])).toBe(7)

    idb.puts.length = 0
    await save(after)
    expect(dataPuts()).toHaveLength(0)
  })

  it('deletes the record of a query that leaves the cache and writes it again if it returns', async () => {
    const client = new QueryClient()
    const users = rows(3, 'users')
    client.setQueryData(['Users - a.com'], users)
    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await save(client)
    expect(idb.records.size).toBe(3)

    client.removeQueries({ queryKey: ['Users - a.com'] })
    await save(client)
    expect(idb.records.size).toBe(2)

    idb.puts.length = 0
    client.setQueryData(['Users - a.com'], users)
    await save(client)
    expect(dataPuts()).toHaveLength(1)
    expect(idb.records.size).toBe(3)
  })

  it('skips unfinished and excluded queries', () => {
    const { shouldDehydrateQuery } = persister.persistOptions.dehydrateOptions
    const query = (queryKey, status, fetchStatus) => ({
      queryKey,
      state: { status, fetchStatus },
    })
    expect(
      shouldDehydrateQuery(query(['Users - a.com'], 'success', 'idle'))
    ).toBe(true)
    expect(
      shouldDehydrateQuery(query(['Users - a.com'], 'success', 'fetching'))
    ).toBe(true)
    expect(
      shouldDehydrateQuery(query(['Users - a.com'], 'pending', 'idle'))
    ).toBe(false)
    expect(shouldDehydrateQuery(query(['authmecipp'], 'success', 'idle'))).toBe(
      false
    )
  })

  it('stores the rest when a query cannot be cloned, and does not retry it until it changes', async () => {
    const client = new QueryClient()
    client.setQueryData(['broken'], { run: () => {} })
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    await save(client)
    const saved = idb.records
      .get('client')
      .clientState.queries.map((q) => q.queryKey[0])
    expect(saved).toEqual(['Users - a.com'])

    idb.puts.length = 0
    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await save(client)
    expect(dataPuts()).toHaveLength(1)
  })

  it('does not retry a page the store refused, nor re-copy the other pages of that query', async () => {
    await useIdb({ refuse: (value) => value?.tooLarge === true })
    const client = new QueryClient()
    const pages = paged(
      { Results: rows(2, 'p0') },
      { Results: rows(2, 'p1'), tooLarge: true }
    )
    client.setQueryData(['Apps - AllTenants'], pages)
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    await save(client)
    const saved = idb.records
      .get('client')
      .clientState.queries.map((q) => q.queryKey[0])
    expect(saved).toEqual(['Users - a.com'])

    idb.puts.length = 0
    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await save(client)
    await save(client)
    expect(dataPuts()).toHaveLength(1)
    expect(idb.records.size).toBe(3)
  })

  it('drops a paged query once it is stale, from the store and from a restore', async () => {
    const client = new QueryClient()
    client.setQueryData(
      ['Apps - AllTenants'],
      paged({ Results: rows(2, 'p0') })
    )
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    await save(client)
    expect(idb.records.size).toBe(3)

    vi.setSystemTime(Date.now() + 6 * 60 * 1000)
    await loadPersister()
    const after = new QueryClient()
    await restoreInto(after)
    await vi.advanceTimersByTimeAsync(10)
    expect(after.getQueryData(['Apps - AllTenants'])).toBeUndefined()
    expect(after.getQueryData(['Users - a.com'])).toEqual(rows(2, 'users'))
    expect(idb.records.size).toBe(2)

    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await save(client)
    const saved = idb.records
      .get('client')
      .clientState.queries.map((q) => q.queryKey[0])
    expect(saved).not.toContain('Apps - AllTenants')
  })

  it('drops a restored query whose data record is missing, and deletes records nothing references', async () => {
    const client = new QueryClient()
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await save(client)
    const { dataRef } = idb.records
      .get('client')
      .clientState.queries.find((q) => q.queryKey[0] === 'Users - a.com').state
    idb.records.delete(dataRef)
    idb.records.set('orphan', rows(1, 'old'))

    await loadPersister()
    const after = new QueryClient()
    await restoreInto(after)
    await vi.advanceTimersByTimeAsync(10)
    expect(after.getQueryData(['Users - a.com'])).toBeUndefined()
    expect(after.getQueryData(['Groups - a.com'])).toEqual(rows(2, 'groups'))
    expect(idb.records.has('orphan')).toBe(false)
  })

  it('clears the store, the legacy localStorage copy and a queued write', async () => {
    window.localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', 'old')
    window.localStorage.setItem('app.settings', 'keep-me')
    const client = new QueryClient()
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    await save(client)

    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await persistQueryClientSave({
      queryClient: client,
      ...persister.persistOptions,
    })
    const cleared = persister.clearPersistedQueries()
    await vi.advanceTimersByTimeAsync(1100)
    await cleared
    expect(idb.records.size).toBe(0)
    expect(window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')).toBeNull()
    expect(window.localStorage.getItem('app.settings')).toBe('keep-me')
  })

  it('a clear during a write is not undone by the rest of that write', async () => {
    const client = new QueryClient()
    client.setQueryData(['Users - a.com'], rows(2, 'users'))
    client.setQueryData(['Groups - a.com'], rows(2, 'groups'))
    await persistQueryClientSave({
      queryClient: client,
      ...persister.persistOptions,
    })
    while (!idb.puts.length) await vi.advanceTimersToNextTimerAsync()

    const cleared = persister.clearPersistedQueries()
    await vi.advanceTimersByTimeAsync(1100)
    await cleared
    expect(idb.records.size).toBe(0)
  })

  it('gives up on a restore when IndexedDB never opens', async () => {
    await useIdb({ answer: false })
    const restored = persister.queryPersister.restoreClient()
    await vi.advanceTimersByTimeAsync(2000)
    await expect(restored).resolves.toBeUndefined()
  })
})
