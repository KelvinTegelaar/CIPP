import { pdf } from '@react-pdf/renderer'
import { writeFileSync } from 'fs'
import {
  WhatIfReportDocument,
  describeStageConditions,
} from '../../src/components/CippBaselines/CippBaselineWhatIfReport'

// Real render, not a stub: the point is that the document survives react-pdf's layout pass. A JSX
// error in a report only surfaces there, so a shallow render would assert nothing useful.
const renderToBlob = (node) => pdf(node).toBlob()

// Realistic rows in the shape Convert-CIPPBaselineResolvedEntity emits: template instances carry
// the fully rendered policy as expectedValue, plain settings carry their rendered expected block,
// currentValue holds what the tenant has today, and a freshly-assigned standard has status
// 'No Data' with no values at all.
const catalog = [
  {
    name: 'ConditionalAccessTemplate',
    label: 'Conditional Access Template',
    executiveText:
      'Deploys standardized conditional access policies that automatically enforce security requirements.',
    impact: 'High Impact',
    recommendedBy: ['CIS', 'Microsoft'],
    tag: ['CIS M365 7.0.0 (5.2.2.1)'],
    expected: { displayName: '%caTemplate%', state: '%state%' },
    variables: {
      caTemplate: { type: 'autoComplete', label: 'Select Conditional Access Template' },
      state: {
        type: 'autoComplete',
        label: 'What state should we deploy this template in?',
        options: [
          { label: 'Enabled', value: 'enabled' },
          { label: 'Report only', value: 'enabledForReportingButNotEnforced' },
        ],
        recommended: 'enabled',
      },
    },
  },
  {
    name: 'IntuneTemplate',
    label: 'Intune Template',
    executiveText:
      'Deploys standardized device management configurations across all corporate devices.',
    impact: 'High Impact',
    recommendedBy: ['CIPP'],
    tag: [],
    expected: { displayName: '%intuneTemplate%' },
    variables: {
      intuneTemplate: { type: 'autoComplete', label: 'Select Intune Template' },
    },
  },
  {
    name: 'AuditLog',
    label: 'Enable the Unified Audit Log',
    executiveText:
      'Turns on the audit log that records who did what across Microsoft 365, which every security investigation depends on.',
    impact: 'Low Impact',
    recommendedBy: ['CIS'],
    tag: ['CIS M365 7.0.0 (3.1.1)'],
    expected: { UnifiedAuditLogIngestionEnabled: true },
    variables: {},
  },
  {
    name: 'SpamFilterNotify',
    label: 'Set outbound spam notification address',
    executiveText:
      'Sends an alert to a mailbox you choose whenever one of your accounts starts sending spam, an early sign of a broken-into account.',
    impact: 'Low Impact',
    recommendedBy: [],
    tag: [],
    expected: { NotifyOutboundSpamRecipients: '%NotifyOutboundSpam%' },
    variables: {
      NotifyOutboundSpam: { type: 'textField', label: 'Notification e-mail address' },
    },
  },
  {
    name: 'SharingCapability',
    label: 'Set SharePoint sharing level',
    executiveText:
      'Controls how far files can be shared outside the organization from SharePoint and OneDrive.',
    impact: 'Medium Impact',
    recommendedBy: ['CIS'],
    tag: [],
    expected: { sharingCapability: '%Level%' },
    variables: {
      Level: {
        type: 'autoComplete',
        label: 'Sharing level',
        options: [
          { label: 'Anyone', value: 'ExternalUserAndGuestSharing' },
          { label: 'New and existing guests', value: 'ExternalUserSharingOnly' },
        ],
      },
    },
  },
]

const tenant = {
  displayName: 'CyberDrain Test Tenant 01',
  tenantFilter: 'cyberdraintest01.onmicrosoft.com',
  rows: [
    // Already deployed and verified.
    {
      standardName: 'ConditionalAccessTemplate#live1',
      standardLabel: 'CA00 - Block legacy authentication',
      status: 'Compliant',
      category: 'Templates',
      stage: 'Default',
      expectedValue: {
        displayName: 'CA00 - Block legacy authentication',
        state: 'enabled',
        conditions: {
          clientAppTypes: ['exchangeActiveSync', 'other'],
          users: { includeUsers: ['All'], excludeUsers: ['BreakGlass Admin'] },
        },
        grantControls: { builtInControls: ['block'] },
      },
      currentValue: { displayName: 'CA00 - Block legacy authentication', state: 'enabled' },
    },
    {
      standardName: 'AuditLog',
      standardLabel: 'Enable the Unified Audit Log',
      status: 'Compliant',
      category: 'Global Standards',
      stage: 'Default',
      expectedValue: { UnifiedAuditLogIngestionEnabled: true },
      currentValue: { UnifiedAuditLogIngestionEnabled: true },
    },
    // Drifted: what-if content with from -> to.
    {
      standardName: 'ConditionalAccessTemplate#abc123',
      standardLabel: 'CA01 - Require MFA for all users',
      status: 'Drift',
      category: 'Templates',
      stage: 'Default',
      expectedValue: {
        displayName: 'CA01 - Require MFA for all users',
        state: 'enabled',
        conditions: {
          clientAppTypes: ['exchangeActiveSync', 'other'],
          locations: { includeLocations: ['AllTrusted'] },
          users: {
            includeUsers: ['All'],
            excludeGroups: ['CA Exclusions', 'Service Accounts'],
          },
        },
        grantControls: { builtInControls: ['mfa'] },
      },
      currentValue: null,
    },
    {
      standardName: 'IntuneTemplate#9f9f9f',
      standardLabel: 'Windows - Baseline Security',
      status: 'Drift',
      category: 'Templates',
      stage: 'Default',
      expectedValue: { displayName: 'Windows - Baseline Security' },
      currentValue: null,
    },
    {
      standardName: 'SpamFilterNotify',
      standardLabel: 'Set outbound spam notification address',
      status: 'Drift',
      category: 'Exchange Standards',
      stage: 'Default',
      expectedValue: { NotifyOutboundSpamRecipients: 'security@contoso.com' },
      currentValue: { NotifyOutboundSpamRecipients: '' },
    },
    {
      standardName: 'SharingCapability',
      standardLabel: 'Set SharePoint sharing level',
      status: 'Drift',
      category: 'SharePoint Standards',
      stage: 'Default',
      expectedValue: { sharingCapability: 'ExternalUserSharingOnly' },
      currentValue: { sharingCapability: 'ExternalUserAndGuestSharing' },
    },
    // Reviewed and kept as-is.
    {
      standardName: 'PerUserMFA',
      standardLabel: 'Legacy per-user MFA cleanup',
      status: 'Accepted',
      category: 'Entra (AAD) Standards',
      stage: 'Default',
      deviationReason: 'Customer keeps per-user MFA until their migration completes in Q2.',
    },
    // Freshly assigned: no values at all yet. Both still apply in the future, so the
    // report resolves what they will enforce from the assigned baseline's configuration.
    {
      standardName: 'DisableSelfServiceLicenses',
      standardLabel: 'Disable Self Service Licensing',
      status: 'No Data',
      category: 'Entra (AAD) Standards',
      stage: 'Default',
      templateId: 'tpl-1',
      expectedValue: null,
      currentValue: null,
    },
    {
      standardName: 'ConditionalAccessTemplate#pend1',
      standardLabel: 'CA05 - Require MFA for admins',
      status: 'No Data',
      category: 'Templates',
      stage: 'Default',
      templateId: 'tpl-1',
      // A No Data policy row's expectedValue is the RAW token render: displayName is
      // still the template file id because the prepare hook never ran. The report must
      // never show this - the stored template resolves the real name and content.
      expectedValue: {
        displayName: 'guid-ca-pend.CATemplate.json',
        state: 'enabledForReportingButNotEnforced',
      },
      currentValue: null,
    },
  ],
}

// The assigned baseline's saved configuration, as ListBaselines returns it - the source
// of what a No Data standard will enforce once its first check completes.
const assignedTemplates = [
  {
    GUID: 'tpl-1',
    templateName: 'Baseline',
    stages: [
      {
        name: 'Default',
        standards: ['DisableSelfServiceLicenses', 'ConditionalAccessTemplate#pend1'],
        standardsConfig: [
          {
            standard: 'DisableSelfServiceLicenses',
            instance: 'DisableSelfServiceLicenses',
            variables: {},
          },
          {
            standard: 'ConditionalAccessTemplate',
            instance: 'ConditionalAccessTemplate#pend1',
            // Legacy saves store option objects - unwrapValue must reach the GUID.
            variables: {
              caTemplate: { label: 'CA05 - Require MFA for admins', value: 'guid-ca-pend' },
              state: 'enabled',
            },
          },
        ],
      },
    ],
  },
]

const stageStates = [
  {
    templateId: 'tpl-1',
    templateName: 'Baseline',
    currentStage: 1,
    totalStages: 2,
    stageName: 'Default',
    nextStageName: 'Stage 2',
    estimatedAdvanceAt: 1790367405,
    manualAdvance: true,
    nextStage: {
      name: 'Stage 2',
      standards: ['IntuneTemplate#stage2'],
      conditions: [{ type: 'time', days: 7, unit: 'days' }, { type: 'manual' }],
      logic: 'or',
    },
  },
]

const baseProps = {
  tenant,
  stageStates,
  assignedTemplates,
  simulatedTemplates: [],
  catalogByName: Object.fromEntries(catalog.map((standard) => [standard.name, standard])),
  resolvers: {
    caByGuid: {
      'guid-ca-pend': {
        displayName: 'CA05 - Require MFA for admins',
        state: 'enabled',
        conditions: {
          users: {
            includeRoles: ['Global Administrator', 'Security Administrator'],
            excludeUsers: ['BreakGlass Admin'],
          },
        },
        grantControls: { builtInControls: ['mfa'] },
      },
    },
    intuneByGuid: {},
  },
  brandingSettings: {},
  variables: {},
  generatedOn: 'January 1, 2026',
}

describe('WhatIfReportDocument', () => {
  it('renders the full story - aligned, drifting, pending and excepted - to a PDF', async () => {
    const blob = await renderToBlob(<WhatIfReportDocument {...baseProps} />)

    expect(blob.size).toBeGreaterThan(1000)

    // For eyeballing the layout locally: WHATIF_PDF_OUT=path renders the fixture to a file.
    if (process.env.WHATIF_PDF_OUT) {
      writeFileSync(process.env.WHATIF_PDF_OUT, Buffer.from(await blob.arrayBuffer()))
    }
  }, 30000)

  it('renders a freshly-assigned tenant where every row is still No Data', async () => {
    const blob = await renderToBlob(
      <WhatIfReportDocument
        {...baseProps}
        tenant={{
          ...tenant,
          rows: tenant.rows.map((row) => ({
            ...row,
            status: 'No Data',
            expectedValue: null,
            currentValue: null,
          })),
        }}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders with the aligned and stage sections toggled off', async () => {
    const blob = await renderToBlob(
      <WhatIfReportDocument
        {...baseProps}
        sectionConfig={{ alreadyAligned: false, rolloutStages: false }}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders simulated baselines, resolving CA and Intune template GUIDs to their content', async () => {
    const simulatedTemplate = {
      templateName: 'Zero Trust',
      stages: [
        {
          name: 'Default',
          standards: [
            'ConditionalAccessTemplate#sim1',
            'IntuneTemplate#sim2',
            'SharingCapability',
          ],
          standardsConfig: [
            {
              standard: 'ConditionalAccessTemplate',
              instance: 'ConditionalAccessTemplate#sim1',
              variables: { caTemplate: 'guid-ca', state: 'enabled' },
            },
            {
              standard: 'IntuneTemplate',
              instance: 'IntuneTemplate#sim2',
              variables: { intuneTemplate: 'guid-intune' },
            },
            {
              standard: 'SharingCapability',
              instance: 'SharingCapability',
              variables: { Level: 'ExternalUserSharingOnly' },
            },
          ],
        },
      ],
    }
    const resolvers = {
      caByGuid: {
        'guid-ca': {
          displayName: 'CA10 - Require phishing-resistant MFA for admins',
          state: 'enabled',
          conditions: {},
          grantControls: {
            authenticationStrength: { displayName: 'Phishing-resistant MFA' },
          },
        },
      },
      intuneByGuid: { 'guid-intune': { displayName: 'Windows - BitLocker' } },
    }

    const secondTemplate = {
      templateName: 'Device Hardening',
      stages: [
        {
          name: 'Default',
          standards: ['IntuneTemplate#sim3'],
          standardsConfig: [
            {
              standard: 'IntuneTemplate',
              instance: 'IntuneTemplate#sim3',
              variables: { intuneTemplate: 'guid-intune' },
            },
          ],
        },
      ],
    }

    const blob = await renderToBlob(
      <WhatIfReportDocument
        {...baseProps}
        tenant={{ ...tenant, rows: tenant.rows.filter((row) => !row.standardName.includes('SharingCapability')) }}
        simulatedTemplates={[simulatedTemplate, secondTemplate]}
        resolvers={resolvers}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)
})

describe('describeStageConditions', () => {
  it('joins conditions with the stage logic', () => {
    expect(
      describeStageConditions({
        conditions: [{ type: 'time', days: 7, unit: 'days' }, { type: 'manual' }],
        logic: 'or',
      })
    ).toBe('7 days in the previous stage OR manual approval by an operator')
  })
})
