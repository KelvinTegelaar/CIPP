import React from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { CippContentCard, CippPage } from 'src/components/layout'
import { RFFCFormTextarea } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const TransportAddTemplate = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    // alert(JSON.stringify(values, null, 2))
    // @todo hook this up
    genericPostRequest({ path: '/api/AddTransportTemplate', values })
  }

  return (
    <CippPage tenantSelector={false} title="Add Transport Rule Template">
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
                      name="PowerShellCommand"
                      label="PowerShell Command"
                      placeholder="Enter the PowerShell command you use to create the rule. This command will converted to a template."
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

export default TransportAddTemplate
