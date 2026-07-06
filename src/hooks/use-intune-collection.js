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

// Returns the Intune collection array — empty until the fetch resolves, then re-renders.
export function useIntuneCollection() {
  const [data, setData] = useState(cache || []);
  useEffect(() => {
    if (cache) {
      setData(cache);
      return;
    }
    let alive = true;
    loadIntuneCollection()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
