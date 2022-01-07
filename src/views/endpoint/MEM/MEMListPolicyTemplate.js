import React from 'react'
import { useSelector } from 'react-redux'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalService } from '../../../components'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const Dropdown = (row, index, column) => {
  const [ExecuteGetRequest, GetRequestResult] = useLazyGenericGetRequestQuery()
  const handleDropdownConfirm = (apiurl) => {
    ExecuteGetRequest({ url: apiurl })
    //this isnt working all the way yet.
    ModalService.confirm({
      title: 'Results',
      body: (
        <div>
          {GetRequestResult.isSuccess && (
            <>
              <CSpinner />
            </>
          )}
          {GetRequestResult.isSuccess && GetRequestResult.data.Results}
        </div>
      ),
      confirmLabel: 'Continue',
    })
  }
  const handleDropdownEvent = (apiurl, message) => {
    ModalService.confirm({
      title: 'Confirm',
      body: <div>{message}</div>,
      onConfirm: () => handleDropdownConfirm(apiurl),
      confirmLabel: 'Continue',
      cancelLabel: 'Cancel',
    })
  }
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/RemoveIntuneTemplate?ID=${row.GUID}`,
              `Are you sure you want to delete the standard ${row.Displayname}`,
            )
          }
          href="#"
        >
          Delete Standard
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['Displayname'],
    sortable: true,
  },
  {
    name: 'Description',
    selector: (row) => row['Description'],
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row) => row['Type'],
    sortable: true,
  },
  {
    name: 'GUID',
    selector: (row) => row['GUID'],
    omit: true,
  },
  {
    name: 'Action',
    cell: Dropdown,
  },
]

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */
const ExpandedComponent = ({ data }) => <pre>{data.RAWJson}</pre>

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle>Available Endpoint Manager Templates</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            tableProps={{
              expandableRows: true,
              expandableRowsComponent: ExpandedComponent,
              expandOnRowClicked: true,
              responsive: false,
            }}
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-MEMPolicyTemplates-List`}
            path="/api/ListIntuneTemplates"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListTemplates
