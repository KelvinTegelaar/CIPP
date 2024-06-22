import React, { useState } from 'react'
import { CCol, CRow } from '@coreui/react'
import { useSelector } from 'react-redux'

import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import { CippPage, CippPageList } from 'src/components/layout'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import 'react-datepicker/dist/react-datepicker.css'
import { CellBadge, cellBadgeFormatter } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const ListClassicAlerts = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const columns = [
    {
      name: 'Tenant(s)',
      selector: (row) => row['Tenants'],
      sortable: true,
      cell: (row) => CellTip(row['Tenants']),
      exportSelector: 'Tenants',
    },
    {
      name: 'Events',
      selector: (row) => row['Conditions'],
      sortable: true,
      cell: (row) => CellTip(row['Conditions']),
      exportSelector: 'Conditions',
    },
    {
      name: 'Actions to take',
      selector: (row) => row['Actions'],
      sortable: true,
      cell: cellBadgeFormatter({ color: 'info' }),
      exportSelector: 'Actions',
    },
    {
      name: 'Repeats every',
      selector: (row) => row['RepeatsEvery'],
      sortable: true,
      cell: (row) => CellTip(row['RepeatsEvery']),
      exportSelector: 'RepeatsEvery',
    },
    {
      name: 'Event Type',
      selector: (row) => row['EventType'],
      sortable: true,
      cell: cellBadgeFormatter({ color: 'info' }),
      exportSelector: 'EventType',
    },
  ]

  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol>
            <CippPageList
              key={refreshState}
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
              title="Alerts List"
              titleButton={
                <TitleButton
                  key="add-user"
                  href="/tenant/administration/alertswizard"
                  title="Add Alert"
                />
              }
              tenantSelector={false}
              datatable={{
                tableProps: {
                  selectableRows: true,
                  actionsList: [
                    {
                      label: 'Delete Alert',
                      modal: true,
                      modalUrl: `/api/RemoveQueuedAlert?&ID=!RowKey&EventType=!EventType&RefreshGuid=${refreshState}`,
                      modalMessage: 'Do you want to delete this job?',
                    },
                  ],
                },
                columns,
                reportName: `Alerts`,
                path: `/api/ListAlertsQueue?RefreshGuid=${refreshState}`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListClassicAlerts
