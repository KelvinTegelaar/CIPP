import { useEffect, useMemo, useState } from 'react'

// Intune setting definitions are fetched one file at a time from public/intune-definitions, which
// build/tools/Split-IntuneCollection.ps1 generates from the catalog.
//
// The catalog holds ~18k definitions and a settings catalog policy references around 2% of them,
// so shipping it whole meant downloading 17MB (1MB compressed) and parsing it on the main thread to
// read a few hundred entries. Fetching the referenced definitions individually moves far fewer
// bytes, needs no parse worth the name, and lets the browser cache each definition on its own -
// a second policy that shares settings re-fetches nothing.
//
// Definitions are addressed by the SHA-256 of their id because ids run up to 278 characters, which
// overruns the 260-character Windows MAX_PATH as a filename. The generator uses the same scheme;
// changing it here means changing it there too.

const DEFINITION_ROOT = '/intune-definitions'

// Enough to keep the connection busy without opening several hundred requests at once.
const CONCURRENCY = 24

// id -> definition, or null for an id the catalog has no file for. Kept for the life of the tab so
// moving between policies that share settings costs nothing.
const cache = new Map()

// Requests in flight, so two components mounting at once ask for a shared id only once.
const inFlight = new Map()

const pathForId = async (id) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(id)
  )
  let hash = ''
  for (const byte of new Uint8Array(digest, 0, 8)) {
    hash += byte.toString(16).padStart(2, '0')
  }
  return `${DEFINITION_ROOT}/${hash.slice(0, 2)}/${hash}.json`
}

const fetchDefinition = (id) => {
  if (cache.has(id)) return Promise.resolve(cache.get(id))

  let request = inFlight.get(id)
  if (!request) {
    request = pathForId(id)
      .then((path) => fetch(path))
      .then((response) => {
        // A 404 is a setting Intune has since retired, not a failure: the screen falls back to
        // showing the raw definition id. Caching the miss stops it being asked for again.
        if (response.status === 404) return null
        if (!response.ok) {
          throw new Error(`${DEFINITION_ROOT} HTTP ${response.status}`)
        }
        return response.json()
      })
      .then((definition) => {
        cache.set(id, definition)
        inFlight.delete(id)
        return definition
      })
      .catch((error) => {
        inFlight.delete(id)
        throw error
      })
    inFlight.set(id, request)
  }

  return request
}

// Resolves the ids a few at a time rather than all at once, so a policy with several hundred
// settings does not open several hundred simultaneous requests.
const resolveDefinitions = async (ids) => {
  const found = []
  let failures = 0
  let next = 0

  const drain = async () => {
    while (next < ids.length) {
      const id = ids[next]
      next += 1
      try {
        const definition = await fetchDefinition(id)
        if (definition) found.push(definition)
      } catch {
        // One definition failing should not cost the screen every other setting's name.
        failures += 1
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, ids.length) }, drain)
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
