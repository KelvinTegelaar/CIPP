import React, { useEffect, Suspense } from 'react'
import { AppSidebar, AppFooter, AppHeader, FullScreenLoading } from '../components/index'
import SharedModal from '../components/SharedModal'
import Toasts from '../components/Toasts'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { CContainer } from '@coreui/react'

const DefaultLayout = () => {
  const theme = useSelector((state) => state.app.currentTheme)
  useEffect(() => {
    document.body.classList.add(theme)
  })
  return (
    <div>
      <SharedModal />
      <Toasts />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
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
