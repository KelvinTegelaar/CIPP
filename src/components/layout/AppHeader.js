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
} from '@coreui/react'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import AppBreadcrumb from 'src/components/layout/AppBreadcrumb'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import cyberdrainlogo from 'src/assets/images/CIPP.png'
import { toggleSidebarShow } from 'src/store/features/app'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand className="mx-auto d-md-none" to="/">
          <CImage src={cyberdrainlogo} height={48} alt="Logo" />
        </CHeaderBrand>
        <CHeaderNav className="ms-3">
          <AppHeaderSearch />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      {/* Disabled until we have functional links for each breadcrumb level */}
      {/*<CHeaderDivider />
      <CContainer fluid>
        <AppBreadcrumb />
      </CContainer>*/}
    </CHeader>
  )
}

export default AppHeader
