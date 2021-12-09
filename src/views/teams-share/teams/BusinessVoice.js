import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listTeamsVoice } from '../../../store/modules/businessVoice'
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

const BusinessVoice = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const voice = useSelector((state) => state.businessVoice.voice)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listTeamsVoice({ tenant: tenant }))
      }
    }

    load()
  }, [])

  const action = (tenant) => {
    dispatch(listTeamsVoice({ tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Teams Business Voice List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!voice.loaded && voice.loading && <CSpinner />}
        {voice.loaded && !voice.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={columns} data={voice.list} search>
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
                  pdfdata={voice.list}
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
        {!voice.loaded && !voice.loading && voice.error && (
          <span>Failed to load Business Voice List</span>
        )}
      </div>
    </div>
  )
}

export default BusinessVoice
