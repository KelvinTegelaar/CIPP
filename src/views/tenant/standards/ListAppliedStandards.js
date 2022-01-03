import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCard,
  CCardBody,
  CCardTitle,
  CCardHeader,
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
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/RemoveStandard?ID=${row.displayName}`,
              `Are you sure you want to delete the standard for ${row.displayName}`,
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
    name: 'Tenant Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Standard',
    selector: (row) => row['standardName'],
    sortable: true,
  },
  {
    name: 'Applied By',
    selector: (row) => row['appliedBy'],
    sortable: true,
  },
  {
    name: 'Action',
    cell: Dropdown,
  },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Applied Standards</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-AppliedStandards-List`}
            path="/api/ListStandards"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TenantsList
