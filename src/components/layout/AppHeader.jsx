import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CAlert,
  CAlertLink,
  CHeader,
  CHeaderNav,
  CNavItem,
  CHeaderToggler,
  CButton,
  CFormSwitch,
  CTooltip,
} from '@coreui/react'
import { AppHeaderSearch } from 'src/components/header'
import { CippActionsOffcanvas, TenantSelector } from '../utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { setCurrentTheme, setUserSettings, toggleSidebarShow } from 'src/store/features/app'
import { useMediaPredicate } from 'react-media-hook'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLoadAlertsDashQuery,
} from 'src/store/api/app'
import { useLocation } from 'react-router-dom'

const AppHeader = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const [performedUserSettings, setUserSettingsComplete] = useState(false)
  const currentSettings = useSelector((state) => state.app)
  const sidebarShow = useSelector((state) => state.app.sidebarShow)
  const currentTheme = useSelector((state) => state.app.currentTheme)
  const preferredTheme = useMediaPredicate('(prefers-color-scheme: dark)') ? 'impact' : 'cyberdrain'
  const [cippQueueExtendedInfo, setCippQueueExtendedInfo] = useState([])
  const [cippQueueVisible, setCippQueueVisible] = useState(false)
  const [cippQueueRefresh, setCippQueueRefresh] = useState(
    (Math.random() + 1).toString(36).substring(7),
  )
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

  const [getCippQueueList, cippQueueList] = useLazyGenericGetRequestQuery()

  function loadCippQueue() {
    setCippQueueVisible(true)
    getCippQueueList({ path: 'api/ListCippQueue', params: { refresh: cippQueueRefresh } })
  }

  function refreshCippQueue() {
    setCippQueueRefresh((Math.random() + 1).toString(36).substring(7))
    loadCippQueue()
  }

  useEffect(() => {
    if (cippQueueList.isFetching || cippQueueList.isLoading) {
      setCippQueueExtendedInfo([
        {
          label: 'Fetching recent jobs',
          value: 'Please wait',
          timestamp: Date(),
          link: '#',
        },
      ])
    }
    if (
      cippQueueList.isSuccess &&
      Array.isArray(cippQueueList.data) &&
      cippQueueList.data.length > 0
    ) {
      setCippQueueExtendedInfo(
        cippQueueList.data?.map((job) => ({
          label: `${job.Name}`,
          value: job.Status,
          link: job.Link,
          timestamp: job.Timestamp,
        })),
      )
    } else {
      setCippQueueExtendedInfo([
        { label: 'No jobs to display', value: '', timpestamp: Date(), link: '#' },
      ])
    }
  }, [cippQueueList])

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
              <CTooltip content="Documentation" placement="bottom">
                <CButton variant="ghost">
                  <FontAwesomeIcon icon={'question'} size="lg" />
                </CButton>
              </CTooltip>
            </a>
          </CNavItem>
          <CNavItem>
            <AppHeaderSearch />
          </CNavItem>
          <CNavItem>
            <CTooltip content="Recent Jobs" placement="bottom">
              <CButton variant="ghost" onClick={() => loadCippQueue()} className="me-1">
                <FontAwesomeIcon icon={'history'} size="lg" />
              </CButton>
            </CTooltip>
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
      <CippActionsOffcanvas
        title="Recent Jobs"
        extendedInfo={[]}
        cards={cippQueueExtendedInfo}
        refreshFunction={refreshCippQueue}
        actions={[
          {
            label: 'Clear History',
            color: 'info',
            modal: true,
            modalUrl: `/api/RemoveCippQueue`,
            modalMessage: 'Are you sure you want clear the history?',
            icon: <FontAwesomeIcon icon="trash" className="me-2" />,
          },
        ]}
        placement="end"
        visible={cippQueueVisible}
        id="cipp-queue"
        hideFunction={() => setCippQueueVisible(false)}
      />
    </>
  )
}

export default AppHeader
