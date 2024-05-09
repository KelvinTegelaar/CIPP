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
import { RFFCFormSelect, RFFCFormInput, RFFCFormCheck } from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'

const AddTenantAllowBlockList = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      tenantID: tenantDomain,
      entries: values.entries,
      listType: values.listType,
      notes: values.notes,
      listMethod: values.listMethod,
      NoExpiration: values.NoExpiration,
    }
    genericPostRequest({ path: '/api/AddTenantAllowBlockList', values: shippedValues })
  }
  return (
    <CippPage title="Add Tenant Allow/Block List">
      <CCard className="content-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Add Tenant Allow/Block List</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <Form
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="entries" label="Entries" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormInput type="text" name="notes" label="Notes" />
                    </CCol>
                    <CCol md={4}>
                      <RFFCFormSelect
                        name="listType"
                        values={[
                          {
                            value: 'Sender',
                            label: 'Sender',
                          },
                          {
                            value: 'Url',
                            label: 'Url',
                          },
                          {
                            value: 'FileHash',
                            label: 'FileHash',
                          },
                        ]}
                        placeholder="Select a List Type"
                        label="Please choose a List Type."
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormSelect
                        name="listMethod"
                        label="Block or Allow Entry"
                        values={[
                          {
                            value: 'Block',
                            label: 'Block',
                          },
                          {
                            value: 'Allow',
                            label: 'Allow',
                          },
                        ]}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={4}>
                      <RFFCFormCheck label="NoExpiration" name="NoExpiration" />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Entry
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

export default AddTenantAllowBlockList
