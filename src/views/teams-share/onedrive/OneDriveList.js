import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listOneDrives } from '../../../store/modules/oneDrive.js'
import { CButton } from '@coreui/react'

const { SearchBar } = Search
const pagination = paginationFactory()
const { ExportCSVButton } = CSVExport

const columns = [
  {
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
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
    text: 'File Count (Total)',
    dataField: 'FileCount',
    sort: true,
  },
  {
    text: 'Used (GB)',
    dataField: 'UsedGB',
    sort: true,
  },
  {
    text: 'Allocated (GB)',
    dataField: 'Allocated',
    sort: true,
  },
]

const OneDrives = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const oneDrives = useSelector((state) => state.oneDrive.oneDrive)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listOneDrives({ tenant: tenant }))
      }
    }

    load()
  }, [])

  const action = (tenant) => {
    dispatch(listOneDrives({ tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>OneDrive List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!oneDrives.loaded && oneDrives.loading && <CSpinner />}
        {oneDrives.loaded && !oneDrives.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider
            keyField="displayName"
            columns={columns}
            data={oneDrives.list}
            search
            exportCSV={{
              filename: `${tenant.displayName} OneDrive Report List`,
            }}
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
                  pagination={pagination}
                  wrapperClasses="table-responsive"
                />
                {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        )}
        {!oneDrives.loaded && !oneDrives.loading && oneDrives.error && (
          <span>Failed to load OneDrive List</span>
        )}
      </div>
    </div>
  )
}

export default OneDrives
