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
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

/**
 * The SettingsBackend method is responsible for rendering a settings panel that contains several resource
 * groups and corresponding links to access them.
 * The panel displays information about Resource Group, Key Vault, Static Web App (Role Management),
 * Function App (Deployment Center), Function App (Configuration), Function App (Overview), and Cloud Shell.
 * Wow Kevin, you went hard, sorry I'm going to run it again. // Kelvin 22-04-2024.
 * @returns {JSX.Element} The settings panel component.
 */

const BackendCardList = [
  {
    title: 'Resource Group',
    description:
      'The Resource group contains all the CIPP resources in your tenant, except the SAM Application',
    link: 'ResourceGroup',
  },
  {
    title: 'Key Vault',
    description:
      'The keyvault allows you to check token information. By default you do not have access.',
    link: 'KeyVault',
  },
  {
    title: 'Static Web App (Role Management)',
    description:
      'The Static Web App role management allows you to invite other users to the application.',
    link: 'SWARoles',
  },
  {
    title: 'Function App (Deployment Center)',
    description: 'The Function App Deployment Center allows you to run updates on the API',
    link: 'FunctionDeployment',
  },
  {
    title: 'Function App (Configuration)',
    description:
      'At the Function App Configuration you can check the status of the API access to your keyvault',
    link: 'FunctionConfig',
  },
  {
    title: 'Function App (Overview)',
    description: 'At the function App Overview, you can stop and start the backend API',
    link: 'FunctionApp',
  },
]

export function SettingsBackend() {
  const [listBackend, listBackendResult] = useLazyGenericGetRequestQuery()
  const [visible, setVisible] = useState(false)
  const generateButton = (title, link) => (
    <CLink
      onClick={() => window.open(`${listBackendResult.data?.Results?.[link]}`, '_blank')}
      rel="noreferrer"
    >
      <CButton className="me-3">{title}</CButton>
    </CLink>
  )

  return (
    <>
      {listBackendResult.isUninitialized && listBackend({ path: 'api/ExecBackendURLs' })}
      <CRow className="mb-3">
        {BackendCardList.map((card, index) => (
          <CCol className="mb-3" md={4} key={index}>
            <CippButtonCard
              title={card.title}
              titleType="big"
              isFetching={listBackendResult.isFetching}
              CardButton={generateButton(card.title, card.link)}
            >
              <small>{card.description}</small>
            </CippButtonCard>
          </CCol>
        ))}
        <CCol md={4}>
          <CippButtonCard
            title={'Cloud Shell'}
            titleType="big"
            isFetching={listBackendResult.isFetching}
            CardButton={
              <>
                {' '}
                <CLink
                  className="me-2"
                  onClick={() =>
                    window.open(
                      'https://shell.azure.com/powershell',
                      '_blank',
                      'toolbar=no,scrollbars=yes,resizable=yes,menubar=no,location=no,status=no',
                    )
                  }
                  rel="noreferrer"
                >
                  <CButton>Cloud Shell</CButton>
                </CLink>
                <CButton onClick={() => setVisible(true)} className="me-2">
                  Command Reference
                </CButton>
              </>
            }
          >
            <p>Launch an Azure Cloud Shell Window</p>
          </CippButtonCard>
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
  )
}
