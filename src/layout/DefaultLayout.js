import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import SharedModal from '../components/SharedModal'
import Toasts from '../components/Toasts'

const DefaultLayout = () => {
  return (
    <div>
      <SharedModal />
      <Toasts />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
