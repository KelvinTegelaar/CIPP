// The query client is persisted whole to IndexedDB, but each query's data (each page, for a paged
// query) is its own record and is cloned only when that object changes, so an unrelated update
// never re-copies every table and a paged load stores each page once, as it arrives.
const DB_NAME = 'cipp-query-client'
const STORE = 'records'
const CLIENT_KEY = 'client'
const LEGACY_PREFIX = 'REACT_QUERY_OFFLINE_CACHE'
const THROTTLE_MS = 1000
const OPEN_TIMEOUT_MS = 2000
// ApiGetCallWithPagination's staleTime: a stale paged query refetches every page behind skeletons, so its old copy is never shown
const PAGED_STALE_MS = 300000
// authmecipp not persisted, stale clientPrincipal:null flashes 401 on post-login reload.
const EXCLUDED_KEYS = ['authmeswa', 'authmecipp', 'alertsDashboard']

let dbPromise
const openDb = () => {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

// Never rejects: a blocked or missing IndexedDB just means nothing is cached.
const run = async (mode, operation) => {
  if (typeof indexedDB === 'undefined') return undefined
  try {
    const db = await openDb()
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, mode)
      let requests
      try {
        requests = operation(tx.objectStore(STORE))
      } catch {
        tx.abort()
        return resolve(undefined)
      }
      tx.oncomplete = () => resolve(requests.map((request) => request?.result))
      tx.onerror = tx.onabort = () => resolve(undefined)
    })
  } catch {
    return undefined
  }
}

const clearLegacy = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LEGACY_PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    // private mode or a locked store
  }
}

const isObject = (value) => value !== null && typeof value === 'object'
const isPaged = (data) =>
  Array.isArray(data.pages) &&
  Array.isArray(data.pageParams) &&
  data.pages.every(isObject)
const refsOf = (state) =>
  state.pageRefs ?? (state.dataRef ? [state.dataRef] : [])
const isStalePaged = (state) =>
  Date.now() - state.dataUpdatedAt > PAGED_STALE_MS

const session = Date.now().toString(36)
let nextRef = 0
let generation = 0
let refsByValue = new WeakMap()
// values the store refused (too large for a private window, or not cloneable); skipped until they change
let unstorable = new WeakSet()
// ref -> value for every record the store holds, so a deleted record's value is cloned again if it returns
const stored = new Map()
const remember = (ref, value) => {
  refsByValue.set(value, ref)
  stored.set(ref, value)
}

const refFor = async (value, gen) => {
  if (unstorable.has(value)) return undefined
  const known = refsByValue.get(value)
  if (known || gen !== generation) return known
  const ref = `${session}-${nextRef++}`
  const written = await run('readwrite', (store) => [store.put(value, ref)])
  if (gen !== generation) return undefined
  if (!written) {
    unstorable.add(value)
    return undefined
  }
  remember(ref, value)
  return ref
}

const writeClient = async (client) => {
  const gen = generation
  const queries = []
  for (const query of client.clientState.queries) {
    const { data } = query.state
    if (!isObject(data)) {
      queries.push(query)
    } else if (isPaged(data)) {
      if (
        isStalePaged(query.state) ||
        data.pages.some((page) => unstorable.has(page))
      )
        continue
      const pageRefs = []
      for (const page of data.pages) pageRefs.push(await refFor(page, gen))
      if (!pageRefs.includes(undefined)) {
        queries.push({
          ...query,
          state: {
            ...query.state,
            data: undefined,
            pageRefs,
            pageParams: data.pageParams,
          },
        })
      }
    } else {
      const dataRef = await refFor(data, gen)
      if (dataRef)
        queries.push({
          ...query,
          state: { ...query.state, data: undefined, dataRef },
        })
    }
  }
  if (gen !== generation) return
  const kept = new Set(queries.flatMap((query) => refsOf(query.state)))
  const stale = [...stored.keys()].filter((ref) => !kept.has(ref))
  const written = await run('readwrite', (store) => [
    store.put(
      { ...client, clientState: { ...client.clientState, queries } },
      CLIENT_KEY
    ),
    ...stale.map((ref) => store.delete(ref)),
  ])
  if (!written || gen !== generation) return
  stale.forEach((ref) => {
    refsByValue.delete(stored.get(ref))
    stored.delete(ref)
  })
}

const readClient = async () => {
  clearLegacy()
  const opened = await Promise.race([
    openDb().then(
      () => true,
      () => false
    ),
    new Promise((resolve) => setTimeout(() => resolve(false), OPEN_TIMEOUT_MS)),
  ])
  if (!opened) return undefined
  const [client, keys = []] =
    (await run('readonly', (store) => [
      store.get(CLIENT_KEY),
      store.getAllKeys(),
    ])) ?? []
  const savedQueries = client?.clientState?.queries ?? []
  const refs = savedQueries.flatMap((query) => refsOf(query.state))
  const values =
    (await run('readonly', (store) => refs.map((ref) => store.get(ref)))) ?? []
  const byRef = new Map(refs.map((ref, i) => [ref, values[i]]))
  const queries = []
  for (const query of savedQueries) {
    const { dataRef, pageRefs, pageParams, ...state } = query.state
    if (pageRefs && isStalePaged(state)) continue
    const parts = refsOf(query.state).map((ref) => byRef.get(ref))
    if (parts.includes(undefined)) continue
    refsOf(query.state).forEach((ref, i) => remember(ref, parts[i]))
    const data = pageRefs
      ? { pages: parts, pageParams }
      : dataRef
        ? parts[0]
        : state.data
    queries.push({ ...query, state: { ...state, data } })
  }
  const orphans = keys.filter((key) => key !== CLIENT_KEY && !stored.has(key))
  if (orphans.length)
    run('readwrite', (store) => orphans.map((key) => store.delete(key)))
  return (
    client && { ...client, clientState: { ...client.clientState, queries } }
  )
}

let pending
let timer
const flush = async () => {
  const client = pending
  pending = undefined
  try {
    if (client) await writeClient(client)
  } finally {
    timer = pending ? setTimeout(flush, THROTTLE_MS) : undefined
  }
}

export const clearPersistedQueries = async () => {
  clearLegacy()
  generation++
  pending = undefined
  refsByValue = new WeakMap()
  unstorable = new WeakSet()
  stored.clear()
  await run('readwrite', (store) => [store.clear()])
}

export const queryPersister = {
  persistClient: (client) => {
    pending = client
    timer ??= setTimeout(flush, THROTTLE_MS)
  },
  restoreClient: readClient,
  removeClient: clearPersistedQueries,
}

export const persistOptions = {
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24,
  buster: 'v3',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' &&
      !EXCLUDED_KEYS.some((key) =>
        String(query.queryKey?.[0] ?? '').includes(key)
      ),
  },
}
