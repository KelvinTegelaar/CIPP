import React, { useState, useEffect } from 'react'
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
import { AppHeaderSearch } from 'src/components/header'
import { TenantSelector } from '../utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { setCurrentTheme, setUserSettings, toggleSidebarShow } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import { useGenericGetRequestQuery, useLoadAlertsDashQuery } from 'src/store/api/app'
import { useLocation } from 'react-router-dom'

const AppHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const [performedUserSettings, setUserSettingsComplete] = useState(false)
  const currentSettings = useSelector((state) => state.app)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const { data: dashboard } = useLoadAlertsDashQuery()
  const {
    data: userSettings,
    isLoading: isLoadingSettings,
    isSuccess: isSuccessSettings,
    isFetching: isFetchingSettings,
  } = useGenericGetRequestQuery({
    path: '/api/ListUserSettings',
  })
  useEffect(() => {
    if (isSuccessSettings && !isLoadingSettings && !isFetchingSettings && !performedUserSettings) {
      dispatch(setUserSettings({ userSettings }))
      setUserSettingsComplete(true)
    }
  }, [
    isSuccessSettings,
    isLoadingSettings,
    isFetchingSettings,
    performedUserSettings,
    dispatch,
    userSettings,
  ])

  const SwitchTheme = () => {
    let targetTheme = preferredTheme
    if (isDark) {
      targetTheme = 'cyberdrain'
    } else {
      targetTheme = 'impact'
    }
    document.body.classList = []
    document.body.classList.add(`theme-${targetTheme}`)
    document.body.dataset.theme = targetTheme

    dispatch(setCurrentTheme({ theme: targetTheme }))
  }
  const isDark =
    currentTheme === 'impact' || (currentTheme === 'default' && preferredTheme === 'impact')
  return (
    <>
      <CHeader position="sticky">
        <CHeaderNav>
          <CHeaderToggler
            className="m-2"
            onClick={() => dispatch(toggleSidebarShow({ sidebarShow }))}
            style={{ marginInlineStart: '-50x' }}
          >
            <FontAwesomeIcon icon={faBars} size="lg" className="me-2" />
          </CHeaderToggler>
        </CHeaderNav>
        <CHeaderNav className="p-md-2 flex-grow-1">
          <TenantSelector NavSelector={true} />
          <CNavItem>
            <a
              rel={'noreferrer'}
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
                checked={isDark}
                size="xl"
                style={{ width: '3.5rem', marginTop: '0.5em' }}
              ></CFormSwitch>
              {isDark ? (
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
      <div className="m-2">
        {dashboard &&
          dashboard.length >= 1 &&
          dashboard.map((item, index) => (
            <div className="m-1" key={index}>
              <CAlert className="m-3" key={index} color={item.type} dismissible>
                {item.Alert} <CAlertLink href={item.link}>Link</CAlertLink>
              </CAlert>
            </div>
          ))}
      </div>
    </>
  )
}

export default AppHeader
