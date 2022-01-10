import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CButton } from '@coreui/react'
import { faCopy, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippActionsOffcanvas } from 'src/components/cipp'

// const Offcanvas = (row, rowIndex, formatExtraData) => {
//  const [ocVisible, setOCVisible] = useState(false)
//
//  return (
//    <>
//      <CButton size="sm" variant="ghost" color="success" onClick={() => setOCVisible(true)}>
//        <FontAwesomeIcon icon={faEye} />
//      </CButton>
//      <CippOffcanvas
//        title="JSON (Raw)"
//        placement="end"
//        visible={ocVisible}
//        id={row.id}
//        hideFunction={() => setOCVisible(false)}
//      >
//        <p>
//          {' '}
//          <pre>{JSON.stringify(row, null, 2)}</pre>
//        </p>
//      </CippOffcanvas>
//    </>
//  )
// }

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)

  return (
    <>
      <CButton size="sm" variant="ghost" color="success" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEye} />
      </CButton>
      <CippActionsOffcanvas
        title="JSON (Raw)"
        extendedInfo={[{ label: '', value: <pre>{JSON.stringify(row, null, 2)}</pre> }]}
        actions={[
          {
            icon: <FontAwesomeIcon icon={faCopy} className="me-2" />,
            label: 'Copy JSON',
            color: 'info',
            onClick: {},
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

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
    wrap: true,
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    wrap: true,
  },
  {
    selector: (row) => row['language'],
    name: 'Language',
    sortable: true,
  },
  {
    selector: (row) => row['extractHardwareHash'],
    name: 'Convert to Autopilot',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['deviceNameTemplate'],
    name: 'Device Name Template',
    sortable: true,
  },
  {
    selector: (row) => ['JSON'],
    name: 'JSON',
    cell: Offcanvas,
  },
]

const AutopilotListProfiles = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Autopilot Profiles</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-AutopilotProfile-List`}
            path="/api/ListAutopilotConfig?type=ApProfile"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListProfiles
