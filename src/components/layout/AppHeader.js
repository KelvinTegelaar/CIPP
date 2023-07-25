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
} from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import cyberdrainlogolight from 'src/assets/images/CIPP.png'
import cyberdrainlogodark from 'src/assets/images/CIPP_Dark.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import { toggleSidebarShow } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import { useLoadAlertsDashQuery } from 'src/store/api/app'
const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const { data: dashboard } = useLoadAlertsDashQuery()

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
            <AppHeaderSearch />
          </CNavItem>
          <CNavItem>
            <AppHeaderDropdown />
          </CNavItem>
        </CHeaderNav>
      </CHeader>

      {dashboard &&
        dashboard.length >= 1 &&
        dashboard.map((item, index) => (
          <div
            className="mb-3"
            style={{ zIndex: 10000, 'padding-left': '20rem', 'padding-right': '3rem' }}
          >
            <CAlert key={index} color={item.type} variant dismissible>
              {item.Alert} <CAlertLink href={item.link}>Link</CAlertLink>
            </CAlert>
          </div>
        ))}
    </>
  )
}

export default AppHeader
