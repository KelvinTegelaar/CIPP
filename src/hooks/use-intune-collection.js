import { useEffect, useState } from "react";

// The Intune setting catalog (~17MB) lives in public/ and is fetched on demand — only the Intune
// template / JSON-view screens need it. Keeping it in public/ (a plain static file) instead of a JS
// import keeps the 17MB out of the webpack/Next compile entirely (faster build, less memory); CRAFT
// still serves it precompressed (/intuneCollection.json.br). Cached at module scope so it downloads at
// most once across components.
let cache = null;
let pending = null;

function loadIntuneCollection() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/intuneCollection.json")
      .then((r) => {
        if (!r.ok) throw new Error(`intuneCollection.json HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        cache = data;
        return cache;
      })
      .catch((err) => {
        pending = null; // allow a retry on next mount
        throw err;
      });
  }
  return pending;
}

// One shared reference for the not-loaded case. Callers put `data` in dependency arrays, and a fresh
// [] on every render would invalidate their memos continuously.
const EMPTY = [];

// Returns the collection along with its load state, so a screen that renders setting names can show
// that it is still resolving them instead of briefly displaying raw setting definition IDs.
// `enabled: false` skips the download entirely — worth passing for policy types whose fields are
// self-describing and never need the catalog.
export function useIntuneCollectionState({ enabled = true } = {}) {
  // The result is derived from the module-level cache at render time; this only re-renders the
  // component once the in-flight fetch settles.
  const [, onSettled] = useState(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!enabled || cache) return undefined;

    let alive = true;
    loadIntuneCollection()
      .then(() => {
        if (alive) onSettled((tick) => tick + 1);
      })
      .catch(() => {
        // Not fatal: callers fall back to raw setting definition IDs rather than blocking.
        if (alive) setIsError(true);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  if (!enabled) return { data: EMPTY, isLoading: false, isError: false };
  if (cache) return { data: cache, isLoading: false, isError: false };
  return { data: EMPTY, isLoading: !isError, isError };
}

// Returns the Intune collection array — empty until the fetch resolves, then re-renders.
export function useIntuneCollection() {
  return useIntuneCollectionState().data;
}
