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
import { CippDatatable } from 'src/components/tables'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const columns = [
  {
    name: 'Date',
    selector: (row) => row['DateTime'],
    sortable: true,
    exportSelector: 'DateTime',
  },
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    exportSelector: 'Tenant',
  },
  {
    name: 'API',
    selector: (row) => row['API'],
    sortable: true,
    exportSelector: 'API',
  },
  {
    name: 'Message',
    selector: (row) => row['Message'],
    sortable: true,
    exportSelector: 'Message',
  },
  {
    name: 'User',
    selector: (row) => row['User'],
    sortable: true,
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
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const sender = query.get('sender')
  const recipient = query.get('recipient')
  const days = query.get('days')
  //const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [visibleA, setVisibleA] = useState(false)

  const handleSubmit = async (values) => {
    const shippedValues = {
      tenantFilter: tenant.defaultDomainName,
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
                    tenantFilter: tenant.defaultDomainName,
                    sender: sender,
                    recipient: recipient,
                    days: days,
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
                          <CCol>
                            <RFFCFormSelect
                              name="logfile"
                              label="Log File"
                              placeholder="2"
                              values={[
                                { label: '1', value: '1' },
                                { label: '2', value: '2' },
                                { label: '3', value: '3' },
                                { label: '4', value: '4' },
                                { label: '5', value: '5' },
                                { label: '6', value: '6' },
                                { label: '7', value: '7' },
                                { label: '8', value: '8' },
                                { label: '9', value: '9' },
                                { label: '10', value: '10' },
                              ]}
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
        <CippDatatable
          reportName={`CIPP-Logbook`}
          path="/api/Listlogs"
          // params={{
          // tenantFilter: tenant.defaultDomainName,
          // sender: sender,
          // recipient: recipient,
          // days: days,
          //}}
          columns={columns}
        />
      </CippPage>
    </>
  )
}

export default Logs
