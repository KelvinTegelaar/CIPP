import React, { useRef, useState } from 'react'
import {
  CButton,
  CCardText,
  CCol,
  CForm,
  CNav,
  CNavItem,
  CRow,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { CippCallout, CippPage } from 'src/components/layout'
import { CippLazy } from 'src/components/utilities'
import { useNavigate } from 'react-router-dom'
import useQuery from 'src/hooks/useQuery.jsx'
import Extensions from 'src/data/Extensions.json'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import CippButtonCard from 'src/components/contentcards/CippButtonCard.jsx'
import { RFFCFormInput, RFFCFormSwitch } from 'src/components/forms/RFFComponents.jsx'
import { Form } from 'react-final-form'
import { SettingsExtensionMappings } from './app-settings/SettingsExtensionMappings'

export default function CIPPExtensions() {
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

  const ButtonGenerate = (integrationType, forceSync) => (
    <>
      <CButton className="me-2" form={integrationType} type="submit">
        {extensionConfigResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Set Extension Settings
      </CButton>
      <CButton onClick={() => onSubmitTest(integrationType)} className="me-2">
        {listExtensionTestResult.isFetching && (
          <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
        )}
        Test Extension
      </CButton>
      {forceSync && (
        <CButton
          onClick={() =>
            execSyncExtension({
              path: 'api/ExecExtensionSync?Extension=' + integrationType,
            })
          }
          className="me-2"
        >
          {listSyncExtensionResult.isFetching && (
            <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
          )}
          Force Sync
        </CButton>
      )}
    </>
  )
  const queryString = useQuery()
  const navigate = useNavigate()

  const tab = queryString.get('tab')
  const [active, setActiveTab] = useState(tab ? parseInt(tab) : 0)
  const setActive = (tab) => {
    setActiveTab(tab)
    queryString.set('tab', tab.toString())
    navigate(`${location.pathname}?${queryString}`)
  }

  return (
    <CippPage title="Settings" tenantSelector={false}>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ListExtensionsConfig' })}
      <CNav variant="tabs" role="tablist">
        {Extensions.map((integration, idx) => (
          <CNavItem
            key={`tab-${idx}`}
            active={active === idx}
            onClick={() => setActive(idx)}
            href="#"
          >
            {integration.name}
          </CNavItem>
        ))}
      </CNav>
      <CTabContent>
        {Extensions.map((integration, idx) => (
          <CTabPane key={`pane-${idx}`} visible={active === idx} className="mt-3">
            <CippLazy visible={active === idx}>
              <CRow className="mb-3">
                <CCol sm={12} md={integration.mappingRequired ? 4 : 12} className="mb-3">
                  <CippButtonCard
                    title={integration.name}
                    titleType="big"
                    isFetching={listBackendResult.isFetching}
                    CardButton={ButtonGenerate(integration.type, integration.forceSync)}
                    key={idx}
                  >
                    <p>{integration.helpText}</p>
                    <Form
                      onSubmit={onSubmit}
                      initialValues={listBackendResult.data}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm id={integration.type} onSubmit={handleSubmit}>
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
                          </CForm>
                        )
                      }}
                    />
                    {extensionConfigResult?.data?.Results && (
                      <CippCallout color={extensionConfigResult.isSuccess ? 'success' : 'danger'}>
                        {extensionConfigResult?.data?.Results}
                      </CippCallout>
                    )}
                    {listExtensionTestResult?.data?.Results && (
                      <CippCallout color={listExtensionTestResult.isSuccess ? 'success' : 'danger'}>
                        {listExtensionTestResult?.data?.Results}
                        {listExtensionTestResult?.data?.Link && (
                          <a
                            href={listExtensionTestResult?.data?.Link}
                            target="_blank"
                            rel="noreferrer"
                            className="ms-2"
                          >
                            Link
                          </a>
                        )}
                      </CippCallout>
                    )}
                  </CippButtonCard>
                </CCol>
                <CCol sm={12} md={8}>
                  <SettingsExtensionMappings type={integration.type} />
                </CCol>
              </CRow>
            </CippLazy>
          </CTabPane>
        ))}
      </CTabContent>
    </CippPage>
  )
}
