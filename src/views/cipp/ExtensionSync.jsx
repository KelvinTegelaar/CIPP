import React, { useState } from 'react'
import { CCol, CRow } from '@coreui/react'
import { useSelector } from 'react-redux'

import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

import { CippPage, CippPageList } from 'src/components/layout'
import { CellTip, cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import 'react-datepicker/dist/react-datepicker.css'
import { CellBadge, cellBadgeFormatter, cellDateFormatter } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const ExtensionSync = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row?.Tenant,
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Tenants',
    },
    {
      name: 'Sync Type',
      selector: (row) => row?.SyncType,
      sortable: true,
      cell: cellBadgeFormatter({ color: 'info' }),
      exportSelector: 'SyncType',
    },
    {
      name: 'Task',
      selector: (row) => row?.Name,
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Name',
    },
    {
      name: 'Scheduled Time',
      selector: (row) => row?.ScheduledTime,
      sortable: true,
      cell: cellDateFormatter({ format: 'short' }),
      exportSelector: 'ScheduledTime',
    },
    {
      name: 'Last Run',
      selector: (row) => row?.ExecutedTime,
      sortable: true,
      cell: cellDateFormatter({ format: 'short' }),
      exportSelector: 'ExecutedTime',
    },
    {
      name: 'Repeats every',
      selector: (row) => row?.RepeatsEvery,
      sortable: true,
      cell: (row) => CellTip(row['RepeatsEvery']),
      exportSelector: 'RepeatsEvery',
    },
    {
      name: 'Results',
      selector: (row) => row?.Results,
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Results',
    },
  ]

  return (
    <CippPage title={`Extension Sync`} tenantSelector={false}>
      <>
        <CRow>
          <CCol>
            <CippPageList
              key={refreshState}
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
              title="Extension Sync"
              tenantSelector={false}
              datatable={{
                columns,
                reportName: `Extension Sync Report`,
                path: `/api/ListExtensionSync`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ExtensionSync
