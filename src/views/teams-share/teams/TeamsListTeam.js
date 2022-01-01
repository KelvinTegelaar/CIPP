import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const dropdown = (row, rowIndex, formatExtraData) => (
  <CDropdown style={{ position: 'fixed', zIndex: 1000 }}>
    <CDropdownToggle size="sm" color="link">
      <FontAwesomeIcon icon={faBars} />
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/teams-share/teams/view-team-settings}`}>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          View Team Settings
        </Link>
      </CDropdownItem>
      <CDropdownItem href="#">
        <Link className="dropdown-item" to={`/identity/administration/EditGroup}`}>
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Edit Group
        </Link>
      </CDropdownItem>
      <CDropdownItem href="#">Delete Team</CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
)

const columns = [
  {
    name: 'Name',
    selector: 'displayName',
    sort: true,
  },
  {
    name: 'Description',
    selector: 'description',
    sort: true,
  },
  {
    name: 'Visibility',
    selector: 'visibility',
    sort: true,
  },
  {
    name: 'Mail nickname',
    selector: 'mailNickname',
    sort: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const TeamsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Teams list</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Teams-List`}
            path="/api/ListTeams?type=list"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TeamsList
