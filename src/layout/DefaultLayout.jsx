import React, { useEffect, Suspense, useCallback } from 'react'
import { AppFooter, AppHeader, AppSidebar } from 'src/components/layout'
import { FullScreenLoading, ModalRoot, FastSwitcherModal, Toasts } from 'src/components/utilities'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { toggleSwitcher } from 'src/store/features/switcher'
import { useHotkeys } from 'react-hotkeys-hook'
import { useMediaPredicate } from 'react-media-hook'

const DefaultLayout = () => {
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const themePreference = useSelector((state) => state.app.currentTheme)
  const dispatch = useDispatch()

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
  )
}

export default DefaultLayout
