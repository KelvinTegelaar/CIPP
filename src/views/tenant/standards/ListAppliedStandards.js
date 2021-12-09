import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listAppliedStandards } from '../../../store/modules/standards'
import ExportPDFButton from '../../../components/cipp/PdfButton'
import { CButton } from '@coreui/react'
import CellBoolean from '../../../components/cipp/CellBoolean'

const { ExportCSVButton } = CSVExport
const { SearchBar } = Search
const pagination = paginationFactory()
const Formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    text: 'Assigned to User',
    dataField: 'AssignedTo',
    sort: true,
  },
  {
    text: 'Phone Number',
    dataField: 'TelephoneNumber',
    sort: true,
  },
  {
    text: 'Number Type',
    dataField: 'NumberType',
    sort: false,
  },
  {
    text: 'Country',
    dataField: 'IsoCountryCode',
    sort: false,
  },
  {
    text: 'Location',
    dataField: 'PlaceName',
    sort: false,
  },
  {
    text: 'Activation State',
    dataField: 'ActivationState',
    formatter: Formatter,
  },
  {
    text: 'Operator Connect',
    dataField: 'IsOperatorConnect',
    formatter: Formatter,
  },
  {
    text: 'Purchased on',
    dataField: 'AcquisitionDate',
    sort: false,
  },
]

const StandardsList = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const standardsList = useSelector((state) => state.standards.list)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listAppliedStandards())
      }
    }

    load()
  }, [])

  return (
    <div>
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Standards List</h3>
        {!standardsList.loaded && standardsList.loading && <CSpinner />}
        {standardsList.loaded && !standardsList.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider
            keyField="displayName"
            columns={columns}
            data={standardsList.list}
            search
          >
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/* eslint-disable-next-line react/prop-types */}
                <ExportCSVButton {...props.csvProps}>
                  <CButton>CSV</CButton>
                </ExportCSVButton>
                <ExportPDFButton
                  pdfdata={standardsList.list}
                  pdfheaders={columns}
                  pdfsize="A4"
                  reportname="MFA Report"
                ></ExportPDFButton>
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
        {!standardsList.loaded && !standardsList.loading && standardsList.error && (
          <span>Failed to load Standards</span>
        )}
      </div>
    </div>
  )
}

export default StandardsList
