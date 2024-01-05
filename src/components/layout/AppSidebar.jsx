import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CHeaderNav,
  CImage,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
} from '@coreui/react'
import { AppSidebarNav } from 'src/components/layout'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import navigation from 'src/_nav'
import { setSidebarVisible } from 'src/store/features/app'
import cyberdrainlogolight from 'src/assets/images/CIPP.png'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.app.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)

  return (
    <CSidebar
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
      position="fixed"
      unfoldable={false}
      visible={sidebarShow}
    >
      <CSidebarBrand className="me-auto pt-xs-2 p-md-2" to="/">
        <CImage className="sidebar-brand-full mt-3" src={cyberdrainlogolight} height={80} />
        <CHeaderNav className="me-2 p-2"></CHeaderNav>
      </CSidebarBrand>
      <CCloseButton
        className="d-lg-none"
        onClick={() => dispatch({ type: 'set', sidebarShow: false })}
      />
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navigation} />
        </SimpleBar>
      </CSidebarNav>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
