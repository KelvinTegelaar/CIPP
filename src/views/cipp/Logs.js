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
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const columns = [
  {
    name: 'Date (UTC)',
    selector: (row) => row['DateTime'],
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'DateTime',
    minWidth: '145px',
  },
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    cell: (row) => CellTip(row['Tenant']),
    exportSelector: 'Tenant',
  },
  {
    name: 'API',
    selector: (row) => row['API'],
    sortable: true,
    cell: (row) => CellTip(row['API']),
    exportSelector: 'API',
  },
  {
    name: 'Message',
    selector: (row) => row['Message'],
    sortable: true,
    cell: (row) => CellTip(row['Message']),
    exportSelector: 'Message',
  },
  {
    name: 'User',
    selector: (row) => row['User'],
    sortable: true,
    cell: (row) => CellTip(row['User']),
    exportSelector: 'User',
  },
  {
    name: 'Severity',
    selector: (row) => row['Severity'],
    sortable: true,
    exportSelector: 'Severity',
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
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()

  const handleSubmit = async (values) => {
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
    const shippedValues = {
      SearchNow: true,
      ...values,
    }
    var queryString = Object.keys(shippedValues)
      .map((key) => key + '=' + shippedValues[key])
      .join('&')

    //alert(JSON.stringify(values, null, 2))
    navigate(`?${queryString}`)
    // @todo hook this up
    // genericPostRequest({ url: 'api/AddIntuneTemplate', values })
  }

  return (
    <>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ListLogs?ListLogs=true' })}
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Logbook Settings
                <CButton size="sm" variant="ghost" onClick={() => setVisibleA(!visibleA)}>
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCollapse visible={visibleA}>
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
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="user"
                              label="User"
                              placeholder="Wildcards allowed"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="severity"
                              label="Severity"
                              placeholder="debug,info,warn,error,critical"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          {listBackendResult.isSuccess && (
                            <CCol>
                              <RFFCFormSelect
                                name="DateFilter"
                                label="Log File"
                                values={listBackendResult.data}
                              />
                            </CCol>
                          )}
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting}>
                              <FontAwesomeIcon icon={faSearch} className="me-2" />
                              Search
                            </CButton>
                          </CCol>
                        </CRow>
                        {/*<CRow>*/}
                        {/* <CCol>*/}
                        {/*   <pre>{JSON.stringify(values, null, 2)}</pre>*/}
                        {/* </CCol>*/}
                        {/*</CRow>*/}
                      </CForm>
                    )
                  }}
                />
              </CCardBody>
            </CCollapse>
          </CCard>
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
