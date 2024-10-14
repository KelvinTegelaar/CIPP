import { CButton } from '@coreui/react'
import {
  faBan,
  faBook,
  faBookReader,
  faCheck,
  faEllipsisV,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellBooleanFormatter, cellDateFormatter, CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

function DateNotNull(date) {
  if (date === null || date === undefined || date === '' || date === 'undefined') {
    return ' '
  }
  return date.toString().trim() + 'Z'
}

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Rule Info"
        extendedInfo={[{ label: 'Name', value: `${row.displayName}` }]}
        actions={
          row['@odata.type'] === '#microsoft.graph.countryNamedLocation'
            ? [
                {
                  label: 'Add location to named location',
                  color: 'info',
                  modal: true,
                  modalType: 'POST',
                  modalBody: {
                    namedLocationId: row.id,
                    TenantFilter: tenant.defaultDomainName,
                    change: 'addLocation',
                  },
                  modalUrl: '/api/ExecNamedLocation',
                  modalInput: true,
                  modalMessage: 'Enter an the two letter country code, e.g. US.',
                },
                {
                  label: 'Remove location from named location',
                  color: 'info',
                  modal: true,
                  modalType: 'POST',
                  modalBody: {
                    namedLocationId: row.id,
                    TenantFilter: tenant.defaultDomainName,
                    change: 'removeLocation',
                  },
                  modalUrl: '/api/ExecNamedLocation',
                  modalInput: true,
                  modalMessage: 'Enter an the two letter country code, e.g. US.',
                },
              ]
            : [
                {
                  label: 'Add IP to named location',
                  color: 'info',
                  modal: true,
                  modalType: 'POST',
                  modalBody: {
                    namedLocationId: row.id,
                    TenantFilter: tenant.defaultDomainName,
                    change: 'addIp',
                  },
                  modalUrl: '/api/ExecNamedLocation',
                  modalInput: true,
                  modalMessage: 'Enter an IP in CIDR format, e.g. 1.1.1.1/32.',
                },
                {
                  label: 'Remove IP from named location',
                  color: 'info',
                  modal: true,
                  modalType: 'POST',
                  modalBody: {
                    namedLocationId: row.id,
                    TenantFilter: tenant.defaultDomainName,
                    change: 'removeIp',
                  },
                  modalUrl: '/api/ExecNamedLocation',
                  modalInput: true,
                  modalMessage: 'Enter an IP in CIDR format, e.g. 1.1.1.1/32.',
                },
              ]
        }
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
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    maxWidth: '150px',
  },
  {
    name: 'Include Unknown Countries',
    selector: (row) => row['includeUnknownCountriesAndRegions'],
    sortable: true,
    exportSelector: 'includeUnknownCountriesAndRegions',
    cell: cellBooleanFormatter(),
    maxWidth: '150px',
  },
  {
    name: 'Type',
    selector: (row) =>
      row['@odata.type'] === '#microsoft.graph.countryNamedLocation' ? 'Country' : 'IP',
    sortable: true,
    exportSelector: 'clientAppTypes',
    maxWidth: '150px',
  },
  {
    name: 'Locations or IPs',
    selector: (row) => row.rangeOrLocation,
    sortable: true,
    exportSelector: 'rangeOrLocation',
  },
  {
    name: 'Last Modified (Local)',
    selector: (row) => DateNotNull(row['modifiedDateTime']),
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'modifiedDateTime',
    maxWidth: '150px',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
    maxWidth: '80px',
  },
]

const NamedLocationsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Named Locations"
      titleButton={
        <>
          <TitleButton
            href={`/tenant/conditional/deploy-named-location?customerId=${tenant?.customerId}&tableFilter=${tenant?.defaultDomainName}`}
            title="Deploy Named Location"
          />
        </>
      }
      tenantSelector={false}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-ConditionalAccess-List`,
        path: '/api/ListNamedLocations',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default NamedLocationsList
