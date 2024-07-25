import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellBooleanFormatter, CellTip } from 'src/components/tables'
import { cellTableFormatter } from 'src/components/tables/CellTable'

const ListSafeAttachmentsFilters = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)

    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Extended Information"
          extendedInfo={[
            {
              label: 'Rule Name',
              value: `${row.RuleName}`,
            },
            {
              label: 'Policy Name',
              value: `${row.Name}`,
            },
            {
              label: 'Enabled',
              value: `${row.State}`,
            },
            {
              label: 'Creation Date',
              value: `${row.WhenCreated}`,
            },
            {
              label: 'Last Modified Date',
              value: `${row.WhenChanged}`,
            },
          ]}
          actions={[
            {
              label: 'Enable Rule',
              color: 'info',
              icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
              modal: true,
              modalUrl: `/api/EditSafeAttachmentsFilter?State=Enable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to enable this rule?',
            },
            {
              label: 'Disable Rule',
              color: 'info',
              icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
              modal: true,
              modalUrl: `/api/EditSafeAttachmentsFilter?State=Disable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to disable this rule?',
            },
            /*{
              label: 'Delete Rule',
              color: 'danger',
              modal: true,
              icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
              modalUrl: `/api/RemoveSafeAttachmentsFilter?TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to delete this rule?',
            },*/
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
      name: 'Rule Name',
      selector: (row) => row['RuleName'],
      sortable: true,
      exportSelector: 'RuleName',
    },
    {
      name: 'Policy Name',
      selector: (row) => row['Name'],
      sortable: true,
      exportSelector: 'Name',
    },
    {
      name: 'Enabled',
      selector: (row) => row['State'],
      exportSelector: 'State',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Priority',
      selector: (row) => row['Priority'],
      sortable: true,
      exportSelector: 'Priority',
      maxWidth: '40px',
    },
    {
      name: 'Recipient Domains',
      selector: (row) => row['RecipientDomainIs'],
      sortable: true,
      exportSelector: 'RecipientDomainIs',
      cell: cellTableFormatter('RecipientDomainIs'),
    },
    {
      name: 'Action',
      selector: (row) => row['Action'],
      sortable: true,
      exportSelector: 'Action',
    },
    {
      name: 'QuarantineTag',
      selector: (row) => row['QuarantineTag'],
      sortable: true,
      exportSelector: 'QuarantineTag',
    },
    {
      name: 'Redirect',
      selector: (row) => row['Redirect'],
      exportSelector: 'Redirect',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Redirect Address',
      selector: (row) => row['RedirectAddress'],
      sortable: true,
      exportSelector: 'RedirectAddress',
    },
    {
      name: 'Creation Date',
      selector: (row) => row['WhenCreated'],
      sortable: true,
      exportSelector: 'WhenCreated',
      cell: cellDateFormatter(),
      maxWidth: '150px',
    },
    {
      name: 'Last Modified Date',
      selector: (row) => row['WhenChanged'],
      sortable: true,
      exportSelector: 'WhenChanged',
      cell: cellDateFormatter(),
      maxWidth: '150px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]

  return (
    <>
      <CippPageList
        title="List of Safe Attachment Filters"
        capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
        datatable={{
          columns: columns,
          path: '/api/ListSafeAttachmentsFilters',
          reportName: `${tenant?.defaultDomainName}-SafeAttachmentsFilters`,
          params: {
            TenantFilter: tenant.defaultDomainName,
          },
        }}
      />
    </>
  )
}

export default ListSafeAttachmentsFilters
