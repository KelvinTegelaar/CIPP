import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useSelector } from 'react-redux'
import { CellBoolean } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BusinessVoice = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const tenant = useSelector((state) => state.app.currentTenant)
    const [ocVisible, setOCVisible] = useState(false)
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Extended Information"
          extendedInfo={[
            {
              label: 'Phone Number',
              value: `${row.TelephoneNumber ?? ' '}`,
            },
            {
              label: 'Licensed Usage',
              value: `${usageFormatter(row.AcquiredCapabilities) ?? ' '}`,
            },
            {
              label: 'Assignment Status',
              value: `${row.AssignmentStatus ?? ' '}`,
            },
            {
              label: 'Assigned to User',
              value: `${row.AssignedTo ?? ' '}`,
            },
          ]}
          actions={[
            {
              label: 'Assign User',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                PhoneNumber: row.TelephoneNumber,
                TenantFilter: tenant.defaultDomainName,
                PhoneNumberType: row.NumberType,
                locationOnly: false,
              },
              modalUrl: `/api/ExecTeamsVoicePhoneNumberAssignment`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'userPrincipalName',
              },
              modalMessage: 'Select the User to assign.',
            },
            {
              label: 'Unassign User',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                PhoneNumber: row.TelephoneNumber,
                TenantFilter: tenant.defaultDomainName,
                AssignedTo: row.AssignedTo,
                PhoneNumberType: row.NumberType,
              },
              modalUrl: `/api/ExecRemoveTeamsVoicePhoneNumberAssignment`,
              modalMessage: 'Are you sure you want to remove the assignment?',
            },
            {
              label: 'Set Emergency Location',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                PhoneNumber: row.TelephoneNumber,
                TenantFilter: tenant.defaultDomainName,
                locationOnly: true,
              },
              modalUrl: `/api/ExecTeamsVoicePhoneNumberAssignment`,
              modalDropdown: {
                url: `/api/ListTeamsLisLocation?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'Description',
                valueField: 'LocationId',
              },
              modalMessage: 'Select the Emergency Location.',
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
  const Formatter = (cell) => CellBoolean({ cell })
  const usageFormatter = (cell) => {
    if (cell.includes('UserAssignment')) {
      return 'User'
    }
    if (cell.includes('FirstPartyAppAssignment')) {
      return 'Voice App'
    }
    if (cell.includes('ConferenceAssignment')) {
      return 'Conference'
    }
    return cell[0]
  }
  const columns = [
    {
      name: 'Assigned to User',
      selector: (row) => row['AssignedTo'],
      sortable: true,
      exportSelector: 'AssignedTo',
    },
    {
      name: 'Phone Number',
      selector: (row) => row['TelephoneNumber'],
      sortable: true,
      exportSelector: 'TelephoneNumber',
    },
    {
      name: 'Assignment Status',
      selector: (row) => row['AssignmentStatus'],
      sortable: true,
      exportSelector: 'AssignmentStatus',
    },
    {
      name: 'Number Type',
      selector: (row) => row['NumberType'],
      sortable: true,
      exportSelector: 'NumberType',
    },
    {
      name: 'Licensed Usage',
      selector: (row) => usageFormatter(row['AcquiredCapabilities']),
      sortable: true,
      exportSelector: 'AcquiredCapabilities',
    },
    {
      name: 'Country',
      selector: (row) => row['IsoCountryCode'],
      sortable: true,
      exportSelector: 'IsCountryCode',
    },
    {
      name: 'Location',
      selector: (row) => row['PlaceName'],
      sortable: true,
      exportSelector: 'PlaceName',
    },
    {
      name: 'Activation State',
      selector: (row) => row['ActivationState'],
      formatter: Formatter,
      exportSelector: 'ActivationState',
      sortable: true,
    },
    {
      name: 'Operator Connect',
      selector: (row) => row['IsOperatorConnect'],
      formatter: Formatter,
      sortable: true,
      exportSelector: 'IsOperatorConnect',
    },
    {
      name: 'Purchased on',
      selector: (row) => row['AcquisitionDate'],
      sortable: true,
      exportSelector: 'AcquisitionDate',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]
  const titleButtons = (
    <div style={{ display: 'flex', alignItems: 'right' }}>
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          key="block-caller"
          href="/teams-share/teams/business-voice-block-caller"
          title="Block Caller"
        />
      </div>
    </div>
  )
  return (
    <CippPageList
      title="Teams Business Voice"
      //titleButton={titleButtons}
      datatable={{
        filterlist: [
          {
            filterName: 'Unassigned User Numbers',
            filter:
              'Complex: AssignmentStatus eq Unassigned; AcquiredCapabilities like UserAssignment',
          },
        ],
        columns,
        path: '/api/ListTeamsVoice',
        reportName: `${tenant?.defaultDomainName}-BusinessVoice`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default BusinessVoice
