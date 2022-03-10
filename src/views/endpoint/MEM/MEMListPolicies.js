import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'
import { CippActionsOffcanvas } from 'src/components/utilities'

const Actions = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)

  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <>
      <Link
        to={`/endpoint/MEM/edit-policy?ID=${row.id}&tenantDomain=${tenant.defaultDomainName}&urlName=${row.URLName}`}
      >
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Policy Information"
        extendedInfo={[
          { label: 'Created on', value: `${row.createdDateTime}` },
          { label: 'Display Name', value: `${row.displayName}` },
          { label: 'Last Modified', value: `${row.lastModifiedDateTime}` },
          { label: 'Type', value: `${row.PolicyTypeName}` },
        ]}
        actions={[
          {
            label: 'Delete Policy',
            color: 'danger',
            modal: true,
            modalUrl: `/api/RemovePolicy?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&URLName=${row.URLName}`,
            modalMessage: 'Are you sure you want to delete this policy?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['PolicyTypeName'],
    name: 'Profile Type',
    sortable: true,
    exportSelector: 'PolicyTypeName',
  },
  {
    selector: (row) => row['id'],
    name: 'id',
    omit: true,
  },
  {
    name: 'Actions',
    cell: Actions,
  },
]

const IntuneList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )

  return (
    <CippPageList
      title="MEM Policies"
      tenantSelector={true}
      datatable={{
        path: '/api/ListIntunePolicy?type=ESP',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
        reportName: `${tenant?.defaultDomainName}-MEMPolicies-List`,
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
        },
      }}
    />
  )
}

export default IntuneList
