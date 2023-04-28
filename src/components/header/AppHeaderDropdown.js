import React, { useState, useEffect } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
} from '@coreui/react'
import { faUser, faBook, faSignOutAlt, faHistory, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { authApi } from 'src/store/api/auth'
import { CippProfile, CippOffcanvas, CippActionsOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const AppHeaderDropdown = () => {
  const [profileVisible, setProfileVisible] = useState(false)
  const [cippQueueExtendedInfo, setCippQueueExtendedInfo] = useState([])
  const [cippQueueVisible, setCippQueueVisible] = useState(false)
  const [cippQueueRefresh, setCippQueueRefresh] = useState('')
  const { data: profile } = authApi.endpoints.loadClientPrincipal.useQueryState()

  const [getCippQueueList, cippQueueList] = useLazyGenericGetRequestQuery()

  function loadCippQueue() {
    setCippQueueVisible(true)
    setCippQueueRefresh((Math.random() + 1).toString(36).substring(7))
    getCippQueueList({ path: `api/ListCippQueue?refresh=${cippQueueRefresh}` })
  }

  useEffect(() => {
    if (cippQueueList.isFetching) {
      setCippQueueExtendedInfo([
        {
          label: 'Fetching recent jobs',
          value: 'Please wait',
          timpestamp: Date(),
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

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          <CAvatar color="primary" textColor="white" size="md">
            {profile.clientPrincipal.userDetails[0].toUpperCase()}
          </CAvatar>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="fw-semibold py-2">Settings</CDropdownHeader>
          <CLink className="dropdown-item" href="#" onClick={() => setProfileVisible(true)}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Profile
          </CLink>
          <CLink className="dropdown-item" href="#" onClick={() => loadCippQueue()}>
            <FontAwesomeIcon icon={faHistory} className="me-2" />
            Recent Jobs
          </CLink>
          <Link className="dropdown-item" to="/cipp/logs">
            <FontAwesomeIcon icon={faBook} className="me-2" />
            Logbook
          </Link>
          <Link className="dropdown-item" to="/logout">
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Logout
          </Link>
        </CDropdownMenu>
      </CDropdown>
      <CippOffcanvas
        id="cipp-profile"
        visible={profileVisible}
        hideFunction={() => setProfileVisible(false)}
        title="Profile"
        placement="end"
      >
        <CippProfile />
      </CippOffcanvas>
      <CippActionsOffcanvas
        title="Recent Jobs"
        extendedInfo={[]}
        cards={cippQueueExtendedInfo}
        actions={[
          {
            label: 'Clear History',
            color: 'info',
            modal: true,
            modalUrl: `/api/RemoveCippQueue`,
            modalMessage: 'Are you sure you want clear the history?',
            icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
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

export default AppHeaderDropdown
