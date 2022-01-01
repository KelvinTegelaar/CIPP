import React from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CRow,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSelect, RFFCFormTextarea } from '../../../components/RFFComponents'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const MEMAddPolicyTemplate = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    // alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    genericPostRequest({ url: 'api/AddIntuneTemplate', values })
  }

  return (
    <>
      <CRow>
        {postResults.isSuccess && <CAlert color="success">{postResults.data.Results}</CAlert>}
        <CCol md={6}>
          <CCard>
            <CCardHeader>
              <CCardTitle className="text-primary">Template details</CCardTitle>
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
                          />
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol>
                          <RFFCFormTextarea
                            name="RawJSON"
                            label="RAW Json"
                            placeholder="Enter RAW JSON Information"
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
    </>
  )
}

export default MEMAddPolicyTemplate
