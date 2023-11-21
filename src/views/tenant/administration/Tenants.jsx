import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'
import Portals from 'src/data/portals'
import { CippTenantOffcanvasRow } from 'src/components/utilities/CippTenantOffcanvas'

const TenantsList = () => {
  const TenantListSelector = useSelector((state) => state.app.TenantListSelector)
  const tenant = useSelector((state) => state.app.currentTenant)
  const [columnOmits, setOmitVisible] = useState(TenantListSelector)

  const generatePortalColumn = (portal) => ({
    name: portal.label,
    omit: columnOmits,
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={portal.url.replace(portal.variable, row[portal.variable])}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={portal.icon} className="me-2" />
      </a>
    ),
  })

  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
      minWidth: '250px',
    },
    {
      name: 'Default Domain',
      selector: (row) => row['defaultDomainName'],
      sortable: true,
      cell: (row) => CellTip(row['defaultDomainName']),
      exportSelector: 'defaultDomainName',
      minWidth: '200px',
    },
    ...Portals.map(generatePortalColumn),
    {
      exportSelector: 'customerId',
    },
    {
      name: 'Actions',
      center: true,
      cell: CippTenantOffcanvasRow,
    },
  ]
  const titleButton = (
    <TitleButton
      icon={'faCog'}
      onClick={() => setOmitVisible(!columnOmits)}
      title={columnOmits ? 'Show Direct Links' : 'Hide Direct Links'}
    />
  )
  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Tenants"
      tenantSelector={false}
      titleButton={titleButton}
      datatable={{
        keyField: 'id',
        columns,
        reportName: `${tenant.tenantId}-Tenants-List`,
        path: '/api/ListTenants',
      }}
    />
  )
}

export default TenantsList
