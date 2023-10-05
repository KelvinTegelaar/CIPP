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
  CFormSwitch,
} from '@coreui/react'
import { AppHeaderDropdown, AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import cyberdrainlogolight from 'src/assets/images/CIPP.png'
import cyberdrainlogodark from 'src/assets/images/CIPP_Dark.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretSquareLeft, faCaretSquareRight } from '@fortawesome/free-solid-svg-icons'
import { setCurrentTheme, toggleSidebarShow } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import { useLoadAlertsDashQuery } from 'src/store/api/app'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { RFFCFormCheck } from '../forms'

const AppHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const { data: dashboard } = useLoadAlertsDashQuery()
  const SwitchTheme = () => {
    let targetTheme = preferredTheme
    if (currentTheme === 'impact') {
      targetTheme = 'cyberdrain'
    } else {
      targetTheme = 'impact'
    }
    document.body.classList = []
    document.body.classList.add(`theme-${targetTheme}`)
    document.body.dataset.theme = targetTheme

    dispatch(setCurrentTheme({ theme: targetTheme }))
  }

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
            <div className="custom-switch-wrapper primary">
              <CFormSwitch
                onChange={SwitchTheme}
                checked={currentTheme === 'impact'}
                size="xl"
                style={{ width: '3.5rem', marginTop: '0.5em' }}
              ></CFormSwitch>
              {currentTheme === 'impact' ? (
                <FontAwesomeIcon
                  style={{ marginLeft: '-0.3em', marginTop: '0.3em' }}
                  className="switch-icon"
                  icon={'moon'}
                />
              ) : (
                <FontAwesomeIcon
                  style={{ marginLeft: '0.3em', marginTop: '0.3em' }}
                  className="switch-icon"
                  icon={'sun'}
                  color="#f77f00"
                />
              )}
            </div>
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
