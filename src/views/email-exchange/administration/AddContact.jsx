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
import { RFFCFormCheck, RFFCFormInput } from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'

const AddContact = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName,
      email: values.email,
      hidefromGAL: values.hidefromGAL,
    }
    genericPostRequest({ path: '/api/AddContact', values: shippedValues })
  }
  return (
    <CippPage title="Add Contact">
      <CCard className="content-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Add Contact</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit} autoComplete="off">
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="displayName" label="Display Name" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormInput type="text" name="firstName" label="First Name" />
                    </CCol>
                    <CCol md={4}>
                      <RFFCFormInput type="text" name="lastName" label="Last Name" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="email" label="Email" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormCheck label="Hide from Global Address List" name="hidefromGAL" />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Contact
                      </CButton>
                    </CCol>
                  </CRow>
                  {postResults.isFetching && (
                    <CCallout color="success">
                      <CSpinner />
                    </CCallout>
                  )}
                  {postResults.isSuccess && (
                    <CCallout color="success">{postResults.data.Results}</CCallout>
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

export default AddContact
