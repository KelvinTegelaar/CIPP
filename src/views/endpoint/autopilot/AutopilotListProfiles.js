import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CButton } from '@coreui/react'
import { faCopy, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippOffcanvas } from '../../../components/cipp'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [visible, setVisible] = useState(false)

  const jsonContent = <pre>{JSON.stringify(row, null, 2)}</pre>

  function CopyToClipboard() {
    const copyText = jsonContent.props.children
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copyText).then(
        () => {
          console.log('Copied Successfully')
          console.log({ copyText })
        },
        (error) => {
          console.log(error)
        },
      )
    } else {
      console.log(document.execCommand('copy'))
      document.execCommand('copy')
    }
  }

  return (
    <>
      <CButton size="sm" variant="ghost" color="success" onClick={() => setVisible(true)}>
        <FontAwesomeIcon icon={faEye} />
      </CButton>
      <CippOffcanvas
        visible={visible}
        id={row.id}
        placement="end"
        className="cipp-offcanvas"
        hideFunction={() => setVisible(false)}
        title="JSON (Raw)"
      >
        {jsonContent}
        <CButton size="sm" variant="ghost" color="info" onClick={CopyToClipboard}>
          <FontAwesomeIcon icon={faCopy} />
        </CButton>
      </CippOffcanvas>
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
