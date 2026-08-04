// webpack require.context polyfill for vitest. the app runs under next/webpack where
// require.context is real; vite only has import.meta.glob, so map the known call sites
// (CippBreadcrumbNav pages glob, tutorial-context) onto eager globs
const ROOTS = [
  {
    suffix: '/pages',
    base: '/src/pages',
    modules: import.meta.glob('/src/pages/**/*.json', { eager: true }),
  },
  {
    suffix: '/data/tutorials',
    base: '/src/data/tutorials',
    modules: import.meta.glob('/src/data/tutorials/*.json', { eager: true }),
  },
]

function createContext(directory, useSubdirectories = true, regExp = /^\.\//) {
  const root = ROOTS.find((r) => directory.endsWith(r.suffix))
  if (!root) {
    throw new Error(
      `require.context polyfill: no glob mapped for '${directory}', add one in tests/mocks/require-context.js`
    )
  }

  const entries = {}
  for (const [path, mod] of Object.entries(root.modules)) {
    // '/src/pages/x/tabOptions.json' -> './x/tabOptions.json', same keys webpack produces
    const key = `.${path.slice(root.base.length)}`
    if (!useSubdirectories && key.lastIndexOf('/') > 1) {
      continue
    }
    if (regExp.test(key)) {
      entries[key] = mod
    }
  }

  const context = (key) => {
    if (!(key in entries)) {
      throw new Error(`Cannot find module '${key}'`)
    }
    return entries[key]
  }
  context.keys = () => Object.keys(entries)
  return context
}

const requireShim = () => {
  throw new Error(
    'require polyfill: only require.context is supported in tests'
  )
}
requireShim.context = createContext

if (typeof globalThis.require === 'undefined') {
  globalThis.require = requireShim
} else if (typeof globalThis.require.context === 'undefined') {
  globalThis.require.context = createContext
}
