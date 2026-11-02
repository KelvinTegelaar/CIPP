import { CippCodeBlock } from '../../../src/components/CippComponents/CippCodeBlock'

export default {
  title: 'Components/CippComponents/CippCodeBlock',
  component: CippCodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: { type: 'select' },
      options: ['json', 'powershell', 'javascript', 'bash', 'text'],
    },
    type: {
      control: { type: 'select' },
      options: ['syntax', 'editor'],
    },
    showLineNumbers: { control: 'boolean' },
    wrapLongLines: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
}

const sampleJson = JSON.stringify(
  {
    displayName: 'Alice',
    mail: 'alice@contoso.com',
    accountEnabled: true,
  },
  null,
  2,
)

const multilineJson = JSON.stringify(
  {
    id: '72f988bf-86f1-41af-91ab-2d7cd011db47',
    displayName: 'Contoso Ltd',
    defaultDomain: 'contoso.onmicrosoft.com',
    customDomain: 'contoso.com',
    licenseCount: 250,
    createdDateTime: '2021-01-15T00:00:00Z',
    assignedPlans: [
      { service: 'exchange', capabilityStatus: 'Enabled' },
      { service: 'SharePoint', capabilityStatus: 'Enabled' },
    ],
  },
  null,
  2,
)

export const JsonSyntax = {
  args: {
    code: sampleJson,
    language: 'json',
    type: 'syntax',
  },
}

export const PowerShell = {
  args: {
    code: 'Get-MsolUser -All | Where-Object {$_.isLicensed -eq $true} | Select-Object DisplayName, UserPrincipalName',
    language: 'powershell',
    type: 'syntax',
  },
}

export const WithLineNumbers = {
  args: {
    code: multilineJson,
    language: 'json',
    type: 'syntax',
    showLineNumbers: true,
  },
}

export const EditorMode = {
  args: {
    code: sampleJson,
    language: 'json',
    type: 'editor',
    editorHeight: '300px',
  },
}
