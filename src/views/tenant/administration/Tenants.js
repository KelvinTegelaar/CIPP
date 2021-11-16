import React, { useEffect } from 'react'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'
import { listTenants } from '../../../store/modules/tenants'
import BootstrapTable from 'react-bootstrap-table-next'
import { CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCog } from '@coreui/icons'

const { SearchBar } = Search
const pagination = paginationFactory()

// eslint-disable-next-line react/display-name
const linkCog = (url) => (cell) =>
  (
    <a href={url(cell)} target="_blank" rel="noreferrer">
      <CIcon icon={cilCog} />
    </a>
  )

const columns = [
  {
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'Default Domain',
    dataField: 'defaultDomainName',
  },
  {
    text: 'M365 Portal',
    dataField: 'customerId',
    formatter: linkCog(
      (cell) =>
        `https://portal.office.com/Partner/BeginClientSession.aspx?CTID=${cell}&CSDEST=o365admincenter`,
    ),
  },
  {
    text: 'Exchange Portal',
    dataField: 'defaultDomainName',
    formatter: linkCog(
      (cell) => `https://outlook.office365.com/ecp/?rfr=Admin_o365&exsvurl=1&delegatedOrg=${cell}`,
    ),
  },
  {
    text: 'AAD Portal',
    dataField: 'defaultDomainName',
    formatter: linkCog((cell) => `https://aad.portal.azure.com/${cell}`),
  },
  {
    text: 'Teams Portal',
    dataField: 'defaultDomainName',
    formatter: linkCog((cell) => `https://admin.teams.microsoft.com/?delegatedOrg=${cell}`),
  },
  {
    text: 'Azure Portal',
    dataField: 'defaultDomainName',
    formatter: linkCog((cell) => `https://portal.azure.com/${cell}`),
  },
  {
    text: 'MEM (Intune) Portal',
    dataField: 'defaultDomainName',
    formatter: linkCog((cell) => `https://endpoint.microsoft.com/${cell}`),
  },
  // @todo not used at the moment?
  // {
  //   text: 'Domains',
  //   dataField: 'defaultDomainName',
  // },
]

const Tenants = () => {
  const dispatch = useDispatch()
  const { tenants, loading, loaded } = useSelector((state) => state.tenants)

  useEffect(() => {
    dispatch(listTenants())
  }, [])

  return (
    <div>
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Tenants</h3>
        {!loaded && loading && <CSpinner />}
        {loaded && !loading && (
          <ToolkitProvider keyField="displayName" columns={columns} data={tenants} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/*eslint-disable */}
              <BootstrapTable
                {...props.baseProps}
                pagination={pagination}
                striped
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

export default Tenants
