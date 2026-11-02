// _app.js persists the react-query cache to localStorage. When a poisoned entry
// is what's crashing the app, reloading alone just replays it — the cache has to
// go first. Shared by both 500 fallbacks.
export const clearQueryCacheAndReload = () => {
  if (typeof window === 'undefined') return
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('REACT_QUERY_OFFLINE_CACHE'))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // private mode or a locked store, the reload is still worth attempting
  }
  window.location.reload()
}
