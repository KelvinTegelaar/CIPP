import React, { Suspense } from 'react'

// next/dynamic replacement: resolve the loader through React.lazy so dynamically
// imported components (monaco, prism highlighter) actually render in tests.
// loaders return either a module or a bare component, normalize to { default }
export default function dynamic(loader) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve(loader()).then((mod) => ({ default: mod?.default ?? mod })),
  )
  const DynamicComponent = (props) => (
    <Suspense fallback={null}>
      <LazyComponent {...props} />
    </Suspense>
  )
  return DynamicComponent
}
