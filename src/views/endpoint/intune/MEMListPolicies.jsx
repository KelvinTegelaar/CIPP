import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import {
  faBook,
  faEdit,
  faEllipsisV,
  faGlobeEurope,
  faPager,
  faTrashAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'
import { CippActionsOffcanvas, CippCodeBlock } from 'src/components/utilities'
import { TitleButton } from 'src/components/buttons'

const Actions = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)

  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <>
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
            label: 'Create template based on policy ',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalUrl: `/api/AddIntuneTemplate?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&URLName=${row.URLName}`,
            modalMessage: 'Are you sure you want to create a template based on this policy?',
          },
          {
            icon: <FontAwesomeIcon icon={faUser} />,
            label: ' Assign to All Users',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignPolicy?AssignTo=allLicensedUsers&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&type=${row.URLName}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all users?`,
          },
          {
            icon: <FontAwesomeIcon icon={faPager} />,
            label: ' Assign to All Devices',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignPolicy?AssignTo=AllDevices&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&type=${row.URLName}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all devices?`,
          },
          {
            icon: <FontAwesomeIcon icon={faGlobeEurope} />,
            label: ' Assign Globally (All Users / All Devices)',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecAssignPolicy?AssignTo=AllDevicesAndUsers&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&type=${row.URLName}`,
            modalMessage: `Are you sure you want to assign ${row.displayName} to all users and devices?`,
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
    exportSelector: 'id',
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
    <CippCodeBlock code={JSON.stringify(data, null, 2)} language="json" />
  )

  return (
    <CippPageList
      title="Configuration Policies"
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
