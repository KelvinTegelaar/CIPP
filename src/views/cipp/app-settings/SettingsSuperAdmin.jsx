import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import { CAccordion, CButton, CCol, CForm, CLink, CRow, CSpinner } from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormRadio, RFFCFormSwitch } from 'src/components/forms/index.js'
import React from 'react'
import { CippCallout } from 'src/components/layout/index.js'
import CippAccordionItem from 'src/components/contentcards/CippAccordionItem'
import SettingsCustomRoles from 'src/views/cipp/app-settings/components/SettingsCustomRoles'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import SettingsSAMRoles from './components/SettingsSAMRoles'
import SettingsAppPermissions from './components/SettingsAppPermissions'

export function SettingsSuperAdmin() {
  const partnerConfig = useGenericGetRequestQuery({
    path: '/api/ExecPartnerMode',
    params: { Action: 'ListCurrent' },
  })
  const offloadConfig = useGenericGetRequestQuery({
    path: '/api/ExecOffloadFunctions',
    params: { Action: 'ListCurrent' },
  })

  const [execPartnerMode, execPartnerModeResult] = useLazyGenericPostRequestQuery()
  const [execOffloadFunctions, execOffloadFunctionsResult] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    execPartnerMode({
      path: '/api/ExecPartnerMode',
      values: values,
    }).then((res) => {})
  }
  const buttonCard = (
    <CButton
      form="submitForm"
      type="submit"
      color="primary"
      disabled={execPartnerModeResult.isFetching}
    >
      {execPartnerModeResult.isFetching ? (
        <>
          <CSpinner size="sm" className="me-2" />
        </>
      ) : (
        'Save'
      )}
    </CButton>
  )

  const onSubmitOffload = (values) => {
    execOffloadFunctions({
      path: '/api/ExecOffloadFunctions',
      values: values,
    }).then((res) => {})
  }

  const buttonCardOffload = (
    <CButton
      form="offloadForm"
      type="submit"
      color="primary"
      disabled={execOffloadFunctionsResult.isFetching}
    >
      {execOffloadFunctionsResult.isFetching ? (
        <>
          <CSpinner size="sm" className="me-2" />
        </>
      ) : (
        'Save'
      )}
    </CButton>
  )

  return (
    <>
      <CRow className="mb-3">
        <CCol sm={12} md={6}>
          <CippButtonCard
            title="Tenant Mode"
            titleType="big"
            isFetching={partnerConfig.isFetching}
            CardButton={buttonCard}
          >
            <>
              <>
                <CRow>
                  <CCol sm={12} md={6} lg={8} className="mb-3">
                    <p className="me-1">
                      The configuration settings below should only be modified by a super admin.
                      Super admins can configure what tenant mode CIPP operates in. See
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
                          <CForm id="submitForm" onSubmit={handleSubmit}>
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
                          </CForm>
                        </>
                      )}
                    />
                    {execPartnerModeResult.isSuccess && (
                      <CippCallout color="info" dismissible>
                        {execPartnerModeResult?.data?.results}
                      </CippCallout>
                    )}
                  </CCol>
                </CRow>
              </>
            </>
          </CippButtonCard>
        </CCol>
        <CCol sm={12} md={6}>
          <CippButtonCard
            title="Offload Functions to Processor"
            titleType="big"
            isFetching={offloadConfig.isFetching}
            CardButton={buttonCardOffload}
          >
            <>
              <CRow>
                <CCol sm={12} lg={8}>
                  <p className="me-1">
                    This mode enables offloading some of the more processor intensive functions to a
                    separate function app. This can be useful in environments where the CIPP server
                    is under heavy load.
                  </p>
                  <h5>Current Functions</h5>
                  <ul>
                    <li>Audit Logs</li>
                  </ul>
                </CCol>
              </CRow>
              <CRow>
                <CCol sm={12} md={12}>
                  <Form
                    onSubmit={onSubmitOffload}
                    initialValues={offloadConfig.data}
                    render={({ handleSubmit }) => (
                      <>
                        <CForm id="offloadForm" onSubmit={handleSubmit}>
                          <RFFCFormSwitch name="OffloadFunctions" label="Offload Functions" />
                        </CForm>
                      </>
                    )}
                  />
                  {execOffloadFunctionsResult.isSuccess && (
                    <CippCallout color="info" dismissible>
                      {execOffloadFunctionsResult?.data?.results}
                    </CippCallout>
                  )}
                </CCol>
              </CRow>
            </>
          </CippButtonCard>
        </CCol>
      </CRow>
      <SettingsCustomRoles />
      <SettingsSAMRoles />
      <SettingsAppPermissions />
    </>
  )
}
