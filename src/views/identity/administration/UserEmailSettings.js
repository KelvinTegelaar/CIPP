import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilEnvelopeClosed } from '@coreui/icons'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import { CellBoolean } from '../../../components/cipp'
import { useListMailboxDetailsQuery } from '../../../store/api/mailbox'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    text: 'User Not Restricted',
    dataField: 'BlockedForSpam',
    formatter: (cell) => CellBoolean({ cell: !cell }),
  },
  {
    text: 'Litigation Hold',
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

export default function UserEmailSettings({ userId, tenantDomain }) {
  const { data: details, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Settings</CCardTitle>
        <div>
          <CIcon icon={cilEnvelopeClosed} className="me-2" />
          <CIcon icon={cilSettings} />
        </div>
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <span>Error loading email settings</span>}
        {!isFetching && !error && (
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
      </CCardBody>
    </CCard>
  )
}

UserEmailSettings.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
