import React from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { CippContentCard, CippPage } from 'src/components/layout'
import { RFFCFormTextarea } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { validJson } from 'src/validators'

const MEMAddPolicyTemplate = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    // alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    genericPostRequest({ path: '/api/AddCATemplate', values })
  }

  return (
    <CippPage tenantSelector={false} title="Add Conditional Access Template">
      <CippContentCard title="Template Details">
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <Form
          onSubmit={handleSubmit}
          render={({ handleSubmit, submitting, values }) => {
            return (
              <CForm onSubmit={handleSubmit}>
                <CRow>
                  <CCol>
                    <RFFCFormTextarea
                      name="Rawjson"
                      label="Policy JSON information"
                      placeholder="Enter RAW JSON Information, you can also convert existing CA policies to templates via the list policies menu"
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
      </CippContentCard>
    </CippPage>
  )
}

export default MEMAddPolicyTemplate
