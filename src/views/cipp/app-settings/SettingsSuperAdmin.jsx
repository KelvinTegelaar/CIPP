import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CLink,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormRadio } from 'src/components/forms/index.js'
import React from 'react'
import { CippCallout } from 'src/components/layout/index.js'

export function SettingsSuperAdmin() {
  const partnerConfig = useGenericGetRequestQuery({
    path: '/api/ExecPartnerMode',
    params: { Action: 'ListCurrent' },
  })

  const [submitWebhook, webhookCreateResult] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    submitWebhook({
      path: '/api/ExecPartnerMode',
      values: values,
    }).then((res) => {})
  }

  return (
    <CCard className="h-100">
      <CCardHeader></CCardHeader>
      <CCardBody>
        <>
          <>
            <h3 className="underline mb-5">Super Admin Configuration</h3>
            <CRow>
              <CCol sm={12} md={6} lg={8} className="mb-3">
                <p className="me-1">
                  The configuration settings below should only be modified by a super admin. Super
                  admins can configure what tenant mode CIPP operates in. See
                  <CLink
                    href="https://docs.cipp.app/setup/installation/owntenant"
                    target="_blank"
                    className="m-1"
                  >
                    our documentation
                  </CLink>
                  for more information on how to configure these modes and what they mean.
                </p>
              </CCol>
            </CRow>
            <CRow>
              <CCol sm={12} md={12} className="mb-3">
                <p className="fw-lighter">Tenant Mode</p>
                <Form
                  onSubmit={onSubmit}
                  initialValues={partnerConfig.data}
                  render={({ handleSubmit }) => (
                    <>
                      {partnerConfig.isFetching && <CSpinner size="sm" className="me-2" />}
                      <CForm onSubmit={handleSubmit}>
                        <RFFCFormRadio
                          name="TenantMode"
                          label="Multi Tenant - GDAP Mode"
                          value="default"
                        />
                        <RFFCFormRadio
                          name="TenantMode"
                          label="Multi Tenant - Add Partner Tenant"
                          value="PartnerTenantAvailable"
                        />
                        <RFFCFormRadio
                          name="TenantMode"
                          label="Single Tenant - Own Tenant Mode"
                          value="owntenant"
                        />
                        <CButton
                          type="submit"
                          color="primary"
                          className="my-3"
                          disabled={webhookCreateResult.isFetching}
                        >
                          {webhookCreateResult.isFetching ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </CButton>
                      </CForm>
                    </>
                  )}
                />
                {webhookCreateResult.isSuccess && (
                  <CippCallout color="info" dismissible>
                    {webhookCreateResult?.data?.results}
                  </CippCallout>
                )}
              </CCol>
            </CRow>
          </>
        </>
      </CCardBody>
    </CCard>
  )
}
