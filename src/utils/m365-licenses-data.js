import { useEffect, useState } from "react";

// data/M365Licenses.json (~2.2MB) was statically imported by several license utils + a settings page,
// inlining it into the common bundle. Load it (and the small additional list) as an async chunk
// instead. Cached at module scope; preloaded on first import so sync consumers usually see data.
let cache = null;
let pending = null;

export function ensureM365Licenses() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = Promise.all([
      import("../data/M365Licenses.json"),
      import("../data/M365Licenses-additional.json"),
    ])
      .then(([def, add]) => {
        const d = def.default || def;
        const a = add.default || add;
        cache = { default: d, additional: a, all: [...d, ...a] };
        return cache;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

// Synchronous accessors for non-React utilities — return [] until the chunk has loaded.
export function getM365Licenses() {
  return cache?.all || [];
}
export function getM365LicensesDefault() {
  return cache?.default || [];
}
export function getM365LicensesAdditional() {
  return cache?.additional || [];
}

// Hook for React components — re-renders once the chunk has loaded.
export function useM365Licenses() {
  const [data, setData] = useState(cache?.all || []);
  useEffect(() => {
    if (cache) {
      setData(cache.all);
      return;
    }
    let alive = true;
    ensureM365Licenses()
      .then((c) => {
        if (alive) setData(c.all);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

ensureM365Licenses().catch(() => {});
