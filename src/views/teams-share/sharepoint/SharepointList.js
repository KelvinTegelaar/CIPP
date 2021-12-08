import React, { useEffect } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CSpinner } from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { listSharepointSitesUsage } from '../../../store/modules/sharepoint'

const { SearchBar } = Search

const pagination = paginationFactory()

const dropdown = (cell, row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle color="primary">...</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">
          <Link className="dropdown-item" to="/identity/administration/EditGroup">
            <CIcon icon={cilSettings} className="me-2" />
            Edit Site Members
          </Link>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    text: 'Display Name',
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
    text: 'File Count',
    dataField: 'FileCount',
    sort: true,
  },
  {
    text: 'Used (GB)',
    dataField: 'UsedGB',
    sort: true,
  },
  {
    text: 'Allocated',
    dataField: 'Allocated',
  },
  {
    text: 'URL',
    dataField: 'URL',
    sort: true,
  },
  {
    text: 'Action',
    formatter: dropdown,
  },
]

const SharepointList = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const sharepoint = useSelector((state) => state.sharepoint.usage)

  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listSharepointSitesUsage({ tenantDomain: tenant.defaultDomainName }))
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const action = (tenant) => {
    dispatch(listSharepointSitesUsage({ tenantDomain: tenant.defaultDomainName }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Sharepoint Site List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!sharepoint.loaded && sharepoint.loading && <CSpinner />}
        {sharepoint.loaded && !sharepoint.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="url" columns={columns} data={sharepoint.list} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
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
      </div>
    </div>
  )
}

export default SharepointList
