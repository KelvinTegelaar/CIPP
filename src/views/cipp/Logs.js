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
  CForm,
  CRow,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { CippDatatable, cellDateFormatter, CellTip } from 'src/components/tables'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
const reverseSort = (rowA, rowB) => {
  const a = rowA.DateTime.toLowerCase()
  const b = rowB.DateTime.toLowerCase()

  if (a > b) {
    return -1
  }

  if (b > a) {
    return 1
  }

  return 0
}

const columns = [
  {
    name: 'Date (UTC)',
    selector: (row) => row['DateTime'],
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'DateTime',
    minWidth: '145px',
    maxWidth: '145px',
    sortFunction: reverseSort,
  },
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    cell: (row) => CellTip(row['Tenant']),
    exportSelector: 'Tenant',
    minWidth: '145px',
    maxWidth: '145px',
  },
  {
    name: 'Tenant ID',
    selector: (row) => row['TenantID'],
    sortable: true,
    cell: (row) => CellTip(row['TenantID'] ?? 'None'),
    exportSelector: 'TenantID',
    minWidth: '145px',
    maxWidth: '145px',
  },
  {
    name: 'User',
    selector: (row) => row['User'],
    sortable: true,
    cell: (row) => CellTip(row['User']),
    exportSelector: 'User',
    minWidth: '145px',
    maxWidth: '145px',
  },
  {
    name: 'Message',
    selector: (row) => row['Message'],
    sortable: true,
    cell: (row) => CellTip(row['Message']),
    exportSelector: 'Message',
  },
  {
    name: 'API',
    selector: (row) => row['API'],
    sortable: true,
    cell: (row) => CellTip(row['API']),
    exportSelector: 'API',
    minWidth: '145px',
    maxWidth: '145px',
  },
  {
    name: 'Severity',
    selector: (row) => row['Severity'],
    sortable: true,
    exportSelector: 'Severity',
    minWidth: '145px',
    maxWidth: '145px',
  },
]

const Logs = () => {
  let navigate = useNavigate()
  let query = useQuery()
  const severity = query.get('severity')
  const user = query.get('user')
  const DateFilter = query.get('DateFilter')
  //const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [visibleA, setVisibleA] = useState(false)
  const [startDate, setStartDate] = useState(new Date())
  const handleSubmit = async (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    const shippedValues = {
      SearchNow: true,
      DateFilter: startDate.toLocaleDateString('en-GB').split('/').reverse().join(''),
      ...values,
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    navigate(`?${queryString}`)
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Logbook Settings
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
                <Form
                  initialValues={{
                    Severity: severity,
                    user: user,
                    DateFilter: DateFilter,
                  }}
                  onSubmit={handleSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow className="mb-3">
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="user"
                              label="User"
                              placeholder="Wildcards allowed"
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="severity"
                              label="Severity"
                              placeholder="debug,info,warn,error,critical"
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <DatePicker
                              dateFormat="yyyyMMdd"
                              className="form-control"
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon icon={faSearch} className="me-2" />
                              Search
                            </CButton>
                          </CCol>
                        </CRow>
                      </CForm>
                    )
                  }}
                />
              </CCardBody>
            </CCard>
          </CCollapse>
        </CCol>
      </CRow>
      <hr />
      <CippPage title="LogBook Results" tenantSelector={false}>
        <CCard className="content-card">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle>Results</CCardTitle>
          </CCardHeader>
          <CCardBody>
            <CippDatatable
              reportName={`CIPP-Logbook`}
              path="/api/Listlogs"
              params={{
                Severity: severity,
                user: user,
                DateFilter: DateFilter,
                Filter: !!DateFilter,
              }}
              columns={columns}
            />
          </CCardBody>
        </CCard>
      </CippPage>
    </>
  )
}

export default Logs
