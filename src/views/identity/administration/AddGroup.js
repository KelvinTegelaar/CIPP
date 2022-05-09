import React from 'react'
import { CCallout, CButton, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormCheck, RFFCFormInput, RFFCFormSelect } from 'src/components/forms'
import { CippPage } from 'src/components/layout/CippPage'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useListDomainsQuery } from 'src/store/api/domains'
import { useSelector } from 'react-redux'

const AddGroup = () => {
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
      displayName: values.displayName,
      username: values.username,
      isAssignableToRole: values.isAssignableToRole,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/AddGroup', values: shippedValues })
  }
  return (
    <CippPage title="Add Group">
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
                <RFFCFormCheck name="isAssignableToRole" label="Azure Role Group" />
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CButton type="submit" disabled={submitting}>
                    Add Group
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
    </CippPage>
  )
}

export default AddGroup
