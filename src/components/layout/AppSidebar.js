import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarBrand, CSidebarNav } from '@coreui/react'
import { CImage } from '@coreui/react'
import { AppSidebarNav } from 'src/components/layout'
import cyberdrainlogo from 'src/assets/images/CIPP.png'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import navigation from 'src/_nav'
import { setSidebarVisible } from 'src/store/features/app'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.app.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(setSidebarVisible({ visible }))
      }}
    >
      <CSidebarBrand className="d-none d-md-flex" to="/">
        <CImage className="sidebar-brand-full" src={cyberdrainlogo} height={80} />
        <CImage className="sidebar-brand-narrow" src={cyberdrainlogo} height={80} />
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navigation} />
        </SimpleBar>
      </CSidebarNav>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
