import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { CellBoolean, cellBooleanFormatter, CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  //console.log(row)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="User Information"
        extendedInfo={[
          { label: 'Created by', value: `${row.CreatedBy}` },
          { label: 'Last edit by', value: `${row.LastModifiedBy}` },
          { label: 'Description', value: `${row.Description}` },
        ]}
        actions={[
          {
            label: 'Create template based on rule',
            color: 'info',
            modal: true,
            icon: <FontAwesomeIcon icon={faBook} className="me-2" />,
            modalBody: row,
            modalType: 'POST',
            modalUrl: `/api/AddExConnectorTemplate`,
            modalMessage: 'Are you sure you want to create a template based on this rule?',
          },
          {
            label: 'Enable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditExConnector?State=Enable&TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}&Type=${row.cippconnectortype}`,
            modalMessage: 'Are you sure you want to enable this rule?',
          },
          {
            label: 'Disable Rule',
            color: 'info',
            icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
            modal: true,
            modalUrl: `/api/EditExConnector?State=Disable&TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}&Type=${row.cippconnectortype}`,
            modalMessage: 'Are you sure you want to disable this rule?',
          },
          {
            label: 'Delete Rule',
            color: 'danger',
            modal: true,
            icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
            modalUrl: `/api/RemoveExConnector?TenantFilter=${tenant.defaultDomainName}&GUID=${row.Guid}&Type=${row.cippconnectortype}`,
            modalMessage: 'Are you sure you want to disable this rule?',
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
    name: 'Name',
    selector: (row) => row['Name'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['Name']),
    exportSelector: 'Name',
  },
  {
    name: 'State',
    selector: (row) => row['Enabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'Enabled',
  },
  {
    name: 'Comment',
    selector: (row) => row['Comment'],
    sortable: true,
    exportSelector: 'Comment',
  },
  {
    name: 'Direction',
    selector: (row) => row['cippconnectortype'],
    sortable: true,
    exportSelector: 'cippconnectortype',
  },
  {
    name: 'Inbound Connector Hostname',
    selector: (row) => row['TlsSenderCertificateName'],
    exportSelector: 'TlsSenderCertificateName',
  },
  {
    name: 'Sender IP Addresses',
    selector: (row) => row.SenderIPAddresses?.join(','),
    exportSelector: 'SenderIPAddresses',
  },
  {
    name: 'Only apply via transport rules',
    selector: (row) => row.IsTransportRuleScoped,
    exportSelector: 'IsTransportRuleScoped',
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Smarthost',
    selector: (row) => row.SmartHosts?.join(','),
    exportSelector: 'Smarthost',
  },
  {
    name: 'TLS Settings',
    selector: (row) => row.TlsSettings,
    exportSelector: 'TlsSettings',
  },
  {
    name: 'TLS Domain',
    selector: (row) => row.TlsDomain,
    exportSelector: 'Smarthost',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
    maxWidth: '80px',
  },
]

const ConnectorList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Connector List"
      titleButton={
        <>
          <TitleButton href="/email/transport/add-connector" title="Deploy Connector" />
        </>
      }
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-connectors-list`,
        path: '/api/ListExchangeConnectors',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default ConnectorList
