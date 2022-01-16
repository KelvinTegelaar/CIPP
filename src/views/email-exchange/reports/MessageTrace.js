import React, { useState } from 'react'
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
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'
import { CippDatatable } from 'src/components/tables'
import { TenantSelector } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { CippPage } from 'src/components/layout/CippPage'

const columns = [
  {
    name: 'Date',
    selector: (row) => row['Date'],
    sortable: true,
    exportSelector: 'Date',
  },
  {
    name: 'Recipient',
    selector: (row) => row['RecipientAddress'],
    sortable: true,
    exportSelector: 'Recipient',
  },
  {
    name: 'Sender',
    selector: (row) => row['SenderAddress'],
    sortable: true,
    exportSelector: 'Sender',
  },
  {
    name: 'Subject',
    selector: (row) => row['Subject'],
    sortable: true,
    exportSelector: 'Subject',
  },
  {
    name: 'Status',
    selector: (row) => row['Status'],
    sortable: true,
    exportSelector: 'Status',
  },
]

const MessageTrace = () => {
  let navigate = useNavigate()
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const sender = query.get('sender')
  const recipient = query.get('recipient')
  const days = query.get('days')
  const SearchNow = query.get('SearchNow')
  //const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [visibleA, setVisibleA] = useState(true)

  const handleSubmit = async (values) => {
    setVisibleA(false)
    Object.keys(values).filter(function (x) {
      if (values[x] === null) {
        delete values[x]
      }
      return null
    })
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
    // genericPostRequest({ path: '/api/AddIntuneTemplate', values })
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="options-card">
            <CCardHeader>
              <CCardTitle className="d-flex justify-content-between">
                Message Trace Settings
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
                            Select a tenant
                            <TenantSelector />
                          </CCol>
                        </CRow>
                        <hr className="my-4" />

                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="recipient"
                              label="Recipient"
                              placeholder="Enter an e-mail address"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="sender"
                              label="Sender"
                              placeholder="Enter an e-mail address"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormSelect
                              name="days"
                              label="How many days back to search"
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
                              <FontAwesomeIcon className="me-2" icon={faSearch} />
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
      <CippPage title="Message Trace Results" tenantSelector={false}>
        {!SearchNow && <span>Execute a search to get started.</span>}
        {SearchNow && (
          <CippDatatable
            reportName={`${tenant?.defaultDomainName}-Messagetrace`}
            path="/api/listMessagetrace"
            params={{
              tenantFilter: tenant.defaultDomainName,
              sender: sender,
              recipient: recipient,
              days: days,
            }}
            columns={columns}
          />
        )}
      </CippPage>
    </>
  )
}

export default MessageTrace
