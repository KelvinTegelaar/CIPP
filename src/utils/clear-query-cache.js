import { clearPersistedQueries } from './query-persister'

// _app.js persists the react-query cache to IndexedDB. When a poisoned entry
// is what's crashing the app, reloading alone just replays it — the cache has to
// go first. Shared by both 500 fallbacks.
export const clearQueryCacheAndReload = () => {
  if (typeof window === 'undefined') return
  clearPersistedQueries().then(() => window.location.reload())
}
