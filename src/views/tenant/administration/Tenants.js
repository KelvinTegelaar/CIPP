import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'

const dropdown = (row, index, column) => {
  return (
    <CDropdown>
      <CDropdownToggle color="primary">...</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">Edit Group</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}
const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Default Domain',
    selector: (row) => row['defaultDomainName'],
    sortable: true,
  },
  {
    name: 'M365 Portal',
    selector: (row) => row['customerId'],
    //formatter: linkCog(
    //  (cell) =>
    //    `https://portal.office.com/Partner/BeginClientSession.aspx?CTID=${cell}&CSDEST=o365admincenter`,
    //),
  },
  {
    name: 'Exchange Portal',
    selector: (row) => row['defaultDomainName'],
    //  formatter: linkCog(
    //  (cell) => `https://outlook.office365.com/ecp/?rfr=Admin_o365&exsvurl=1&delegatedOrg=${cell}`,
    // ),
  },
  {
    name: 'AAD Portal',
    selector: (row) => row['defaultDomainName'],
    //   formatter: linkCog((cell) => `https://aad.portal.azure.com/${cell}`),
  },
  {
    name: 'Teams Portal',
    selector: (row) => row['defaultDomainName'],
    //   formatter: linkCog((cell) => `https://admin.teams.microsoft.com/?delegatedOrg=${cell}`),
  },
  {
    name: 'Azure Portal',
    selector: (row) => row['defaultDomainName'],
    //  formatter: linkCog((cell) => `https://portal.azure.com/${cell}`),
  },
  {
    name: 'MEM (Intune) Portal',
    selector: (row) => row['defaultDomainName'],
    //   formatter: linkCog((cell) => `https://endpoint.microsoft.com/${cell}`),
  },
  {
    name: 'Action',
    formatter: dropdown,
  },

  // @todo not used at the moment?
  // {
  //   name: 'Domains',
  //   selector: 'defaultDomainName',
  // },
]

const RolesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Applications List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListAPDevices"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default RolesList
