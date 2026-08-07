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

// amd loaders (monaco) assign their own window.require after setup runs, trap the
// assignment and keep .context attached to whatever gets installed
let currentRequire = typeof globalThis.require === 'undefined' ? requireShim : globalThis.require
if (typeof currentRequire.context === 'undefined') {
  currentRequire.context = createContext
}
try {
  Object.defineProperty(globalThis, 'require', {
    configurable: true,
    get() {
      return currentRequire
    },
    set(value) {
      currentRequire = value
      if (value && typeof value.context === 'undefined') {
        value.context = createContext
      }
    },
  })
} catch {
  globalThis.require = currentRequire
}
