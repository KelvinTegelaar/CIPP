import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faBook, faEdit, faEllipsisV, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { TitleButton } from 'src/components/buttons'

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
            label: 'Create template based on policy (beta)',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalUrl: `/api/AddIntuneTemplate?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&URLName=${row.URLName}`,
            modalMessage: 'Are you sure you want to create a template based on this policy?',
          },
          {
            label: 'Delete Policy',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrashAlt} className="me-2" />,
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
    maxWidth: '80px',
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
      titleButton={
        <>
          <TitleButton
            href={`/endpoint/MEM/add-policy?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
            title="Deploy MEM Policy"
          />
        </>
      }
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
