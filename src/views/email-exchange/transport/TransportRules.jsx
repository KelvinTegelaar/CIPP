import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  //console.log(row)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Extended Information"
        extendedInfo={[
          { label: 'Created by', value: `${row.CreatedBy}` },
          { label: 'Last edit by', value: `${row.LastModifiedBy}` },
          { label: 'Description', value: `${row.Description}` },
        ]}
        actions={[
          {
            label: 'Create template based on rule',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalBody: row,
            modalType: 'POST',
            modalUrl: `/api/AddTransportTemplate`,
            modalMessage: 'Are you sure you want to create a template based on this rule?',
          },
          {
            label: 'Enable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditTransportRule?State=Enable&TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}`,
            modalMessage: 'Are you sure you want to enable this rule?',
          },
          {
            label: 'Disable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditTransportRule?State=Disable&TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}`,
            modalMessage: 'Are you sure you want to disable this rule?',
          },
          {
            label: 'Delete Rule',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
            modalUrl: `/api/RemoveTransportRule?TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}`,
            modalMessage: 'Are you sure you want to disable this rule?',
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
    name: 'Name',
    selector: (row) => row['Name'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['Name']),
    exportSelector: 'Name',
  },
  {
    name: 'State',
    selector: (row) => row['State'],
    sortable: true,
    exportSelector: 'State',
  },
  {
    name: 'Mode',
    selector: (row) => row['Mode'],
    sortable: true,
    exportSelector: 'Mode',
  },
  {
    name: 'Error Action',
    selector: (row) => row['RuleErrorAction'],
    sortable: true,
    exportSelector: 'RuleErrorAction',
  },
  {
    name: 'description',
    selector: (row) => row['Description'],
    omit: true,
    exportSelector: 'Description',
  },
  {
    name: 'GUID',
    selector: (row) => row['Guid'],
    omit: true,
    exportSelector: 'Guid',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
    maxWidth: '80px',
  },
]

const TransportRulesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Transport Rules"
      tenantSelector={true}
      titleButton={
        <>
          <TitleButton
            href={`/email/transport/deploy-rules?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
            title="Deploy Transport Rule"
          />
        </>
      }
      datatable={{
        filterlist: [
          { filterName: 'Enabled rules', filter: 'Complex: State eq Enabled' },
          { filterName: 'Disabled rules', filter: 'Complex: State eq Disabled' },
        ],
        reportName: `${tenant?.defaultDomainName}-transport-rules-list`,
        path: '/api/ListTransportRules',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default TransportRulesList
