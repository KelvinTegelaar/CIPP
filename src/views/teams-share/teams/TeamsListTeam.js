import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const dropdown = (row, rowIndex, formatExtraData) => (
  <CDropdown>
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
      <div className="bg-white rounded p-5">
        <h3>Teams List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Teams-List`}
          path="/api/ListTeams?type=list"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default TeamsList
