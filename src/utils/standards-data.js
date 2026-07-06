import { useEffect, useState } from "react";

// data/standards.json (~0.4MB) was statically imported by a hot formatting util + several standards
// screens, inlining it into the common bundle. Load it as its own async chunk instead. Cached at
// module scope; preloaded on first import so sync consumers usually see data by the time they run.
let cache = null;
let pending = null;

export function ensureStandards() {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import("../data/standards.json")
      .then((m) => {
        cache = m.default || m;
        return cache;
      })
      .catch((err) => {
        pending = null;
        throw err;
      });
  }
  return pending;
}

// Synchronous accessor for non-React utilities — returns [] until the chunk has loaded.
export function getStandards() {
  return cache || [];
}

// Hook for React components — re-renders once the chunk has loaded.
export function useStandards() {
  const [data, setData] = useState(cache || []);
  useEffect(() => {
    if (cache) {
      setData(cache);
      return;
    }
    let alive = true;
    ensureStandards()
      .then((s) => {
        if (alive) setData(s);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

ensureStandards().catch(() => {});
