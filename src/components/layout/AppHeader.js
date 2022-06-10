import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CImage,
  CSidebarBrand,
} from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import cyberdrainlogolight from 'src/assets/images/CIPP.png'
import cyberdrainlogodark from 'src/assets/images/CIPP_Dark.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import { toggleSidebarShow } from 'src/store/features/app'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)

  return (
    <CHeader position="sticky">
      <CContainer fluid>
        <CSidebarBrand className="me-auto p-2" to="/">
          <CImage
            className="sidebar-brand-full me-2"
            src={currentTheme === 'impact' ? cyberdrainlogolight : cyberdrainlogodark}
            height={80}
          />
          <CHeaderNav className="me-2 p-2">
            <CHeaderToggler
              className="me-2"
              onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}
            >
              <FontAwesomeIcon
                icon={sidebarShow ? faCaretSquareLeft : faCaretSquareRight}
                size="lg"
                className="me-2"
              />
            </CHeaderToggler>
            <TenantSelector className="me-2" NavSelector={true} />
          </CHeaderNav>
        </CSidebarBrand>

        <CHeaderNav className="ms-auto p-2">
          <AppHeaderSearch />
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
