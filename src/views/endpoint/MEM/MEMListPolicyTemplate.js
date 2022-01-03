import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CippDatatable, { ExpanderComponentProps } from '../../../components/cipp/CippDatatable'
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
import { setModalContent } from 'src/store/features/modal'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const Dropdown = (row, index, column) => {
  const dispatch = useDispatch()
  const [ExecuteGetRequest, GetRequestResult] = useLazyGenericGetRequestQuery()
  const handleDropdownConfirm = (apiurl) => {
    ExecuteGetRequest({ url: apiurl })
    //this isnt working all the way yet.
    dispatch(
      setModalContent({
        componentType: 'ok',
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
        visible: true,
      }),
    )
  }
  const handleDropdownEvent = (apiurl, message) => {
    dispatch(
      setModalContent({
        componentType: 'confirm',
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => handleDropdownConfirm(apiurl),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        visible: true,
      }),
    )
  }
  return (
    <CDropdown>
      <CDropdownToggle size="sm" variant="ghost" color="primary">
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
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Available endpoint manager templates</CCardTitle>
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
