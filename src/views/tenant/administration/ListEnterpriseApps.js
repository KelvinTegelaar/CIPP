import { CButton } from '@coreui/react'
import { faEllipsisV, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellNullTextFormatter } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellLogoFormatter } from 'src/components/tables/CellLogo'
import { CellTip } from 'src/components/tables/CellGenericFormat'

const EnterpriseApplications = () => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const tenant = useSelector((state) => state.app.currentTenant)
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenantColumnSet])

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
      name: '',
      selector: (row) => row.info,
      cell: cellLogoFormatter(),
      maxWidth: '1px',
    },
    {
      name: 'Application Name',
      selector: (row) => row.displayName,
      sortable: true,
      exportSelector: 'displayName',
      cell: cellNullTextFormatter(),
    },
    {
      name: 'Application Id',
      selector: (row) => row.appId,
      sortable: true,
      exportSelector: 'appId',
    },
    {
      name: 'Created',
      selector: (row) => row.createdDateTime,
      sortable: true,
      exportSelector: 'createdDateTime',
      cell: cellDateFormatter({ format: 'short' }),
    },
    {
      name: 'Publisher',
      selector: (row) => row.publisherName,
      sortable: true,
      exportSelector: 'publisherName',
    },
    {
      name: 'Homepage',
      selector: (row) => row.homepage,
      sortable: true,
      exportSelector: 'homepage',
      cell: cellDateFormatter({ format: 'short' }),
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Enterprise Applications"
        tenantSelector={false}
        datatable={{
          filterlist: [
            {
              filterName: 'All Enterprise Apps',
              filter: "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')",
              graphFilter: true,
            },
            {
              filterName: 'Enterprise Apps (SAML)',
              filter: "tags/any(t:t eq 'WindowsAzureActiveDirectoryGalleryApplicationPrimaryV1')",
              graphFilter: true,
            },
          ],
          tableProps: {
            selectableRows: true,
          },
          keyField: 'id',
          columns,
          reportName: `Enterprise Applications`,
          path: '/api/ListGraphRequest',
          params: {
            TenantFilter: tenant?.defaultDomainName,
            Endpoint: 'servicePrincipals',
            Parameters: {
              $filter: "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')",
              $select:
                'appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags',
              $count: true,
            },
          },
        }}
      />
    </div>
  )
}

export default EnterpriseApplications
