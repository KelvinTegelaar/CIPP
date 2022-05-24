import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  // CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CImage,
  CSidebarBrand,
} from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import cyberdrainlogo from 'src/assets/images/CIPP.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import { toggleSidebarShow } from 'src/store/features/app'

// import AppBreadcrumb from 'src/components/layout/AppBreadcrumb'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { toggleSidebarShow } from 'src/store/features/app'
//import { faCaretSquareRight, faCaretSquareLeft } from '@fortawesome/free-regular-svg-icons'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)

  return (
    <CHeader position="sticky">
      <CContainer fluid>
        <CSidebarBrand className="me-auto p-2" to="/">
          <CImage className="sidebar-brand-full" src={cyberdrainlogo} height={80} />
        </CSidebarBrand>
        <CHeaderNav className="me-auto p-2">
          <CHeaderToggler onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}>
            <FontAwesomeIcon
              icon={sidebarShow ? faCaretSquareLeft : faCaretSquareRight}
              size="lg"
            />
          </CHeaderToggler>
          <TenantSelector NavSelector={true} />
        </CHeaderNav>
        <CHeaderNav className="ms-auto p-2">
          <AppHeaderSearch />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
