import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listDevices } from '../../../store/modules/devices'

const { SearchBar } = Search
const pagination = paginationFactory()

const columns = [
  {
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'Enabled',
    dataField: 'accountEnabled',
    sort: true,
  },
  {
    text: 'Compliant',
    dataField: 'isCompliant',
    sort: true,
  },
  {
    text: 'Manufacturer',
    dataField: 'manufacturer',
    sort: true,
  },
  {
    text: 'Model',
    dataField: 'model',
    sort: true,
  },
  {
    text: 'Operating System',
    dataField: 'operatingSystem',
    sort: true,
  },
  {
    text: 'Operating System Version',
    dataField: 'operatingSystemVersion',
    sort: true,
  },
  {
    text: 'Created',
    dataField: 'createdDateTime',
    sort: true,
  },
  {
    text: 'Approx Last SignIn',
    dataField: 'approximateLastSignInDateTime',
    sort: true,
  },
  {
    text: 'Ownership',
    dataField: 'deviceOwnership',
    sort: true,
  },
  {
    text: 'Enrollment Type',
    dataField: 'enrollmentType',
    sort: true,
  },
  {
    text: 'Management Type',
    dataField: 'managementType',
    sort: true,
  },
  {
    text: 'On-Premises Sync Enabled',
    dataField: 'onPremisesSyncEnabled',
    sort: true,
  },
  {
    text: 'Trust Type',
    dataField: 'trustType',
    sort: true,
  },
]

const Devices = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const { list = [], loading, loaded, error } = useSelector((state) => state.devices.devices)

  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listDevices({ tenant: tenant }))
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, dispatch])

  const action = (tenant) => {
    dispatch(listDevices({ tenantDomain: tenant.defaultDomainName }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Devices</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!loaded && loading && <CSpinner />}
        {loaded && !loading && !error && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={columns} data={list} search>
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

export default Devices
