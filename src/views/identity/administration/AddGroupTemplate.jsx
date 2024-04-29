import React from 'react'
import {
  CCallout,
  CButton,
  CCol,
  CForm,
  CRow,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'
import { Form } from 'react-final-form'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormTextarea,
} from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'

const AddGroupTemplate = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    genericPostRequest({ path: '/api/AddGroupTemplate', values: values })
  }
  return (
    <CippPage title="Add Group">
      <CCard>
        <CCardHeader>
          <CCardTitle>Add Group Template</CCardTitle>
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
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="description" label="Description" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={8}>
                      <RFFCFormInput type="text" name="username" label="username" />
                    </CCol>
                  </CRow>
                  <CRow>
                    <RFFCFormRadio name="groupType" label="Azure Role Group" value="azurerole" />
                    <RFFCFormRadio name="groupType" label="Security Group" value="generic" />
                    <RFFCFormRadio
                      name="groupType"
                      label="Distribution List"
                      value="distribution"
                    />
                    <RFFCFormRadio
                      name="groupType"
                      label="Mail Enabled Security Group"
                      value="security"
                    />{' '}
                    <RFFCFormRadio name="groupType" label="Dynamic Group" value="dynamic" />
                    <RFFCFormRadio
                      name="groupType"
                      label="Dynamic Distribution Group"
                      value="dynamicdistribution"
                    />
                  </CRow>
                  <Condition when="groupType" is={'distribution'}>
                    <RFFCFormCheck
                      name="allowExternal"
                      label="Let people outside the organization email the group"
                    />
                  </Condition>

                  <Condition when="groupType" is={'dynamic'}>
                    <RFFCFormTextarea
                      name="membershipRule"
                      label="Dynamic Group Parameters"
                      placeholder={
                        'Enter the dynamic group parameters syntax. e.g: (user.userPrincipalName -notContains `"#EXT#@`") -and (user.userType -ne `"Guest`")'
                      }
                    />
                  </Condition>

                  <Condition when="groupType" is={'dynamicdistribution'}>
                    <RFFCFormTextarea
                      name="membershipRule"
                      label="Dynamic Group Parameters"
                      placeholder={
                        'Enter the dynamic group parameters syntax. e.g: (user.userPrincipalName -notContains `"#EXT#@`") -and (user.userType -ne `"Guest`")'
                      }
                    />
                  </Condition>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Group Template
                      </CButton>
                    </CCol>
                  </CRow>
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

export default AddGroupTemplate
