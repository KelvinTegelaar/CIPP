import React from 'react'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { CippPage } from 'src/components/layout'
import { RFFCFormInput, RFFCFormSelect, RFFCFormTextarea } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { required, validJson } from 'src/validators'

const MEMAddPolicyTemplate = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    // alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    genericPostRequest({ path: '/api/AddIntuneTemplate', values })
  }

  return (
    <CippPage tenantSelector={false} title="Add MEM Policy Template">
      <CRow>
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <CCol md={6}>
          <CCard className="page-card">
            <CCardHeader>
              <CCardTitle className="text-primary">Template Details</CCardTitle>
            </CCardHeader>
            <CCardBody>
              <Form
                onSubmit={handleSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow>
                        <CCol>
                          <RFFCFormInput
                            type="text"
                            name="displayName"
                            label="Display Name"
                            placeholder="Enter the Display Name"
                            validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormInput
                            type="text"
                            name="description"
                            label="Description"
                            placeholder="Enter the description"
                            validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormSelect
                            name="TemplateType"
                            label="Select Policy Type"
                            placeholder="Select a template type"
                            values={[
                              { label: 'Administrative Template', value: 'Admin' },
                              { label: 'Settings Catalog', value: 'Catalog' },
                              { label: 'Custom Configuration', value: 'Device' },
                            ]}
                            validate={required}
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormTextarea
                            name="RawJSON"
                            label="RAW Json"
                            placeholder="Enter RAW JSON Information"
                            validate={validJson}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <CButton className="text-white" type="submit" disabled={submitting}>
                            Add Template
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
          </CCard>
        </CCol>
      </CRow>
    </CippPage>
  )
}

export default MEMAddPolicyTemplate
