import { useLazyGenericGetRequestQuery } from 'src/store/api/app.js'
import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CLink,
  CRow,
} from '@coreui/react'
import { CippCodeBlock, CippOffcanvas } from 'src/components/utilities/index.js'

/**
 * The SettingsBackend method is responsible for rendering a settings panel that contains several resource
 * groups and corresponding links to access them.
 * The panel displays information about Resource Group, Key Vault, Static Web App (Role Management),
 * Function App (Deployment Center), Function App (Configuration), Function App (Overview), and Cloud Shell.
 *
 * @returns {JSX.Element} The settings panel component.
 */
export function SettingsBackend() {
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()
  const [visible, setVisible] = useState(false)
  return (
    <div>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ExecBackendURLs' })}
      <>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Resource Group</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>
                  The Resource group contains all the CIPP resources in your tenant, except the SAM
                  Application
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.ResourceGroup}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Resource Group</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Key Vault</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>
                  The keyvault allows you to check token information. By default you do not have
                  access.
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.KeyVault}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Keyvault</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Static Web App (Role Management)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>
                  The Static Web App role management allows you to invite other users to the
                  application.
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.SWARoles}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Role Management</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Deployment Center)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>The Function App Deployment Center allows you to run updates on the API</p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionDeployment}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Deployment Center</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Configuration)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>
                  At the Function App Configuration you can check the status of the API access to
                  your keyvault
                </p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionConfig}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Configuration</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Function App (Overview)</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>At the function App Overview, you can stop and start the backend API</p>
                <a
                  target={'_blank'}
                  href={listBackendResult.data?.Results?.FunctionApp}
                  rel="noreferrer"
                >
                  <CButton className="mb-3">Go to Function App Overview</CButton>
                </a>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardHeader>
                <CCardTitle>Cloud Shell</CCardTitle>
              </CCardHeader>
              <CCardBody>
                <p>Launch an Azure Cloud Shell Window</p>
                <CLink
                  onClick={() =>
                    window.open(
                      'https://shell.azure.com/powershell',
                      '_blank',
                      'toolbar=no,scrollbars=yes,resizable=yes,menubar=no,location=no,status=no',
                    )
                  }
                  rel="noreferrer"
                >
                  <CButton className="mb-3 me-3">Cloud Shell</CButton>
                </CLink>
                <CButton onClick={() => setVisible(true)} className="mb-3">
                  Command Reference
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CippOffcanvas
          id="command-offcanvas"
          visible={visible}
          placement="end"
          className="cipp-offcanvas"
          hideFunction={() => setVisible(false)}
          title="Command Reference"
        >
          <h5 className="my-3">Function App Config</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$Function = Get-AzFunctionApp -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.FunctionName +
              '; $Function | select Name, Status, Location, Runtime, ApplicationSettings'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Function App Deployment</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$FunctionDeployment = az webapp deployment source show --resource-group ' +
              listBackendResult.data?.Results?.RGName +
              ' --name ' +
              listBackendResult.data?.Results?.FunctionName +
              ' | ConvertFrom-Json; $FunctionDeployment | Select-Object repoUrl, branch, isGitHubAction, isManualIntegration, githubActionConfiguration'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Watch Function Logs</h5>
          <CippCodeBlock
            language="powershell"
            code={
              'az webapp log tail --resource-group ' +
              listBackendResult.data?.Results?.RGName +
              ' --name ' +
              listBackendResult.data?.Results?.FunctionName
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">Static Web App Config</h5>
          <CippCodeBlock
            language="powershell"
            code={
              '$StaticWebApp = Get-AzStaticWebApp -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.SWAName +
              '; $StaticWebApp | Select-Object Name, CustomDomain, DefaultHostname, RepositoryUrl'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
          <h5 className="my-3">List CIPP Users</h5>
          <CippCodeBlock
            language="powershell"
            code={
              'Get-AzStaticWebAppUser -ResourceGroupName ' +
              listBackendResult.data?.Results?.RGName +
              ' -Name ' +
              listBackendResult.data?.Results?.SWAName +
              ' -AuthProvider all | Select-Object DisplayName, Role'
            }
            showLineNumbers={false}
            wrapLongLines={true}
          />
        </CippOffcanvas>
      </>
    </div>
  )
}
