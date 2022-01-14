import React, { useEffect, Suspense, useCallback } from 'react'
import { AppSidebar, AppFooter, AppHeader, FullScreenLoading, ModalRoot } from '../components/index'
import Toasts from '../components/Toasts'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import { toggleSwitcher } from '../store/features/switcher'
import { useHotkeys } from 'react-hotkeys-hook'
import FastSwitcher from '../components/FastSwitcher'

const DefaultLayout = () => {
  const theme = useSelector((state) => state.app.currentTheme)
  useEffect(() => {
    document.body.classList = []
    document.body.classList.add(`theme-${theme}`)
    document.body.dataset.theme = theme
  })

  const dispatch = useDispatch()
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
      <FastSwitcher />
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
