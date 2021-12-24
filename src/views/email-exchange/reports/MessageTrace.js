import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CCollapse,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from '../../../hooks/useQuery'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect, RFFCFormTextarea } from '../../../components/RFFComponents'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { CippDatatable, TenantSelector } from 'src/components/cipp'
import { useSelector } from 'react-redux'

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
  },
  {
    name: 'User Type',
    selector: (row) => row['userType'],
    sortable: true,
  },
  {
    name: 'Account Enabled',
    selector: (row) => row['accountEnabled'],
    sortable: true,
  },
  {
    name: 'On Premise Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    sortable: true,
  },
  {
    name: 'Licenses',
    selector: (row) => 'Click to Expand',
  },
]

const MessageTrace = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [visibleA, setVisibleA] = useState(false)

  const handleSubmit = async (values) => {
    // alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    // genericPostRequest({ url: 'api/AddIntuneTemplate', values })
  }

  return (
    <>
      <CRow>
        <CCol md={4}>
          <CCard>
            <CCardHeader>
              <CCardTitle className="text-primary d-flex justify-content-between">
                Message Trace settings
                <CButton size="sm" variant="ghost" onClick={() => setVisibleA(!visibleA)}>
                  <FontAwesomeIcon icon={visibleA ? faChevronDown : faChevronRight} />
                </CButton>
              </CCardTitle>
            </CCardHeader>
            <CCollapse visible={visibleA}>
              <CCardBody>
                <Form
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
                              name="Recipient"
                              label="Recipient"
                              placeholder="Enter an e-mail address"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="Sender"
                              label="Sender"
                              placeholder="Enter an e-mail address"
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormSelect
                              name="Days"
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
                            <CButton className="text-white" type="submit" disabled={submitting}>
                              Perform Search
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
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Message Trace Results</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            reportName={`${tenant?.defaultDomainName}-Messagetrace`}
            path="/api/ListUsers"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default MessageTrace
