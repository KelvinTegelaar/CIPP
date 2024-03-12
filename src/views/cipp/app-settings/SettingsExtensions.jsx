import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import React, { useRef } from 'react'
import {
  CAlert,
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import Extensions from 'src/data/Extensions.json'
import { Form } from 'react-final-form'
import { RFFCFormInput, RFFCFormSwitch } from 'src/components/forms/index.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { CippCallout } from 'src/components/layout/index.js'

/**
 * Executes various operations related to settings and extensions.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export function SettingsExtensions() {
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()
  const inputRef = useRef(null)
  const [setExtensionconfig, extensionConfigResult] = useLazyGenericPostRequestQuery()
  const [execTestExtension, listExtensionTestResult] = useLazyGenericGetRequestQuery()
  const [execSyncExtension, listSyncExtensionResult] = useLazyGenericGetRequestQuery()

  const onSubmitTest = (integrationName) => {
    execTestExtension({
      path: 'api/ExecExtensionTest?extensionName=' + integrationName,
    })
  }
  const onSubmit = (values) => {
    setExtensionconfig({
      path: 'api/ExecExtensionsConfig',
      values: values,
    })
  }
  return (
    <div>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ListExtensionsConfig' })}
      <>
        {(listBackendResult.isFetching ||
          extensionConfigResult.isFetching ||
          listExtensionTestResult.isFetching ||
          listSyncExtensionResult.isFetching) && (
          <CippCallout color="success">
            <CSpinner />
          </CippCallout>
        )}
        {listSyncExtensionResult.isSuccess && !listSyncExtensionResult.isFetching && (
          <CippCallout color="success" dismissible>
            {listSyncExtensionResult.data.Results}
          </CippCallout>
        )}
        {listExtensionTestResult.isSuccess && !listExtensionTestResult.isFetching && (
          <CippCallout color="success" dismissible>
            {listExtensionTestResult.data.Results}
          </CippCallout>
        )}
        {extensionConfigResult.isSuccess && !extensionConfigResult.isFetching && (
          <CippCallout color="success" dismissible>
            {extensionConfigResult.data.Results}
          </CippCallout>
        )}
        <CRow>
          {Extensions.map((integration, idx) => (
            <CCol xs={12} lg={6} xl={6} className="mb-3" key={`${idx}-${integration.name}`}>
              <CCard className="d-flex flex-column h-100">
                <CCardHeader>
                  <CCardTitle>{integration.name}</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <p>{integration.helpText}</p>
                  <Form
                    onSubmit={onSubmit}
                    initialValues={listBackendResult.data}
                    render={({ handleSubmit, submitting, values }) => {
                      return (
                        <CForm onSubmit={handleSubmit}>
                          <CCardText>
                            <CCol className="mb-3">
                              {integration.SettingOptions.map(
                                (integrationOptions, idx) =>
                                  integrationOptions.type === 'input' && (
                                    <CCol key={`${idx}-${integrationOptions.name}`}>
                                      <RFFCFormInput
                                        type={integrationOptions.fieldtype}
                                        name={integrationOptions.name}
                                        label={integrationOptions.label}
                                        placeholder={integrationOptions.placeholder}
                                      />
                                    </CCol>
                                  ),
                              )}
                              {integration.SettingOptions.map(
                                (integrationOptions, idx) =>
                                  integrationOptions.type === 'checkbox' && (
                                    <CCol key={`${integrationOptions.name}-${idx}`}>
                                      <RFFCFormSwitch
                                        name={integrationOptions.name}
                                        label={integrationOptions.label}
                                        value={false}
                                      />
                                    </CCol>
                                  ),
                              )}
                              <input
                                ref={inputRef}
                                type="hidden"
                                name="type"
                                value={integration.type}
                              />
                            </CCol>
                          </CCardText>
                          <CCol className="me-2">
                            <CButton className="me-2" type="submit">
                              {extensionConfigResult.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                              Set Extension Settings
                            </CButton>
                            <CButton
                              onClick={() => onSubmitTest(integration.type)}
                              className="me-2"
                            >
                              {listExtensionTestResult.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                              Test Extension
                            </CButton>
                            {integration.forceSyncButton && (
                              <CButton
                                onClick={() =>
                                  execSyncExtension({
                                    path: 'api/ExecExtensionSync?Extension=' + integration.type,
                                  })
                                }
                                className="me-2"
                              >
                                {listSyncExtensionResult.isFetching && (
                                  <FontAwesomeIcon
                                    icon={faCircleNotch}
                                    spin
                                    className="me-2"
                                    size="1x"
                                  />
                                )}
                                Force Sync
                              </CButton>
                            )}
                          </CCol>
                        </CForm>
                      )
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          ))}
        </CRow>
      </>
    </div>
  )
}
