import React, { useEffect, Suspense, useCallback, useState } from 'react'
import { AppFooter, AppHeader, AppSidebar } from 'src/components/layout'
import { FullScreenLoading, ModalRoot, FastSwitcherModal, Toasts } from 'src/components/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { toggleSwitcher } from 'src/store/features/switcher'
import { useHotkeys } from 'react-hotkeys-hook'
import { useMediaPredicate } from 'react-media-hook'
import { setRecentPages } from 'src/store/features/app'
import routes from 'src/routes'
import { Helmet } from 'react-helmet-async'

const DefaultLayout = () => {
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const themePreference = useSelector((state) => state.app.currentTheme)
  const recentPages = useSelector((state) => state.app.recentPages)
  const [lastPage, setLastPage] = useState('')
  const dispatch = useDispatch()
  const location = useLocation()

  const [title, setTitle] = useState('CIPP')
  useEffect(() => {
    let route = routes.find((route) => route.path.toLowerCase() === location.pathname.toLowerCase())
    if (route?.name) {
      //console.log(route)
      setTitle(route.name)
    }
  }, [setTitle, location.pathname])

  let theme
  if (themePreference === 'default') {
    theme = preferredTheme
  } else {
    theme = themePreference
  }
  useEffect(() => {
    document.body.classList = []
    document.body.classList.add(`theme-${theme}`)
    document.body.dataset.theme = theme
  })

  useEffect(() => {
    if (recentPages[0] !== location.pathname && lastPage !== location.pathname) {
      var currentPages = []
      currentPages.push(lastPage)
      if (recentPages.length > 0) {
        recentPages.forEach((page) => {
          if (page !== lastPage) {
            currentPages.push(page)
          }
        })
      }
      currentPages = currentPages.slice(0, 10)
      if (currentPages.length > 0) {
        dispatch(setRecentPages({ recentPages: currentPages }))
      }
    }
    setLastPage(location.pathname)
  }, [location.pathname, recentPages, dispatch, lastPage, setLastPage])

  const handleFastSwitcher = useCallback(() => {
    dispatch(toggleSwitcher())
  }, [dispatch])

  useHotkeys(
    'ctrl+k',
    (event) => {
      handleFastSwitcher()
      event.preventDefault()
    },
    { filterPreventDefault: false },
  )
  useHotkeys(
    'cmd+k',
    (event) => {
      handleFastSwitcher()
      event.preventDefault()
    },
    { filterPreventDefault: false },
  )

  return (
    <>
      <Helmet>
        <title>CIPP - {title}</title>
      </Helmet>
      <div>
        <FastSwitcherModal />
        <ModalRoot />
        <Toasts />

        <AppSidebar />
        <div className="wrapper d-flex flex-column min-vh-100">
          <AppHeader />
          <div className="body flex-grow-1 px-xl-3">
            <CContainer fluid>
              <Suspense fallback={<FullScreenLoading />}>
                <Outlet />
              </Suspense>
            </CContainer>
          </div>
          <AppFooter />
        </div>
      </div>
    </>
  )
}

export default DefaultLayout
