import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilEnvelopeClosed } from '@coreui/icons'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import CellBoolean from '../../../components/cipp/CellBoolean'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    text: 'User Not Restricted',
    dataField: 'BlockedForSpam',
    formatter: (cell) => CellBoolean({ cell: !cell }),
  },
  {
    text: 'Litation Hold',
    dataField: 'LitiationHold',
    formatter,
  },
  {
    text: 'Hidden from Address Lists',
    dataField: 'HiddenFromAddressLists',
    formatter,
  },
  {
    text: 'EWS Enabled',
    dataField: 'EWSEnabled',
    formatter,
  },
  {
    text: 'MAPI Enabled',
    dataField: 'MailboxMAPIEnabled',
    formatter,
  },
  {
    text: 'OWA Enabled',
    dataField: 'MailboxOWAEnabled',
    formatter,
  },
  {
    text: 'IMAP Enabled',
    dataField: 'MailboxImapEnabled',
    formatter,
  },
  {
    text: 'POP Enabled',
    dataField: 'MailboxPopEnabled',
    formatter,
  },
  {
    text: 'Active Sync Enabled',
    dataField: 'MailboxActiveSyncEnabled',
    formatter,
  },
  {
    text: 'Forward and Deliver',
    dataField: 'ForwardAndDeliver',
    formatter,
  },
  {
    text: 'Forwarding Address',
    dataField: 'ForwardingAddress',
    formatter,
  },
]

export default function UserEmailSettings({
  mailbox: { details = {}, loading = false, loaded = false, error },
}) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        Email Settings
        <div>
          <CIcon icon={cilEnvelopeClosed} className="me-2" />
          <CIcon icon={cilSettings} />
        </div>
      </CCardHeader>
      <CCardBody>
        {loading && !loaded && <CSpinner />}
        {loaded && !error && (
          <CTable>
            <CTableBody>
              {columns.map((column, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{column.text}</CTableDataCell>
                    {!column.formatter && (
                      <CTableDataCell>{details[column.dataField] ?? 'n/a'}</CTableDataCell>
                    )}
                    {column.formatter && (
                      <CTableDataCell>
                        {column.formatter(details[column.dataField], details)}
                      </CTableDataCell>
                    )}
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        )}
        {!loaded && !loading && error && <>Error loading email details</>}
      </CCardBody>
    </CCard>
  )
}

UserEmailSettings.propTypes = {
  mailbox: PropTypes.object,
}
