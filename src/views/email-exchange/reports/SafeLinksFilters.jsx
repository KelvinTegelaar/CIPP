import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellBooleanFormatter, CellTip } from 'src/components/tables'
import { cellTableFormatter } from 'src/components/tables/CellTable'

const ListSafeLinksFilters = () => {
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
              modalUrl: `/api/EditSafeLinksFilter?State=Enable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to enable this rule?',
            },
            {
              label: 'Disable Rule',
              color: 'info',
              icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
              modal: true,
              modalUrl: `/api/EditSafeLinksFilter?State=Disable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to disable this rule?',
            },
            /*{
              label: 'Delete Rule',
              color: 'danger',
              modal: true,
              icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
              modalUrl: `/api/RemoveSafeLinksFilter?TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
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
      name: 'SafeLinks For Email',
      selector: (row) => row['EnableSafeLinksForEmail'],
      exportSelector: 'EnableSafeLinksForEmail',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'SafeLinks For Teams',
      selector: (row) => row['EnableSafeLinksForTeams'],
      exportSelector: 'EnableSafeLinksForTeams',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'SafeLinks For Office',
      selector: (row) => row['EnableSafeLinksForOffice'],
      exportSelector: 'EnableSafeLinksForOffice',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Track Clicks',
      selector: (row) => row['TrackClicks'],
      exportSelector: 'TrackClicks',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Scan Urls',
      selector: (row) => row['ScanUrls'],
      exportSelector: 'ScanUrls',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Enable For Internal Senders',
      selector: (row) => row['EnableForInternalSenders'],
      exportSelector: 'EnableForInternalSenders',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Deliver Message After Scan',
      selector: (row) => row['DeliverMessageAfterScan'],
      exportSelector: 'DeliverMessageAfterScan',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Allow Click Through',
      selector: (row) => row['AllowClickThrough'],
      exportSelector: 'AllowClickThrough',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Disable Url Rewrite',
      selector: (row) => row['DisableUrlRewrite'],
      exportSelector: 'DisableUrlRewrite',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Organization Branding',
      selector: (row) => row['EnableOrganizationBranding'],
      exportSelector: 'EnableOrganizationBranding',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
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
        title="List of Safe Link Filters"
        capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
        datatable={{
          columns: columns,
          path: '/api/ListSafeLinksFilters',
          reportName: `${tenant?.defaultDomainName}-SafeLinkFilters`,
          params: {
            TenantFilter: tenant.defaultDomainName,
          },
        }}
      />
    </>
  )
}

export default ListSafeLinksFilters
