import React from 'react'
import {
  CCardGroup,
  CCardText,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import {
  faUser,
  faCog,
  faBars,
  faUserTimes,
  faKey,
  faBan,
  faExchangeAlt,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippDatatable, cellBooleanFormatter } from '../../../components/cipp'
import { setModalContent } from 'src/store/features/modal'
import { CCard, CCardBody, CCardHeader, CCardTitle, CSpinner } from '@coreui/react'
import { useLazyGenericGetRequestQuery } from '../../../store/api/app'

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportselector: 'displayName',
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
    exportselector: 'mail',
  },
  {
    name: 'User Type',
    selector: (row) => row['userType'],
    sortable: true,
    exportselector: 'userType',
  },
  {
    name: 'Account Enabled',
    selector: (row) => row['accountEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportselector: 'accountEnabled',
  },
  {
    name: 'On Premise Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportselector: 'onPremisesSyncEnabled',
  },
  {
    name: 'Licenses',
    selector: (row) => 'Click to Expand',
    exportselector: 'LicJoined',
  },
  {
    name: 'id',
    selector: (row) => row['id'],
    omit: true,
  },
]

const ListAlerts = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    //why not in table?
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data.LicJoined, null, 2)}</pre>
  )

  return (
    <div>
      <CCardGroup>
        <CCard>
          <CCardBody>
            <CCardTitle>New Alerts</CCardTitle>
            <CCardText>10</CCardText>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardBody>
            <CCardTitle>In Progress Alerts</CCardTitle>
            <CCardText>80</CCardText>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardBody>
            <CCardTitle>High Severity Alerts</CCardTitle>
            <CCardText>17</CCardText>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardBody>
            <CCardTitle>Medium Severity Alerts</CCardTitle>
            <CCardText>15</CCardText>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardBody>
            <CCardTitle>Low Severity Alerts</CCardTitle>
            <CCardText>12 </CCardText>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardBody>
            <CCardTitle>Informational Alerts</CCardTitle>
            <CCardText>5</CCardText>
          </CCardBody>
        </CCard>
      </CCardGroup>
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Alerts List</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            tableProps={{
              expandableRows: true,
              expandableRowsComponent: ExpandedComponent,
              expandOnRowClicked: true,
              responsive: false,
            }}
            reportName={`${tenant?.defaultDomainName}-Users`}
            path="/api/ListUsers"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ListAlerts
