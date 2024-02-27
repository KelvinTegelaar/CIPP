import React, { useState } from 'react'
import { CippPage } from 'src/components/layout'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { CippTable } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'
import { useSelector } from 'react-redux'
import { useGenericGetRequestQuery } from 'src/store/api/app'
import { RFFCFormSelect } from 'src/components/forms'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['Name'],
    sortable: true,
    cell: cellGenericFormatter(),
    exportSelector: 'Name',
    minWidth: '145px',
    maxWidth: '145px',
  },
  {
    name: 'Executions',
    selector: (row) => row['ExecutionCount'],
    sortable: true,
    exportSelector: 'ExecutionCount',
  },
  {
    name: 'Total (seconds)',
    selector: (row) => row['TotalSeconds'],
    sortable: true,
    exportSelector: 'TotalSeconds',
  },
  {
    name: 'Max (seconds)',
    selector: (row) => row['MaxSeconds'],
    sortable: true,
    exportSelector: 'MaxSeconds',
  },
  {
    name: 'Avg (seconds)',
    selector: (row) => row['AvgSeconds'],
    sortable: true,
    exportSelector: 'AvgSeconds',
    cell: (row) => Math.round(row['AvgSeconds'] * 100) / 100,
  },
]

const Statistics = () => {
  const [visibleA, setVisibleA] = useState(false)
  const [type, setType] = useState('Functions')
  const [interval, setInterval] = useState('Days')
  const [time, setTime] = useState(1)
  const tenant = useSelector((state) => state.app.currentTenant)
  const { data, isFetching, error, isSuccess } = useGenericGetRequestQuery({
    path: '/api/ListFunctionStats',
    params: {
      FunctionType: 'Queue',
      Interval: interval,
      Time: time,
      TenantFilter: tenant?.defaultDomainName,
    },
  })

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Options
                <CButton
                  size="sm"
                  variant="ghost"
                  className="stretched-link"
                  onClick={() => setVisibleA(!visibleA)}
                >
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
          </CCard>
          <CCollapse visible={visibleA}>
            <CCard className="options-card">
              <CCardHeader></CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol>
                    <CFormLabel>Report</CFormLabel>
                    <CFormSelect name="Report" onChange={(e) => setType(e.target.value)}>
                      <option value="Functions">Functions</option>
                      <option value="Standards">Standards</option>
                    </CFormSelect>
                  </CCol>
                  <CCol>
                    <div>
                      <CFormLabel>Interval</CFormLabel>
                      <CFormSelect name="Interval" onChange={(e) => setInterval(e.target.value)}>
                        <option value="Minute">Minutes</option>
                        <option value="Hours">Hours</option>
                        <option value="Days" selected>
                          Days
                        </option>
                      </CFormSelect>
                    </div>
                    <div className="mt-2">
                      <CFormLabel>Time</CFormLabel>
                      <CFormInput
                        name="Time"
                        onChange={(e) => setTime(e.target.value)}
                        defaultValue={1}
                      />
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCollapse>
        </CCol>
      </CRow>
      <hr />
      <CippPage title="Function Statistics" tenantSelector={false}>
        <CCard className="content-card">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle>Statistics</CCardTitle>
          </CCardHeader>
          <CCardBody>
            {isFetching && <CSpinner />}
            {isSuccess && (
              <CippTable reportName={`CIPP-Stats`} data={data?.Results[type]} columns={columns} />
            )}
          </CCardBody>
        </CCard>
      </CippPage>
    </>
  )
}

export default Statistics
