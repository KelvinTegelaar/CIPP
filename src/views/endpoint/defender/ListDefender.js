import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
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
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter } from '../../../components/cipp'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
        <CDropdownItem href="#">View Device</CDropdownItem>
        <CDropdownItem href="#">Execute Quick Scan</CDropdownItem>
        <CDropdownItem href="#">Execute Full Scan</CDropdownItem>
        <CDropdownItem href="#">Remote Wipe</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    selector: (row) => row['managedDeviceName'],
    name: 'Device Name',
    sortable: true,
  },
  {
    selector: (row) => row['malwareProtectionEnabled'],
    name: 'Malware Protection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['realTimeProtectionEnabled'],
    name: 'Real Time Protection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['networkInspectionSystemEnabled'],
    name: 'Network Inspection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['managedDeviceHealthState'],
    name: 'Last reported Health State',
    sortable: true,
  },
  {
    selector: (row) => row['quickScanOverdue'],
    name: 'Quick Scan overdue',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['fullScanOverdue'],
    name: 'Full Scan overdue',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['signatureUpdateOverdue'],
    name: 'Signature Update Required',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['rebootRequired'],
    name: 'Reboot Required',
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    selector: (row) => row['attentionRequired'],
    name: 'Attention Required',
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const DefenderState = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Defender Status</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-DefenderState-List`}
            path="/api/ListDefenderState"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default DefenderState
