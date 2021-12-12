import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable, { ExpanderComponentProps } from '../../../components/cipp/CippDatatable'
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
    selector: 'Displayname',
    name: 'Policy Name',
    sortable: true,
  },
  {
    selector: 'Description',
    name: 'Description',
    sortable: true,
  },
  {
    selector: 'Type',
    name: 'Type',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */
const ExpandedComponent = ({ data }) => <pre>{JSON.stringify(data, null, 2)}</pre>

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Available Endpoint Manager Templates</h3>
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListIntuneTemplates"
          columns={columns}
          expandableRows={true}
          expandableRowExpanded={ExpandedComponent}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default AutopilotListTemplates
