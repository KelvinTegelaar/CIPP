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
        <CSidebarBrand className="d-none d-md-flex" to="/">
          <CImage className="sidebar-brand-full" src={cyberdrainlogo} height={80} />
          <CImage className="sidebar-brand-narrow" src={cyberdrainlogo} height={80} />
        </CSidebarBrand>
        {/* <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </CHeaderToggler> */}
        <CHeaderBrand className="mx-auto d-md-none" to="/">
          <CImage src={cyberdrainlogo} height={48} alt="Logo" />
        </CHeaderBrand>
        <CHeaderNav>
          <CHeaderToggler
            className="ps-1"
            onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}
          >
            <FontAwesomeIcon
              icon={sidebarShow ? faCaretSquareLeft : faCaretSquareRight}
              size="lg"
            />
          </CHeaderToggler>
          <TenantSelector NavSelector={true} />
        </CHeaderNav>
        <CHeaderNav className="ms-6">
          <AppHeaderSearch />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
