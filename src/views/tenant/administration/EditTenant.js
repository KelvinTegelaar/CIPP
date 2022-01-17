import React, { useEffect, useState } from 'react'
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
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { CippPage } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { RFFCFormInput } from 'src/components/forms/RFFComponents'
import { useListTenantQuery } from 'src/store/api/tenants'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const EditTenant = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const tenantDomain = query.get('TenantFilter')
  const [queryError, setQueryError] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const { data: tenant = {}, isFetching, error, isSuccess } = useListTenantQuery(tenantDomain)

  useEffect(() => {
    if (!tenantDomain) {
      ModalService.open({
        body: 'Error: Invalid request. Could not load requested tenant.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    }
  }, [tenantDomain, dispatch])

  const onSubmit = (values) => {
    // @todo bind this
    //window.alert(JSON.stringify(values))
    genericPostRequest({ path: '/api/EditTenant', values })
  }
  const initialValues = {
    ...tenant[0],
  }
  return (
    <CippPage title="Tenant Details" tenantSelector={false}>
      {!queryError && (
        <>
          <CRow>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Current Settings</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {error && <span>Error loading Tenant</span>}
                  {isSuccess && (
                    <Form
                      initialValues={{ ...initialValues }}
                      onSubmit={onSubmit}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm onSubmit={handleSubmit}>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="displayName"
                                  label="Display Name"
                                />
                              </CCol>
                            </CRow>
                            <CRow>
                              <CCol md={6}>
                                <RFFCFormInput
                                  type="text"
                                  name="defaultDomainName"
                                  label="Default Domain Name"
                                />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
                                <CButton type="submit" disabled={submitting}>
                                  Edit Tenant
                                </CButton>
                              </CCol>
                            </CRow>
                            {postResults.isFetching && (
                              <CCallout color="info">
                                <CSpinner>Loading</CSpinner>
                              </CCallout>
                            )}
                            {postResults.isSuccess && (
                              <CCallout color="success">{postResults.data.Results}</CCallout>
                            )}
                          </CForm>
                        )
                      }}
                    />
                  )}
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Tenant Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {isFetching && <CSpinner />}
                  {isSuccess && (
                    <>
                      This is the (raw) information for this tenant.
                      <pre>{JSON.stringify(tenant, null, 2)}</pre>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CippPage>
  )
}

export default EditTenant
