import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { driver } from 'driver.js'
import { useRouter } from 'next/router'

const STORAGE_KEY = 'cipp.tutorials.completed'

const getCompletedTutorials = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const storeCompletedTutorial = (id) => {
  try {
    const completed = getCompletedTutorials()
    if (!completed.includes(id)) {
      completed.push(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
    }
  } catch {
    // ignore
  }
}

const resetCompletedTutorials = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const TutorialContext = createContext({
  tutorials: [],
  activeTutorial: null,
  completedIds: [],
  startTutorial: () => {},
  resetProgress: () => {},
  getTutorialsForPage: () => [],
})

// Load all tutorial JSON files from the data/tutorials folder at build time
const loadTutorials = () => {
  const context = require.context('../data/tutorials', false, /\.json$/)
  return context.keys().map((key) => {
    const tutorial = context(key)
    return tutorial.default || tutorial
  })
}

export const TutorialProvider = ({ children }) => {
  const [tutorials] = useState(() => loadTutorials())
  const [completedIds, setCompletedIds] = useState([])
  const [activeTutorial, setActiveTutorial] = useState(null)
  const driverRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    setCompletedIds(getCompletedTutorials())
  }, [])

  // Launch tutorial from ?tutorial=$id query param
  useEffect(() => {
    if (!router.isReady || activeTutorial) return
    const tutorialId = router.query.tutorial
    if (!tutorialId) return

    const match = tutorials.find((t) => t.id === tutorialId)
    if (!match) return

    // Strip the query param so it doesn't re-trigger
    const { tutorial: _, ...rest } = router.query

    // If the tutorial has a target page and we're not on it, navigate there first
    const targetPage = match.pages?.[0]
    if (targetPage && router.pathname !== targetPage) {
      router.replace({ pathname: targetPage, query: rest }, undefined).then(() => {
        setTimeout(() => runDriver(match), 600)
      })
      return
    }

    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true })

    // Delay to let the page fully render
    setTimeout(() => runDriver(match), 600)
  }, [router.isReady, router.query.tutorial, tutorials])

  // Cleanup driver on unmount or route change
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
    }
  }, [])

  const startTutorial = useCallback(
    (tutorial) => {
      if (driverRef.current) {
        driverRef.current.destroy()
      }

      // If tutorial specifies pages and we're not on any of them, navigate first
      if (tutorial.pages?.length && !tutorial.pages.includes(router.pathname)) {
        router.push(tutorial.pages[0]).then(() => {
          // Small delay to let the page render before starting the tour
          setTimeout(() => runDriver(tutorial), 500)
        })
        return
      }

      runDriver(tutorial)
    },
    [router]
  )

  const runDriver = useCallback((tutorial) => {
    setActiveTutorial(tutorial)

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'cipp-tutorial-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      progressText: '{{current}} of {{total}}',
      steps: tutorial.steps,
      onDestroyed: () => {
        storeCompletedTutorial(tutorial.id)
        setCompletedIds(getCompletedTutorials())
        setActiveTutorial(null)
        driverRef.current = null
      },
    })

    driverRef.current = driverObj
    driverObj.drive()
  }, [])

  const resetProgress = useCallback(() => {
    resetCompletedTutorials()
    setCompletedIds([])
  }, [])

  const getTutorialsForPage = useCallback(
    (pathname) => {
      return tutorials.filter((t) => !t.pages || t.pages.length === 0 || t.pages.includes(pathname))
    },
    [tutorials]
  )

  const value = useMemo(
    () => ({
      tutorials,
      activeTutorial,
      completedIds,
      startTutorial,
      resetProgress,
      getTutorialsForPage,
    }),
    [tutorials, activeTutorial, completedIds, startTutorial, resetProgress, getTutorialsForPage]
  )

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
}

export const useTutorials = () => useContext(TutorialContext)
