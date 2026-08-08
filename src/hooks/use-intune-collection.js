import { useEffect, useMemo, useState } from 'react'

// Intune setting definitions are fetched in bucket bundles from public/intune-definitions, which
// build/tools/Split-IntuneCollection.ps1 generates from the catalog.
//
// The catalog holds ~18k definitions and a settings catalog policy references around 2% of them,
// so shipping it whole meant downloading 17MB (1MB compressed) and parsing it on the main thread to
// read a few hundred entries. Definitions are grouped into 256 bundles by hash prefix - one file
// per definition moved the fewest bytes, but Azure Static Web Apps caps a deployment at 15,000
// files, and 18k definition files alone overran it. A bundle is ~75KB raw, a few KB compressed,
// and the browser caches each one on its own - a second policy that shares buckets re-fetches
// nothing.
//
// Definitions are addressed by the SHA-256 of their id because ids run up to 278 characters. Each
// bundle is an object keyed by the first 16 hex characters of the hash, and the first 2 of those
// name the bundle file. The generator uses the same scheme; changing it here means changing it
// there too.

const DEFINITION_ROOT = '/intune-definitions'

// Enough to keep the connection busy without opening a couple of hundred requests at once.
const CONCURRENCY = 24

// id -> definition, or null for an id the catalog has no entry for. Kept for the life of the tab so
// moving between policies that share settings costs nothing.
const cache = new Map()

// Bundle requests in flight, keyed by bucket, so ids sharing a bucket - and two components mounting
// at once - fetch each bundle only once. Parsed bundles are not kept beyond that: a large policy
// touches most buckets, and retaining them would hold most of the catalog in memory. The ids that
// were asked for land in `cache`, and a later re-fetch of a bundle hits the browser's HTTP cache.
const inFlight = new Map()

const hashForId = async (id) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(id)
  )
  let hash = ''
  for (const byte of new Uint8Array(digest, 0, 8)) {
    hash += byte.toString(16).padStart(2, '0')
  }
  return hash
}

const fetchBundle = (bucket) => {
  let request = inFlight.get(bucket)
  if (!request) {
    request = fetch(`${DEFINITION_ROOT}/${bucket}.json`)
      .then((response) => {
        // A missing bundle just means no current definition hashes into it: every id that led
        // here is a setting Intune has since retired, and the screen falls back to showing the
        // raw definition id.
        if (response.status === 404) return {}
        if (!response.ok) {
          throw new Error(`${DEFINITION_ROOT} HTTP ${response.status}`)
        }
        return response.json()
      })
      .finally(() => {
        inFlight.delete(bucket)
      })
    inFlight.set(bucket, request)
  }

  return request
}

// Resolves ids one bundle at a time, a few bundles in flight at once. Ids already in the cache -
// hits and misses alike - are answered without a request; the rest are grouped by the bundle they
// live in so each bundle is fetched once.
const resolveDefinitions = async (ids) => {
  const found = []
  let failures = 0

  const buckets = new Map()
  for (const id of ids) {
    if (cache.has(id)) {
      const definition = cache.get(id)
      if (definition) found.push(definition)
      continue
    }
    const hash = await hashForId(id)
    const bucket = hash.slice(0, 2)
    let wanted = buckets.get(bucket)
    if (!wanted) {
      wanted = []
      buckets.set(bucket, wanted)
    }
    wanted.push({ id, hash })
  }

  const pending = Array.from(buckets.entries())
  let next = 0

  const drain = async () => {
    while (next < pending.length) {
      const [bucket, wanted] = pending[next]
      next += 1
      try {
        const bundle = await fetchBundle(bucket)
        for (const { id, hash } of wanted) {
          const definition = bundle[hash] ?? null
          cache.set(id, definition)
          if (definition) found.push(definition)
        }
      } catch {
        // One bundle failing should not cost the screen every other setting's name.
        failures += wanted.length
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, drain)
  )

  return { found, failures }
}

// The category records, unlike the definitions, are small enough to keep in one file - 481KB, 49KB
// over the wire, about what the definitions for a single policy already cost - so they are fetched
// whole rather than split. One request per tab, cached at module scope.
let categoriesPromise = null

const loadCategories = () => {
  if (!categoriesPromise) {
    categoriesPromise = fetch('/intuneCategories.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`intuneCategories.json HTTP ${response.status}`)
        }
        return response.json()
      })
      .then((records) => {
        const index = new Map()
        records.forEach((record) => {
          if (record?.id) index.set(record.id, record)
        })
        return index
      })
      .catch((error) => {
        categoriesPromise = null
        throw error
      })
  }
  return categoriesPromise
}

const EMPTY_CATEGORIES = new Map()

// The category a setting belongs to: its name, and the path it sits at in Intune's own category
// tree. Purely descriptive - a screen that never resolves them still groups and labels correctly,
// so this never gates rendering and failure is silent.
export const useIntuneCategories = ({ enabled = true } = {}) => {
  const [categories, setCategories] = useState(EMPTY_CATEGORIES)

  useEffect(() => {
    if (!enabled) return undefined

    let alive = true
    loadCategories()
      .then((index) => {
        if (alive) setCategories(index)
      })
      .catch(() => {
        // Sections keep their display name, they just lose the disambiguating path.
      })

    return () => {
      alive = false
    }
  }, [enabled])

  return categories
}

const EMPTY_IDS = []
const EMPTY_DEFINITIONS = new Map()

// Resolves a known set of setting definition ids. `ids` must be referentially stable across renders
// (memoise it on the policy it came from), because a fresh array every render is a fresh request
// every render.
//
// Reports load state alongside the resolver so a screen that renders setting names can show that it
// is still resolving them instead of briefly displaying raw setting definition ids.
export const useIntuneDefinitions = (
  ids = EMPTY_IDS,
  { enabled = true } = {}
) => {
  const [definitions, setDefinitions] = useState(EMPTY_DEFINITIONS)
  const [isError, setIsError] = useState(false)

  const wanted = useMemo(
    () => (ids instanceof Set ? Array.from(ids) : ids || EMPTY_IDS),
    [ids]
  )

  // Everything asked for that is not resolved yet. Derived from `definitions` rather than tracked
  // separately so that it is already correct on the first render - before the effect below has run
  // - and so React can see exactly why it changes.
  const outstanding = useMemo(
    () => wanted.filter((id) => !definitions.has(id)),
    [wanted, definitions]
  )

  useEffect(() => {
    if (!enabled || outstanding.length === 0) return undefined

    let alive = true

    resolveDefinitions(outstanding)
      .then(({ found, failures }) => {
        if (!alive) return
        // Only a wholesale failure is worth warning about - the catalog being unreachable. A few
        // definitions failing individually leaves the rest of the screen correct.
        setIsError(failures > 0 && failures === outstanding.length)
        setDefinitions((current) => {
          const next = new Map(current)
          // Ids nothing came back for are recorded as misses rather than left out. They are
          // resolved - the answer is just nothing - and without them `outstanding` would never
          // shrink and this effect would re-run forever.
          outstanding.forEach((id) => next.set(id, undefined))
          found.forEach((definition) => {
            if (definition?.id) next.set(definition.id, definition)
          })
          return next
        })
      })
      .catch(() => {
        // Not fatal: callers fall back to raw setting definition ids rather than blocking.
        if (alive) setIsError(true)
      })

    return () => {
      alive = false
    }
  }, [enabled, outstanding])

  const getDefinition = useMemo(
    () => (definitionId) =>
      definitionId ? definitions.get(definitionId) : undefined,
    [definitions]
  )

  return {
    getDefinition,
    isLoading: enabled && outstanding.length > 0 && !isError,
    isError,
  }
}
