import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CButton } from '@coreui/react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippOffcanvas } from '../../../components/cipp'
import { CippPageList } from 'src/components'
import { CippCodeBlock } from '../../../components/cipp'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [visible, setVisible] = useState(false)

  const jsonContent = JSON.stringify(row, null, 2)

  return (
    <>
      <CButton size="sm" variant="ghost" color="success" onClick={() => setVisible(true)}>
        <FontAwesomeIcon icon={faEye} className="me-2" />
        View JSON
      </CButton>
      <CippOffcanvas
        visible={visible}
        id={row.id}
        placement="end"
        className="cipp-offcanvas"
        title="List Profile"
        hideFunction={() => setVisible(false)}
      >
        <CippCodeBlock
          code={jsonContent}
          language="json"
          showLineNumbers={true}
          wrapLongLines={false}
        />
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
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    wrap: true,
    exportSelector: 'Description',
  },
  {
    selector: (row) => row['language'],
    name: 'Language',
    sortable: true,
    exportSelector: 'language',
  },
  {
    selector: (row) => row['extractHardwareHash'],
    name: 'Convert to Autopilot',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'extractHardwareHash',
  },
  {
    selector: (row) => row['deviceNameTemplate'],
    name: 'Device Name Template',
    sortable: true,
    exportSelector: 'deviceNameTemplate',
  },
  {
    selector: (row) => ['JSON'],
    name: '',
    cell: Offcanvas,
  },
]

const AutopilotListProfiles = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Autopilot Profiles"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-AutopilotProfile-List`,
        columns,
        path: '/api/ListAutopilotConfig?type=ApProfile',
        params: {
          TenantFilter: tenant?.defaultDomainName,
        },
      }}
    />
  )
}

export default AutopilotListProfiles
