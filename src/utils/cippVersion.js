let cachedVersion = null;
let fetchPromise = null;

// Attempt to derive version from public/version.json (client) or env/package (SSR fallback)
export async function getCippVersion() {
  if (cachedVersion) return cachedVersion;

  // Server-side fallback (no window)
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (!fetchPromise) {
    fetchPromise = fetch("/version.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        // Support multiple possible keys
        cachedVersion = j?.version || "unknown";
        return cachedVersion;
      })
      .catch(() => {
        cachedVersion = "unknown";
        return cachedVersion;
      });
  }
  return fetchPromise;
}

// Build headers including X-CIPP-Version. Accept extra headers to merge.
export async function buildVersionedHeaders(extra = {}) {
  const version = await getCippVersion();
  return {
    "Content-Type": "application/json",
    "X-CIPP-Version": version,
    ...extra,
  };
}
