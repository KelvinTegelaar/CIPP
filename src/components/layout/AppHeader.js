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
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import AppBreadcrumb from 'src/components/layout/AppBreadcrumb'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebarShow } from 'src/store/features/app'
import { faCaretSquareRight, faCaretSquareLeft } from '@fortawesome/free-regular-svg-icons'

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
        <TenantSelector NavSelector={true} />
        <CHeaderNav className="ms-3">

          <AppHeaderSearch />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
