import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CAlert,
  CAlertLink,
  CContainer,
  CCollapse,
  CHeader,
  CHeaderNav,
  CNavItem,
  CHeaderToggler,
  CImage,
  CSidebarBrand,
  CButton,
} from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import cyberdrainlogolight from 'src/assets/images/CIPP.png'
import cyberdrainlogodark from 'src/assets/images/CIPP_Dark.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import { toggleSidebarShow } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const AppHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'

  return (
    <>
      <CHeader position="sticky">
        <CSidebarBrand className="me-auto pt-xs-2 p-md-2" to="/">
          <CImage
            className="sidebar-brand-full me-2"
            src={
              currentTheme === 'cyberdrain' || preferredTheme === 'cyberdrain'
                ? cyberdrainlogodark
                : cyberdrainlogolight
            }
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
          </CHeaderNav>
        </CSidebarBrand>
        <CHeaderNav className="p-md-2 flex-grow-1">
          <TenantSelector NavSelector={true} />
          <CNavItem>
            <a
              target="_blank"
              href={`https://docs.cipp.app/user-documentation${location.pathname}`}
            >
              <CButton variant="ghost">
                <FontAwesomeIcon icon={'question'} size="lg" />
              </CButton>
            </a>
          </CNavItem>
          <CNavItem>
            <AppHeaderSearch />
          </CNavItem>
          <CNavItem>
            <AppHeaderDropdown />
          </CNavItem>
        </CHeaderNav>
      </CHeader>
    </>
  )
}

export default AppHeader
