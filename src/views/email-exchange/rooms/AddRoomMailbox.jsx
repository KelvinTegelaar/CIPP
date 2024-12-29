import React from 'react'
import {
  CCallout,
  CButton,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect, RFFCFormTextarea } from 'src/components/forms'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useSelector } from 'react-redux'

const AddRoomMailbox = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: domains = [],
    isFetching: domainsIsFetching,
    error: domainsError,
  } = useListDomainsQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      domain: values.domain,
      displayName: values.displayName.trim(),
      username: values.username.trim(),
      userPrincipalName: values.username.trim() + '@' + values.domain.trim(),
      resourceCapacity: values.resourceCapacity ? values.resourceCapacity.trim() : undefined,
    }
    // window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddRoomMailbox', values: shippedValues })
  }

  // TODO: Add functionality to set location, office, floor and other things here
  return (
    <CippPage title="Add Room">
      <CCard className="content-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Add Room</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="displayName" label="Display Name" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormInput type="text" name="username" label="Username" />
                    </CCol>
                    <CCol md={4}>
                      {domainsIsFetching && <CSpinner />}
                      {!domainsIsFetching && (
                        <RFFCFormSelect
                          // label="Domain"
                          name="domain"
                          label="Primary Domain name"
                          placeholder={!domainsIsFetching ? 'Select domain' : 'Loading...'}
                          values={domains?.map((domain) => ({
                            value: domain.id,
                            label: domain.id,
                          }))}
                        />
                      )}
                      {domainsError && <span>Failed to load list of domains</span>}
                    </CCol>
                    <CCol xs={12}>
                      <RFFCFormInput
                        type="text"
                        name="resourceCapacity"
                        label="Resource Capacity (Optional)"
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Room Mailbox
                        {postResults.isFetching && (
                          <FontAwesomeIcon icon={faCircleNotch} spin className="ms-2" size="1x" />
                        )}
                      </CButton>
                    </CCol>
                  </CRow>
                  {postResults.isSuccess && (
                    <CCallout color="success">
                      {postResults.data.Results.map((message, idx) => {
                        return <li key={idx}>{message}</li>
                      })}
                    </CCallout>
                  )}
                </CForm>
              )
            }}
          />
        </CCardBody>
      </CCard>
    </CippPage>
  )
}

export default AddRoomMailbox
