import React, { useEffect } from 'react'
import { CSpinner } from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'
import { listTeamsActivity } from '../../../store/modules/teams'
import { CButton } from '@coreui/react'

const { SearchBar } = Search
const pagination = paginationFactory()
const { ExportCSVButton } = CSVExport

const columns = [
  {
    text: 'UPN',
    dataField: 'UPN',
    sort: true,
  },
  {
    text: 'Last Active',
    dataField: 'LastActive',
    sort: true,
  },
  {
    text: 'Teams Chat Message Count',
    dataField: 'TeamsChat',
    sort: true,
  },
  {
    text: 'Call Count',
    dataField: 'CallCount',
    sort: true,
  },
  {
    text: 'Meeting Count',
    dataField: 'MeetingCount',
    sort: true,
  },
]

const ListTeamActivity = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const teamsActivity = useSelector((state) => state.teams.activity)

  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listTeamsActivity({ tenantDomain: tenant.defaultDomainName }))
      }
    }

    load()
    // eslist-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const action = (tenant) => {
    dispatch(listTeamsActivity({ tenantDomain: tenant.defaultDomainName }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Teams Activity</h3>
        {Object.keys(tenant).length === 0 && <span> Select a tenant to get started.</span>}
        {!teamsActivity.loaded && teamsActivity.loading && <CSpinner />}
        {teamsActivity.loaded && !teamsActivity.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider
            keyField="UPN"
            columns={columns}
            data={teamsActivity.list}
            search
            exportCSV={{ filename: `${tenant.displayName} Teams Acitivty List` }}
          >
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                {/* eslint-disable-next-line react/prop-types */}
                <ExportCSVButton {...props.csvProps}>
                  <CButton>CSV</CButton>
                </ExportCSVButton>
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination = {pagination}
                  wrapperClasses = "table-responsive"
                  />
                  {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        )}
      </div>
    </div>
  )
}

export default ListTeamActivity
