import React from 'react'
import {
  CContainer,
  CHeader,
  // CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
// import AppBreadcrumb from 'src/components/layout/AppBreadcrumb'
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
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
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
