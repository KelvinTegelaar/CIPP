import React from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useSelector } from 'react-redux'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { cellBooleanFormatter } from '../../../components/cipp'
import { faBars, faCog } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const dropdown = (row = {}) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${row.primDomain}`}
          >
            <FontAwesomeIcon icon={faCog} className="me-2" />
            Edit Group
          </Link>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Group Type',
    selector: (row) => row['calculatedGroupType'],
    sortable: true,
  },
  {
    name: 'Dynamic Group',
    selector: (row) => row['dynamicGroupBool'],
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Teams Enabled',
    selector: (row) => row['teamsEnabled'],
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'On-Prem Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter({ warning: true }),
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
  },
  {
    name: 'Action',
    cell: dropdown,
  },
]

const Groups = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Groups</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            reportName={`${tenant?.defaultDomainName}-Groups`}
            path="/api/ListGroups"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Groups
