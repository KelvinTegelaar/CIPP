/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { CellTip } from 'src/components/tables/CellGenericFormat'

const AppConsentRequests = () => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const tenant = useSelector((state) => state.app.currentTenant)
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
    },
    {
      name: 'Retrieval Status',
      selector: (row) => row['CippStatus'],
      sortable: true,
      cell: (row) => CellTip(row['CippStatus']),
      exportSelector: 'CippStatus',
      omit: tenantColumnSet,
    },
    {
      name: 'Application Name',
      selector: (row) => row.appDisplayName,
      sortable: true,
      exportSelector: 'appDisplayName',
    },
    {
      name: 'Requester',
      selector: (row) => row.requestUser,
      sortable: true,
      exportSelector: 'requestUser',
    },
    {
      name: 'Reason',
      selector: (row) => row.requestReason,
      sortable: true,
      exportSelector: 'requestReason',
    },
    {
      name: 'Status',
      selector: (row) => row.requestStatus,
      sortable: true,
      exportSelector: 'requestStatus',
    },
    {
      name: 'Request Date',
      selector: (row) => row.requestDate,
      sortable: true,
      exportSelector: 'requestDate',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="App Consent Requests"
        tenantSelector={false}
        datatable={{
          filterlist: [
            {
              filterName: 'Pending consent requests',
              filter: 'Complex: requestStatus eq InProgress',
            },
            {
              filterName: 'Expired consent requests',
              filter: 'Complex: requestStatus eq Expired',
            },
            {
              filterName: 'Completed consent requests',
              filter: 'Complex: requestStatus eq Completed',
            },
          ],
          tableProps: {
            selectableRows: true,
          },
          keyField: 'id',
          columns,
          reportName: `App Consent Requests`,
          path: '/api/ListAppConsentRequests',
          params: {
            TenantFilter: tenant?.defaultDomainName,
          },
        }}
      />
    </div>
  )
}

export default AppConsentRequests

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  const entraLink = `https://entra.microsoft.com/${tenant.defaultDomainName}/#view/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/~/AccessRequests`

  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Request Information"
        extendedInfo={[
          { label: 'Requester', value: `${row.requestUser ?? ' '}` },
          { label: 'Application Name', value: `${row.appDisplayName ?? ' '}` },
          { label: 'Application Id', value: `${row.appId ?? ' '}` },
          { label: 'Reason', value: `${row.requestReason ?? ' '}` },
          { label: 'Status', value: `${row.requestStatus ?? ' '}` },
          { label: 'Reviewed by', value: `${row.reviewedBy ?? ' '}` },
          { label: 'Reviewed reason', value: `${row.reviewedJustification ?? ' '}` },
        ]}
        actions={[
          {
            label: 'Review in Entra',
            link: entraLink,
            color: 'info',
            target: '_blank',
            external: true,
          },
          {
            label: 'Approve in Entra',
            link: row.consentUrl,
            color: 'info',
            target: '_blank',
            external: true,
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
