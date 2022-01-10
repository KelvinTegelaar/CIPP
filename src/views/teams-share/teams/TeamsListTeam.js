import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CButton, CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

const TeamsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const dropdown = (row, rowIndex, formatExtraData) => (
    <>
      <Link to={`ViewTeam&Tenantfilter=${tenant.defaultDomainName}&GroupID=${row.id}`}>
        <CButton size="sm" variant="ghost" color="success">
          <FontAwesomeIcon icon={faEye} />
        </CButton>
      </Link>
      <Link
        to={`/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
      >
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
    </>
  )

  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sort: true,
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
      sort: true,
    },
    {
      name: 'Visibility',
      selector: (row) => row['visibility'],
      sort: true,
    },
    {
      name: 'Mail nickname',
      selector: (row) => row['mailNickname'],
      sort: true,
    },
    {
      name: 'ID',
      selector: (row) => row['id'],
      omit: true,
    },
    {
      name: 'Actions',
      cell: dropdown,
    },
  ]

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Teams</CCardTitle>
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
