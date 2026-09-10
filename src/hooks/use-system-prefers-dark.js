import { useEffect, useLayoutEffect, useState } from 'react'

const QUERY = '(prefers-color-scheme: dark)'

// Layout effect on the client so the first-mount state flip is flushed BEFORE
// the browser paints - React guarantees setState inside useLayoutEffect
// re-renders synchronously pre-paint. A passive useEffect (what
// react-media-hook used) runs after paint, and that one painted light frame
// was the visible flash on the auth shell for dark-mode users. The server /
// build prerender falls back to useEffect to avoid the SSR warning and renders
// light by design; the pre-hydration script in _document.js keeps the page
// background correct until this kicks in.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const useSystemPrefersDark = () => {
  const [prefersDark, setPrefersDark] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia(QUERY)
    setPrefersDark(mql.matches)
    const onChange = (event) => setPrefersDark(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return prefersDark
}
