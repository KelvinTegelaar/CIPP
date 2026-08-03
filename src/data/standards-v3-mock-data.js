// Standards V3 mockup data. Every page under /tenant/standards-v3 renders from this module
// instead of the (not yet built) /api/standards/* endpoints, so the UX can be reviewed
// without a backend. The row shapes mirror StandardsV3Resolved / StandardsV3History /
// StandardsV3 deltas from the V3 design doc.

export const standardsV3Tenants = [
  {
    tenantId: 'contoso.onmicrosoft.com',
    displayName: 'Contoso Ltd',
    group: 'Gold Clients',
  },
  {
    tenantId: 'fabrikam.onmicrosoft.com',
    displayName: 'Fabrikam Inc',
    group: 'Gold Clients',
  },
  {
    tenantId: 'northwind.onmicrosoft.com',
    displayName: 'Northwind Traders',
    group: 'Gold Clients',
  },
  {
    tenantId: 'adventure-works.onmicrosoft.com',
    displayName: 'Adventure Works',
    group: 'Silver Clients',
  },
  {
    tenantId: 'tailspintoys.onmicrosoft.com',
    displayName: 'Tailspin Toys',
    group: 'Silver Clients',
  },
  {
    tenantId: 'wingtip.onmicrosoft.com',
    displayName: 'Wingtip Toys',
    group: 'Silver Clients',
  },
  {
    tenantId: 'proseware.onmicrosoft.com',
    displayName: 'Proseware',
    group: 'Bronze Clients',
  },
  {
    tenantId: 'litware.onmicrosoft.com',
    displayName: 'Litware Inc',
    group: 'Bronze Clients',
  },
  {
    tenantId: 'woodgrove.onmicrosoft.com',
    displayName: 'Woodgrove Bank',
    group: 'Bronze Clients',
  },
  {
    tenantId: 'lamna.onmicrosoft.com',
    displayName: 'Lamna Healthcare',
    group: 'Bronze Clients',
  },
]

// Standards catalog slice — name/label/cat/impact match the real standards catalog; expected and
// drifted values are representative of what the resolved store would hold. The V3 definition
// metadata (variables / %var% expected templates, §5 of the design doc) is merged in below.
const baseStandardsCatalog = [
  {
    name: 'AuditLog',
    label: 'Enable the Unified Audit Log',
    cat: 'Global Standards',
    impact: 'Low Impact',
    secureScoreImpact: 10,
    expectedValue: { UnifiedAuditLogIngestionEnabled: true },
    driftedValue: { UnifiedAuditLogIngestionEnabled: false },
  },
  {
    name: 'BlockMsolPowerShell',
    label: 'Block MSOL PowerShell Access',
    cat: 'Entra (AAD) Standards',
    impact: 'Medium Impact',
    secureScoreImpact: 0,
    expectedValue: { blockMsolPowerShell: true },
    driftedValue: { blockMsolPowerShell: false },
  },
  {
    name: 'RestrictUserAppCreation',
    label: 'Restrict users from creating App Registrations',
    cat: 'Entra (AAD) Standards',
    impact: 'Medium Impact',
    secureScoreImpact: 5,
    expectedValue: { allowedToCreateApps: false },
    driftedValue: { allowedToCreateApps: true },
  },
  {
    name: 'ActivityBasedTimeout',
    label: 'Enable Activity based Timeout',
    cat: 'Global Standards',
    impact: 'Low Impact',
    secureScoreImpact: 5,
    expectedValue: { timeout: '01:00:00' },
    driftedValue: { timeout: null },
  },
  {
    name: 'PasswordExpireDisabled',
    label: 'Do not expire passwords',
    cat: 'Entra (AAD) Standards',
    impact: 'Low Impact',
    secureScoreImpact: 10,
    expectedValue: { passwordValidityPeriodInDays: 2147483647 },
    driftedValue: { passwordValidityPeriodInDays: 90 },
  },
  {
    name: 'OauthConsent',
    label: 'Require admin consent for applications',
    cat: 'Entra (AAD) Standards',
    impact: 'Medium Impact',
    secureScoreImpact: 15,
    expectedValue: { permissionGrantPolicyIdsAssignedToDefaultUserRole: [] },
    driftedValue: {
      permissionGrantPolicyIdsAssignedToDefaultUserRole: [
        'ManagePermissionGrantsForSelf.microsoft-user-default-legacy',
      ],
    },
  },
  {
    name: 'SecurityDefaults',
    label: 'Enable Security Defaults',
    cat: 'Entra (AAD) Standards',
    impact: 'High Impact',
    secureScoreImpact: 20,
    expectedValue: { isEnabled: true },
    driftedValue: { isEnabled: false },
  },
  {
    name: 'AntiPhishPolicy',
    label: 'Default Anti-Phishing Policy',
    cat: 'Defender Standards',
    impact: 'Low Impact',
    secureScoreImpact: 15,
    expectedValue: {
      Enabled: true,
      PhishThresholdLevel: 3,
      EnableMailboxIntelligence: true,
    },
    driftedValue: {
      Enabled: true,
      PhishThresholdLevel: 1,
      EnableMailboxIntelligence: false,
    },
  },
  {
    name: 'SafeLinksPolicy',
    label: 'Default Safe Links Policy',
    cat: 'Defender Standards',
    impact: 'Low Impact',
    secureScoreImpact: 15,
    expectedValue: {
      EnableSafeLinksForEmail: true,
      TrackClicks: true,
      AllowClickThrough: false,
    },
    driftedValue: {
      EnableSafeLinksForEmail: true,
      TrackClicks: false,
      AllowClickThrough: true,
    },
  },
  {
    name: 'DisableBasicAuthSMTP',
    label: 'Disable SMTP Basic Authentication',
    cat: 'Exchange Standards',
    impact: 'Medium Impact',
    secureScoreImpact: 10,
    expectedValue: { SmtpClientAuthenticationDisabled: true },
    driftedValue: { SmtpClientAuthenticationDisabled: false },
  },
  {
    name: 'SpoofWarn',
    label: 'Enable external sender warnings',
    cat: 'Exchange Standards',
    impact: 'Low Impact',
    secureScoreImpact: 0,
    expectedValue: { ExternalInOutlook: true },
    driftedValue: { ExternalInOutlook: false },
  },
  {
    name: 'sharingCapability',
    label: 'Set SharePoint sharing level',
    cat: 'SharePoint Standards',
    impact: 'High Impact',
    secureScoreImpact: 10,
    expectedValue: { sharingCapability: 'ExternalUserSharingOnly' },
    driftedValue: { sharingCapability: 'ExternalUserAndGuestSharing' },
  },
  {
    name: 'intuneDeviceRetirementDays',
    label: 'Set Intune device retirement window',
    cat: 'Intune Standards',
    impact: 'Low Impact',
    secureScoreImpact: 0,
    expectedValue: { DeviceInactivityBeforeRetirementInDay: 90 },
    driftedValue: { DeviceInactivityBeforeRetirementInDay: 30 },
  },
  {
    name: 'ConditionalAccessTemplate',
    label: 'Deploy CA policy: Require MFA for all users',
    cat: 'Templates',
    impact: 'High Impact',
    secureScoreImpact: 30,
    expectedValue: {
      displayName: 'CIPP - Require MFA for all users',
      state: 'enabled',
    },
    driftedValue: {
      displayName: 'CIPP - Require MFA for all users',
      state: 'enabledForReportingButNotEnforced',
    },
  },
  {
    name: 'EnableCustomerLockbox',
    label: 'Enable Customer Lockbox',
    cat: 'Exchange Standards',
    impact: 'Low Impact',
    secureScoreImpact: 5,
    expectedValue: { CustomerLockBoxEnabled: true },
    driftedValue: { CustomerLockBoxEnabled: false },
  },
  {
    name: 'ManualTask',
    label: 'Manual task for an operator',
    cat: 'Manual Tasks',
    impact: 'Low Impact',
    secureScoreImpact: 0,
    expectedValue: { completed: true },
    driftedValue: { completed: false },
  },
]

// V3 definition metadata slice per §5 of the design doc: what /api/standards/definitions serves.
// `variables` define the configurable options (the form fields); `expected` is the template the
// engine renders from the variable values via %var% tokens; `recommended` powers 'recommended
// mode' and pre-fills the field. `locked: true` marks a setting the definition enforces — it is
// shown but cannot be changed (e.g. the audit log can only ever be enabled, never disabled).
const definitionSlices = {
  AuditLog: {
    tag: ['CIS M365 7.0.0 (3.1.1)'],
    helpText:
      'Enables Unified Audit Log ingestion so activity across Exchange, SharePoint, Entra and Teams is recorded and searchable.',
    executiveText:
      'Keeps a tamper-evident record of who did what in your Microsoft 365 environment, which is essential for investigations and compliance.',
    recommendedBy: ['CIS', 'CIPP'],
    requiredCapabilities: ['EXCHANGE_S_STANDARD', 'EXCHANGE_S_ENTERPRISE'],
    compare: 'subset',
    variables: {
      enabled: {
        type: 'switch',
        label: 'Audit log ingestion enabled',
        default: true,
        recommended: true,
        locked: true,
      },
    },
    expected: { UnifiedAuditLogIngestionEnabled: '%enabled%' },
  },
  BlockMsolPowerShell: {
    tag: ['LowImpact'],
    helpText:
      'Blocks the legacy MSOnline PowerShell module from being used against the tenant. Attackers use it for reconnaissance.',
    executiveText:
      'Closes off an outdated management tool that is frequently abused by attackers to map out your environment.',
    recommendedBy: ['CIPP'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {
      block: {
        type: 'switch',
        label: 'Block MSOL PowerShell access',
        default: true,
        recommended: true,
      },
    },
    expected: { blockMsolPowerShell: '%block%' },
  },
  RestrictUserAppCreation: {
    tag: ['CIS M365 7.0.0 (5.1.2)'],
    helpText:
      'Controls whether non-admin users can create app registrations in Entra ID.',
    executiveText:
      'Prevents staff from accidentally granting third-party apps access to company data without review.',
    recommendedBy: ['CIS'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {
      allowAppCreation: {
        type: 'switch',
        label: 'Allow users to create app registrations',
        default: false,
        recommended: false,
      },
    },
    expected: { allowedToCreateApps: '%allowAppCreation%' },
  },
  ActivityBasedTimeout: {
    tag: ['CIS M365 7.0.0 (1.3.2)'],
    helpText:
      'Signs users out of Microsoft 365 web sessions after a period of inactivity.',
    executiveText:
      'Automatically signs out idle sessions on shared or unattended devices.',
    recommendedBy: ['CIS'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {
      timeout: {
        type: 'autoComplete',
        label: 'Idle session timeout',
        options: [
          { label: '1 hour', value: '01:00:00' },
          { label: '2 hours', value: '02:00:00' },
          { label: '4 hours', value: '04:00:00' },
          { label: '6 hours', value: '06:00:00' },
        ],
        default: '01:00:00',
        recommended: '01:00:00',
      },
    },
    expected: { timeout: '%timeout%' },
  },
  PasswordExpireDisabled: {
    tag: ['CIS M365 7.0.0 (1.3.1)'],
    helpText:
      'Sets passwords to never expire, per current NIST and Microsoft guidance. Forced rotation encourages weaker passwords.',
    executiveText:
      'Follows modern security guidance: strong passwords that never expire outperform frequently rotated weak ones.',
    recommendedBy: ['CIS', 'Microsoft'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {},
    expected: { passwordValidityPeriodInDays: 2147483647 },
  },
  OauthConsent: {
    tag: ['CIS M365 7.0.0 (5.3.1)'],
    helpText:
      'Requires admin consent before applications can access company data, with an optional allow-list of pre-approved application IDs.',
    executiveText:
      'Stops staff from unknowingly authorising rogue applications; every new app needs IT sign-off.',
    recommendedBy: ['CIS', 'CIPP'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {
      allowedApps: {
        type: 'textField',
        label: 'Pre-approved application IDs (comma separated)',
        default: '',
      },
    },
    expected: {
      permissionGrantPolicyIdsAssignedToDefaultUserRole: [],
      preApprovedApplications: '%allowedApps%',
    },
  },
  SecurityDefaults: {
    tag: ['HighImpact'],
    helpText:
      'Enables Entra Security Defaults. Do not combine with Conditional Access policies - use one or the other.',
    executiveText:
      'Turns on the Microsoft-recommended security floor (MFA for everyone, legacy sign-in blocked) for tenants without custom policies.',
    recommendedBy: ['Microsoft'],
    requiredCapabilities: [],
    compare: 'subset',
    variables: {
      enabled: {
        type: 'switch',
        label: 'Security Defaults enabled',
        default: true,
        recommended: true,
      },
    },
    expected: { isEnabled: '%enabled%' },
  },
  AntiPhishPolicy: {
    tag: ['CIS M365 7.0.0 (2.1.7)'],
    helpText:
      'Configures the default anti-phishing policy: threshold level, mailbox intelligence, and impersonation protection.',
    executiveText:
      'Strengthens the filters that catch emails pretending to be from your executives or partners.',
    recommendedBy: ['CIS'],
    requiredCapabilities: ['ATP_ENTERPRISE'],
    compare: 'subset',
    variables: {
      enabled: {
        type: 'switch',
        label: 'Policy enabled',
        default: true,
        recommended: true,
      },
      phishThresholdLevel: {
        type: 'autoComplete',
        label: 'Phishing threshold level',
        options: [
          { label: '1 - Standard', value: 1 },
          { label: '2 - Aggressive', value: 2 },
          { label: '3 - More aggressive', value: 3 },
          { label: '4 - Most aggressive', value: 4 },
        ],
        default: 3,
        recommended: 3,
      },
      enableMailboxIntelligence: {
        type: 'switch',
        label: 'Enable mailbox intelligence',
        default: true,
        recommended: true,
      },
    },
    expected: {
      Enabled: '%enabled%',
      PhishThresholdLevel: '%phishThresholdLevel%',
      EnableMailboxIntelligence: '%enableMailboxIntelligence%',
    },
  },
  SafeLinksPolicy: {
    tag: ['CIS M365 7.0.0 (2.1.1)'],
    helpText:
      'Configures the default Safe Links policy: URL rewriting and click tracking for email, Teams, and Office apps.',
    executiveText:
      'Checks every link your staff clicks against Microsoft threat intelligence, even after the email was delivered.',
    recommendedBy: ['CIS'],
    requiredCapabilities: ['ATP_ENTERPRISE'],
    compare: 'subset',
    variables: {
      enableForEmail: {
        type: 'switch',
        label: 'Enable Safe Links for email',
        default: true,
        recommended: true,
      },
      trackClicks: {
        type: 'switch',
        label: 'Track user clicks',
        default: true,
        recommended: true,
      },
      allowClickThrough: {
        type: 'switch',
        label: 'Allow users to click through to the original URL',
        default: false,
        recommended: false,
      },
    },
    expected: {
      EnableSafeLinksForEmail: '%enableForEmail%',
      TrackClicks: '%trackClicks%',
      AllowClickThrough: '%allowClickThrough%',
    },
  },
  DisableBasicAuthSMTP: {
    tag: ['CIS M365 7.0.0 (6.5.4)'],
    helpText:
      'Disables SMTP AUTH tenant-wide. Legacy devices that submit mail with basic authentication will stop working.',
    executiveText:
      'Blocks an outdated email sign-in method that bypasses MFA. Old scanners or printers may need reconfiguration.',
    recommendedBy: ['CIS', 'Microsoft'],
    requiredCapabilities: ['EXCHANGE_S_STANDARD', 'EXCHANGE_S_ENTERPRISE'],
    compare: 'subset',
    variables: {
      disabled: {
        type: 'switch',
        label: 'SMTP basic authentication disabled',
        default: true,
        recommended: true,
      },
    },
    expected: { SmtpClientAuthenticationDisabled: '%disabled%' },
  },
  SpoofWarn: {
    tag: ['LowImpact'],
    helpText:
      'Adds the external sender warning to messages arriving from outside the organisation.',
    executiveText:
      'Flags emails from outside the company so staff pause before trusting them.',
    recommendedBy: ['CIPP'],
    requiredCapabilities: ['EXCHANGE_S_STANDARD', 'EXCHANGE_S_ENTERPRISE'],
    compare: 'subset',
    variables: {
      enabled: {
        type: 'switch',
        label: 'External sender warnings enabled',
        default: true,
        recommended: true,
      },
    },
    expected: { ExternalInOutlook: '%enabled%' },
  },
  sharingCapability: {
    tag: ['CIS M365 7.0.0 (7.2.3)'],
    helpText:
      'Sets the tenant-wide SharePoint and OneDrive external sharing level.',
    executiveText:
      'Controls how far documents can be shared outside the company.',
    recommendedBy: ['CIS'],
    requiredCapabilities: ['SHAREPOINTENTERPRISE', 'SHAREPOINTSTANDARD'],
    compare: 'subset',
    variables: {
      level: {
        type: 'autoComplete',
        label: 'Sharing level',
        options: [
          { label: 'Only people in your organization', value: 'Disabled' },
          {
            label: 'Existing guests only',
            value: 'ExistingExternalUserSharingOnly',
          },
          {
            label: 'New and existing guests',
            value: 'ExternalUserSharingOnly',
          },
          {
            label: 'Anyone (including anonymous links)',
            value: 'ExternalUserAndGuestSharing',
          },
        ],
        default: 'ExternalUserSharingOnly',
        recommended: 'ExternalUserSharingOnly',
      },
    },
    expected: { sharingCapability: '%level%' },
  },
  intuneDeviceRetirementDays: {
    tag: ['LowImpact'],
    helpText:
      'Configures the Intune device cleanup rule to retire devices after a period of inactivity.',
    executiveText:
      'Keeps the device inventory clean by retiring machines that have not checked in.',
    recommendedBy: ['CIPP'],
    requiredCapabilities: ['INTUNE_A'],
    compare: 'subset',
    variables: {
      days: {
        type: 'number',
        label: 'Days of inactivity before retirement',
        default: 90,
        recommended: 90,
      },
    },
    expected: { DeviceInactivityBeforeRetirementInDay: '%days%' },
  },
  ConditionalAccessTemplate: {
    tag: ['HighImpact'],
    multiple: true,
    helpText:
      'Deploys a Conditional Access policy from a CA template. Deploy in report-only first, then enforce via a later stage.',
    executiveText:
      'Requires a second factor to sign in. The single most effective control against account takeover.',
    recommendedBy: ['CIS', 'Microsoft', 'CIPP'],
    requiredCapabilities: ['AAD_PREMIUM'],
    compare: 'subset',
    variables: {
      caTemplate: {
        type: 'autoComplete',
        label: 'CA template',
        options: [
          {
            label: 'CIPP - Require MFA for all users',
            value: 'CIPP - Require MFA for all users',
          },
          {
            label: 'CIPP - Block legacy authentication',
            value: 'CIPP - Block legacy authentication',
          },
          {
            label: 'CIPP - Require compliant device for admins',
            value: 'CIPP - Require compliant device for admins',
          },
        ],
        default: 'CIPP - Require MFA for all users',
      },
      state: {
        type: 'autoComplete',
        label: 'Policy state',
        options: [
          { label: 'Report only', value: 'enabledForReportingButNotEnforced' },
          { label: 'Enabled', value: 'enabled' },
          { label: 'Disabled', value: 'disabled' },
        ],
        default: 'enabledForReportingButNotEnforced',
        recommended: 'enabled',
      },
    },
    expected: { displayName: '%caTemplate%', state: '%state%' },
  },
  ManualTask: {
    tag: ['Manual'],
    helpText:
      'Describes an action an operator must perform by hand. CIPP raises a deviation on the configured recurrence until the task is marked complete, so manual work shows up in the same alignment view as automated standards.',
    executiveText:
      'A recurring operational task performed by an engineer, tracked and evidenced alongside the automated controls.',
    recommendedBy: ['CIPP'],
    requiredCapabilities: [],
    compare: 'subset',
    multiple: true,
    variables: {
      instructions: {
        type: 'textField',
        label: 'Instructions for the operator',
        default: '',
      },
      recurrence: {
        type: 'autoComplete',
        label: 'Raise a deviation every',
        options: [
          { label: 'Week', value: 'weekly' },
          { label: 'Month', value: 'monthly' },
          { label: 'Quarter', value: 'quarterly' },
        ],
        default: 'monthly',
      },
    },
    expected: {
      completed: true,
      instructions: '%instructions%',
      recurrence: '%recurrence%',
    },
  },
  EnableCustomerLockbox: {
    tag: ['CIS M365 7.0.0 (1.3.6)'],
    helpText:
      'Requires Microsoft to request approval before accessing tenant content during support operations.',
    executiveText:
      'Microsoft engineers need your explicit approval before they can touch your data during a support case.',
    recommendedBy: ['CIS'],
    requiredCapabilities: ['LOCKBOX_ENTERPRISE'],
    compare: 'subset',
    variables: {
      enabled: {
        type: 'switch',
        label: 'Customer Lockbox enabled',
        default: true,
        recommended: true,
      },
    },
    expected: { CustomerLockBoxEnabled: '%enabled%' },
  },
}

export const standardsV3Catalog = baseStandardsCatalog.map((entry) => ({
  ...entry,
  ...definitionSlices[entry.name],
}))

// Per-tenant exceptions to "everything compliant". Any (tenant, standard) pair not listed here
// resolves to a Compliant row. This keeps the fleet realistic without hand-writing 140 rows.
const tenantExceptions = {
  'contoso.onmicrosoft.com': {
    accepted: {
      SecurityDefaults: {
        reason: 'Tenant uses Conditional Access instead of Security Defaults',
        by: 'kelvin@cyberdrain.com',
        at: '2026-07-12T09:14:00Z',
        expires: null,
      },
    },
  },
  'fabrikam.onmicrosoft.com': {
    detected: ['SafeLinksPolicy'],
    pendingVerification: ['DisableBasicAuthSMTP'],
    // Sub-object acceptance: one drifted property is accepted, the standard stays
    // Detected because other properties still drift.
    acceptedPaths: {
      SafeLinksPolicy: {
        AllowClickThrough: {
          reason: 'Legal team requires click-through for records requests',
          by: 'kelvin@cyberdrain.com',
          at: '2026-07-29T11:20:00Z',
        },
      },
    },
  },
  'northwind.onmicrosoft.com': {},
  'adventure-works.onmicrosoft.com': {
    detected: ['OauthConsent', 'sharingCapability'],
    accepted: {
      PasswordExpireDisabled: {
        reason: 'Compliance framework requires 90-day rotation',
        by: 'helpdesk@cyberdrain.com',
        at: '2026-06-02T13:40:00Z',
        expires: '2026-09-01T00:00:00Z',
        remediateOnExpire: true,
      },
    },
  },
  'tailspintoys.onmicrosoft.com': {
    detected: ['AuditLog'],
    licenseMissing: ['SafeLinksPolicy', 'AntiPhishPolicy'],
  },
  'wingtip.onmicrosoft.com': {
    suppressed: {
      SpoofWarn: {
        reason: 'Migration in progress, revisit after cutover',
        by: 'kelvin@cyberdrain.com',
        at: '2026-07-28T16:05:00Z',
        expires: '2026-08-15T00:00:00Z',
      },
    },
  },
  'proseware.onmicrosoft.com': {
    detected: ['ConditionalAccessTemplate', 'RestrictUserAppCreation'],
    licenseMissing: ['intuneDeviceRetirementDays'],
  },
  'litware.onmicrosoft.com': {
    detected: ['AntiPhishPolicy'],
    remediated: ['BlockMsolPowerShell'],
  },
  'woodgrove.onmicrosoft.com': {
    accepted: {
      sharingCapability: {
        reason: 'Customer contractually shares documents with guest users',
        by: 'kelvin@cyberdrain.com',
        at: '2026-05-19T10:22:00Z',
        expires: null,
      },
    },
    licenseMissing: ['ConditionalAccessTemplate'],
  },
  'lamna.onmicrosoft.com': {
    detected: [
      'SecurityDefaults',
      'OauthConsent',
      'DisableBasicAuthSMTP',
      'ManualTask',
    ],
    suppressed: {
      ActivityBasedTimeout: {
        reason: 'Kiosk devices break on forced timeout',
        by: 'helpdesk@cyberdrain.com',
        at: '2026-07-30T08:50:00Z',
        expires: null,
      },
    },
  },
}

const templateId = 'a1b2c3d4-0000-4v3d-9000-baseline0001'
const lastRun = '2026-08-03T06:00:00Z'

// Scope-tier overrides (§4.1 deltas): presence at a narrower scope fully replaces the value
// inherited from the wider scope. allTenants < group < tenant.
// When more than one template configures the same standard, the template with the most
// specific assignment wins wholesale. Assignment lives on the template (AllTenants, tenant
// groups, or individual tenants) — there is no separate scope hierarchy.
export const standardsV3Overrides = [
  {
    standardName: 'sharingCapability',
    templateName: 'CIS Microsoft 365 Foundations v7 - Level 1',
    assignedTo: 'Gold Clients, Silver Clients',
    appliesToGroups: ['Gold Clients', 'Silver Clients'],
    excludedTenants: ['wingtip.onmicrosoft.com'],
    expectedValue: { sharingCapability: 'ExistingExternalUserSharingOnly' },
  },
  {
    standardName: 'intuneDeviceRetirementDays',
    templateName: 'Woodgrove Bank - Customer Specific',
    assignedTo: 'Woodgrove Bank',
    appliesToTenants: ['woodgrove.onmicrosoft.com'],
    expectedValue: { DeviceInactivityBeforeRetirementInDay: 30 },
  },
  // A tenant override created from the alignment page: wins over both the baseline and the
  // group-assigned CIS L1 template, giving Contoso a three-tier inheritance chain.
  {
    standardName: 'sharingCapability',
    templateName: 'Tenant Override',
    assignedTo: 'Contoso Ltd',
    appliesToTenants: ['contoso.onmicrosoft.com'],
    expectedValue: { sharingCapability: 'Disabled' },
  },
]

const buildResolvedRows = () => {
  const rows = []
  standardsV3Tenants.forEach((tenant) => {
    const exceptions = tenantExceptions[tenant.tenantId] ?? {}
    standardsV3Catalog.forEach((standard) => {
      const accepted = exceptions.accepted?.[standard.name]
      const suppressed = exceptions.suppressed?.[standard.name]
      const detected = exceptions.detected?.includes(standard.name)
      const licenseMissing = exceptions.licenseMissing?.includes(standard.name)
      const remediated = exceptions.remediated?.includes(standard.name)
      const pendingVerification = exceptions.pendingVerification?.includes(
        standard.name
      )

      // Resolve which templates configure this (tenant, standard). The baseline applies to
      // everyone; templates with a more specific assignment override it wholesale.
      const inheritance = [
        {
          templateName: 'CyberDrain Baseline',
          assignedTo: 'All Tenants',
          value: standard.expectedValue,
        },
      ]
      standardsV3Overrides
        .filter((override) => override.standardName === standard.name)
        .filter(
          (override) =>
            (override.appliesToGroups?.includes(tenant.group) ||
              override.appliesToTenants?.includes(tenant.tenantId)) &&
            !override.excludedTenants?.includes(tenant.tenantId)
        )
        .sort(
          (a, b) => (a.appliesToTenants ? 1 : 0) - (b.appliesToTenants ? 1 : 0)
        )
        .forEach((override) =>
          inheritance.push({
            templateName: override.templateName,
            assignedTo: override.assignedTo,
            value: override.expectedValue,
          })
        )
      const effective = inheritance[inheritance.length - 1]
      const inheritanceChain = inheritance.map((tier) => ({
        ...tier,
        effective: tier === effective,
      }))

      const compliant = !detected && !suppressed && !licenseMissing && !accepted
      const deviation = accepted ?? suppressed
      rows.push({
        tenantFilter: tenant.tenantId,
        tenantName: tenant.displayName,
        tenantGroup: tenant.group,
        standardName: standard.name,
        standardLabel: standard.label,
        category: standard.cat,
        impact: standard.impact,
        secureScoreImpact: standard.secureScoreImpact,
        templateId,
        expectedValue: effective.value,
        currentValue:
          compliant || remediated || pendingVerification
            ? effective.value
            : standard.driftedValue,
        compliant: compliant || remediated || pendingVerification,
        pendingVerification: !!pendingVerification,
        licenseAvailable: !licenseMissing,
        sourceTemplate: effective.templateName,
        inheritance: inheritanceChain,
        acceptedPaths: exceptions.acceptedPaths?.[standard.name] ?? {},
        deviationState: licenseMissing
          ? 'License Missing'
          : accepted
            ? 'Accepted'
            : suppressed
              ? 'Suppressed'
              : detected
                ? 'Detected'
                : 'Compliant',
        deviationReason: deviation?.reason ?? null,
        deviationBy: deviation?.by ?? null,
        deviationAt: deviation?.at ?? null,
        deviationExpires: deviation?.expires ?? null,
        remediateOnExpire: deviation?.remediateOnExpire ?? false,
        lastRun,
        lastRemediated: remediated
          ? lastRun
          : pendingVerification
            ? lastRun
            : null,
        lastOutcome: licenseMissing
          ? 'Skipped-License'
          : remediated || pendingVerification
            ? 'Remediated'
            : detected
              ? 'Drifted'
              : 'Compliant',
      })
    })
  })
  return rows
}

export const standardsV3Resolved = buildResolvedRows()

// Scoring per §9 of the design doc: applicable = total - licenseMissing;
// verified = compliant / applicable; aligned = (compliant + accepted) / applicable.
export const scoreRows = (rows) => {
  const total = rows.length
  const licenseMissing = rows.filter(
    (r) => r.deviationState === 'License Missing'
  ).length
  const applicable = total - licenseMissing
  const compliant = rows.filter((r) => r.deviationState === 'Compliant').length
  const accepted = rows.filter((r) => r.deviationState === 'Accepted').length
  const detected = rows.filter((r) => r.deviationState === 'Detected').length
  const suppressed = rows.filter(
    (r) => r.deviationState === 'Suppressed'
  ).length
  const pct = (count) =>
    applicable ? Math.round((count / applicable) * 100) : 0
  return {
    total,
    applicable,
    licenseMissing,
    compliant,
    accepted,
    detected,
    suppressed,
    verifiedPercentage: pct(compliant),
    alignedPercentage: pct(compliant + accepted),
    acceptedPercentage: pct(accepted),
  }
}

export const getTenantSummaries = () =>
  standardsV3Tenants.map((tenant) => {
    const rows = standardsV3Resolved.filter(
      (r) => r.tenantFilter === tenant.tenantId
    )
    return {
      ...tenant,
      tenantFilter: tenant.tenantId,
      ...scoreRows(rows),
      lastRun,
      rows,
    }
  })

export const getStandardAggregates = () =>
  standardsV3Catalog.map((standard) => {
    const rows = standardsV3Resolved.filter(
      (r) => r.standardName === standard.name
    )
    const scores = scoreRows(rows)
    return {
      standardName: standard.name,
      standardLabel: standard.label,
      category: standard.cat,
      impact: standard.impact,
      secureScoreImpact: standard.secureScoreImpact,
      totalTenants: scores.total,
      ...scores,
      rows,
    }
  })

export const getFleetScore = () => scoreRows(standardsV3Resolved)

// 30-day fleet trend, one point every other day. Ends at today's live score so the
// trend chart and the info bar agree.
export const standardsV3Trend = [
  { date: '2026-07-04', aligned: 74, verified: 68 },
  { date: '2026-07-06', aligned: 75, verified: 69 },
  { date: '2026-07-08', aligned: 77, verified: 70 },
  { date: '2026-07-10', aligned: 76, verified: 70 },
  { date: '2026-07-12', aligned: 79, verified: 71 },
  { date: '2026-07-14', aligned: 81, verified: 74 },
  { date: '2026-07-16', aligned: 81, verified: 75 },
  { date: '2026-07-18', aligned: 83, verified: 77 },
  { date: '2026-07-20', aligned: 84, verified: 78 },
  { date: '2026-07-22', aligned: 84, verified: 79 },
  { date: '2026-07-24', aligned: 86, verified: 81 },
  { date: '2026-07-26', aligned: 87, verified: 82 },
  { date: '2026-07-28', aligned: 88, verified: 83 },
  { date: '2026-07-30', aligned: 89, verified: 84 },
  { date: '2026-08-01', aligned: 90, verified: 85 },
  {
    date: '2026-08-03',
    aligned: getFleetScore().alignedPercentage,
    verified: getFleetScore().verifiedPercentage,
  },
]

// Run history for the offcanvas timeline (StandardsV3History, newest first).
export const standardsV3History = [
  {
    runId: 'f3b1c2d4-1111-4v3d-9000-run000000010',
    timestamp: '2026-08-03T06:00:00Z',
    mode: 'run',
    triggeredBy: 'schedule',
    outcome: 'Drifted',
    remediated: false,
    diff: { PhishThresholdLevel: { expected: 3, current: 1 } },
  },
  {
    runId: 'f3b1c2d4-1111-4v3d-9000-run000000009',
    timestamp: '2026-08-02T18:00:00Z',
    mode: 'run',
    triggeredBy: 'schedule',
    outcome: 'Compliant',
    remediated: false,
    diff: null,
  },
  {
    runId: 'f3b1c2d4-1111-4v3d-9000-run000000008',
    timestamp: '2026-08-02T06:00:00Z',
    mode: 'oneoff',
    triggeredBy: 'manual',
    outcome: 'Remediated',
    remediated: true,
    diff: { EnableMailboxIntelligence: { expected: true, current: false } },
  },
  {
    runId: 'f3b1c2d4-1111-4v3d-9000-run000000007',
    timestamp: '2026-08-01T18:00:00Z',
    mode: 'compare',
    triggeredBy: 'api',
    outcome: 'Drifted',
    remediated: false,
    diff: { EnableMailboxIntelligence: { expected: true, current: false } },
  },
]

// Template catalog for the Template Overview page and the editor. A template is the unit users
// manage — it can bundle hundreds of standards/policies (CIS, OIB, ...) and carries its own
// stages and tenant assignment. Stage conditions: time / variable / success / manual, AND/OR.
// Mock stages reference the small mock catalog; standardsCount reflects the real content size.
const templateDefinitions = [
  {
    GUID: templateId,
    templateName: 'CyberDrain Baseline',
    description: 'Core hygiene baseline applied to every managed tenant',
    standardsCount: 14,
    assignedTenants: ['AllTenants'],
    excludedTenants: [],
    remediationPosture: 'Remediate',
    updatedAt: '2026-08-01T14:22:00Z',
    updatedBy: 'kelvin@cyberdrain.com',
    stages: [
      {
        name: 'Baseline',
        standards: [
          'AuditLog',
          'DisableBasicAuthSMTP',
          'AntiPhishPolicy',
          'SpoofWarn',
          'PasswordExpireDisabled',
          'ActivityBasedTimeout',
        ],
        conditions: [],
        logic: 'and',
      },
      {
        name: 'Hardening',
        standards: ['OauthConsent', 'sharingCapability', 'SafeLinksPolicy'],
        conditions: [{ type: 'time', days: 14 }],
        logic: 'and',
      },
      {
        name: 'Full enforcement',
        // Two instances of the CA template standard (multi-instance: '#n' suffix).
        standards: [
          'ConditionalAccessTemplate',
          'ConditionalAccessTemplate#1',
          'EnableCustomerLockbox',
        ],
        conditions: [
          {
            type: 'variable',
            variable: '%CustomerTier%',
            operator: 'eq',
            value: 'diamond',
          },
          { type: 'success' },
        ],
        logic: 'and',
      },
    ],
  },
  {
    GUID: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
    templateName: 'CIS Microsoft 365 Foundations v7 - Level 1',
    description: 'Full CIS L1 benchmark, staged from report-only to enforced',
    standardsCount: 142,
    assignedTenants: ['Gold Clients', 'Silver Clients'],
    excludedTenants: ['wingtip.onmicrosoft.com'],
    remediationPosture: 'Staged',
    updatedAt: '2026-07-28T09:10:00Z',
    updatedBy: 'kelvin@cyberdrain.com',
    stages: [
      {
        name: 'Report only',
        standards: [
          'AuditLog',
          'AntiPhishPolicy',
          'SafeLinksPolicy',
          'DisableBasicAuthSMTP',
          'RestrictUserAppCreation',
          'OauthConsent',
        ],
        conditions: [],
        logic: 'and',
      },
      {
        name: 'Enforce',
        standards: ['sharingCapability', 'ConditionalAccessTemplate'],
        conditions: [{ type: 'manual' }],
        logic: 'and',
      },
    ],
  },
  {
    GUID: 'c3d4e5f6-0000-4v3d-9000-cisl20000001',
    templateName: 'CIS Microsoft 365 Foundations v7 - Level 2',
    description: 'CIS L2 additions for high-security customers',
    standardsCount: 67,
    assignedTenants: ['Woodgrove Bank', 'Lamna Healthcare'],
    excludedTenants: [],
    remediationPosture: 'Report',
    updatedAt: '2026-07-15T16:45:00Z',
    updatedBy: 'helpdesk@cyberdrain.com',
    stages: [
      {
        name: 'Report only',
        standards: [
          'ActivityBasedTimeout',
          'EnableCustomerLockbox',
          'sharingCapability',
        ],
        conditions: [],
        logic: 'and',
      },
    ],
  },
  {
    GUID: 'd4e5f6a7-0000-4v3d-9000-oib000000001',
    templateName: 'OIB - Overheidsbrede Informatiebeveiliging',
    description:
      'Dutch government baseline (BIO-aligned) for public sector tenants',
    standardsCount: 204,
    assignedTenants: ['Lamna Healthcare'],
    excludedTenants: [],
    remediationPosture: 'Staged',
    updatedAt: '2026-07-30T11:05:00Z',
    updatedBy: 'kelvin@cyberdrain.com',
    stages: [
      {
        name: 'Inventory',
        standards: ['AuditLog', 'SpoofWarn', 'ManualTask'],
        conditions: [],
        logic: 'and',
      },
      {
        name: 'Report only',
        standards: [
          'AntiPhishPolicy',
          'SafeLinksPolicy',
          'DisableBasicAuthSMTP',
        ],
        conditions: [{ type: 'time', days: 30 }],
        logic: 'and',
      },
      {
        name: 'Enforce',
        standards: ['ConditionalAccessTemplate', 'SecurityDefaults'],
        conditions: [
          {
            type: 'variable',
            variable: '%ChangeWindowApproved%',
            operator: 'eq',
            value: 'true',
          },
          { type: 'success' },
        ],
        logic: 'and',
      },
    ],
  },
  {
    GUID: 'e5f6a7b8-0000-4v3d-9000-essential8-1',
    templateName: 'Essential Eight - Maturity Level 1',
    description: 'ACSC Essential Eight ML1 controls for AU customers',
    standardsCount: 88,
    assignedTenants: ['Adventure Works', 'Tailspin Toys'],
    excludedTenants: [],
    remediationPosture: 'Remediate',
    updatedAt: '2026-06-20T08:30:00Z',
    updatedBy: 'kelvin@cyberdrain.com',
    stages: [
      {
        name: 'Baseline',
        standards: [
          'BlockMsolPowerShell',
          'DisableBasicAuthSMTP',
          'ConditionalAccessTemplate',
          'PasswordExpireDisabled',
        ],
        conditions: [],
        logic: 'and',
      },
    ],
  },
  {
    GUID: 'f6a7b8c9-0000-4v3d-9000-woodgrove001',
    templateName: 'Woodgrove Bank - Customer Specific',
    description: 'Customer-specific settings agreed with Woodgrove Bank',
    standardsCount: 1,
    assignedTenants: ['Woodgrove Bank'],
    excludedTenants: [],
    remediationPosture: 'Remediate',
    updatedAt: '2026-07-21T10:00:00Z',
    updatedBy: 'kelvin@cyberdrain.com',
    stages: [
      {
        name: 'Customer specific',
        standards: ['intuneDeviceRetirementDays'],
        conditions: [],
        logic: 'and',
      },
    ],
  },
]

export const standardsV3Templates = templateDefinitions.map((template) => ({
  ...template,
  stageNames: template.stages.map((stage) => stage.name),
}))

// Tenant custom variables available to variable-based stage graduation rules.
export const standardsV3Variables = [
  '%RolloutRing%',
  '%CustomerTier%',
  '%ChangeWindowApproved%',
  '%GoLiveDate%',
  '%ManagedServicesLevel%',
]

// Per-tenant rollout state (StandardsV3RolloutState, §12): which stage of each assigned
// template the tenant currently sits in. currentStage is 1-based.
export const standardsV3StageStates = {
  'contoso.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 3,
      enteredStageAt: '2026-07-18T06:00:00Z',
    },
    {
      templateId: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
      currentStage: 1,
      enteredStageAt: '2026-07-28T09:30:00Z',
    },
  ],
  'fabrikam.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 2,
      enteredStageAt: '2026-07-25T06:00:00Z',
    },
    {
      templateId: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
      currentStage: 1,
      enteredStageAt: '2026-07-28T09:30:00Z',
    },
  ],
  'northwind.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 3,
      enteredStageAt: '2026-07-10T06:00:00Z',
    },
    {
      templateId: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
      currentStage: 2,
      enteredStageAt: '2026-08-01T14:00:00Z',
    },
  ],
  'adventure-works.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 2,
      enteredStageAt: '2026-07-22T06:00:00Z',
    },
    {
      templateId: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
      currentStage: 1,
      enteredStageAt: '2026-07-28T09:30:00Z',
    },
  ],
  'tailspintoys.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 1,
      enteredStageAt: '2026-07-30T06:00:00Z',
    },
    {
      templateId: 'b2c3d4e5-0000-4v3d-9000-cisl10000001',
      currentStage: 1,
      enteredStageAt: '2026-07-28T09:30:00Z',
    },
  ],
  'wingtip.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 1,
      enteredStageAt: '2026-08-01T06:00:00Z',
    },
  ],
  'proseware.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 1,
      enteredStageAt: '2026-08-01T06:00:00Z',
    },
  ],
  'litware.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 2,
      enteredStageAt: '2026-07-26T06:00:00Z',
    },
  ],
  'woodgrove.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 3,
      enteredStageAt: '2026-07-12T06:00:00Z',
    },
    {
      templateId: 'c3d4e5f6-0000-4v3d-9000-cisl20000001',
      currentStage: 1,
      enteredStageAt: '2026-07-15T17:00:00Z',
    },
    {
      templateId: 'f6a7b8c9-0000-4v3d-9000-woodgrove001',
      currentStage: 1,
      enteredStageAt: '2026-07-21T10:00:00Z',
    },
  ],
  'lamna.onmicrosoft.com': [
    {
      templateId: templateId,
      currentStage: 1,
      enteredStageAt: '2026-07-30T06:00:00Z',
    },
    {
      templateId: 'd4e5f6a7-0000-4v3d-9000-oib000000001',
      currentStage: 2,
      enteredStageAt: '2026-07-30T12:00:00Z',
    },
  ],
}

// Fleet-wide rollout visibility: how many tenants sit in each stage of a template, plus the
// earliest upcoming time-based auto-advance out of that stage (if the next stage has one).
export const getTemplateStageOccupancy = (templateGuid) => {
  const template = templateDefinitions.find(
    (entry) => entry.GUID === templateGuid
  )
  if (!template) return []
  const allStates = Object.entries(standardsV3StageStates)
  return template.stages.map((stage, index) => {
    const stageNumber = index + 1
    const tenantsInStage = allStates
      .filter(([, states]) =>
        states.some(
          (state) =>
            state.templateId === templateGuid &&
            state.currentStage === stageNumber
        )
      )
      .map(([tenantId]) => {
        const tenant = standardsV3Tenants.find(
          (entry) => entry.tenantId === tenantId
        )
        return tenant?.displayName ?? tenantId
      })
    const nextStage = template.stages[stageNumber]
    const timeCondition = nextStage?.conditions?.find(
      (condition) => condition.type === 'time'
    )
    let nextAdvanceAt = null
    if (timeCondition && tenantsInStage.length > 0) {
      const waitMs =
        timeCondition.days *
        (timeCondition.unit === 'weeks' ? 7 : 1) *
        24 *
        60 *
        60 *
        1000
      const graduationTimes = allStates
        .flatMap(([, states]) => states)
        .filter(
          (state) =>
            state.templateId === templateGuid &&
            state.currentStage === stageNumber
        )
        .map((state) => new Date(state.enteredStageAt).getTime() + waitMs)
      nextAdvanceAt = new Date(Math.min(...graduationTimes)).toISOString()
    }
    return {
      stage: stageNumber,
      name: stage.name,
      standardsCount: stage.standards.length,
      tenants: tenantsInStage,
      nextAdvanceAt,
    }
  })
}

// Per-tenant stage detail for one template: which stage each assigned tenant is in, and
// when (or how) it moves to the next stage. Powers the alignment page's Template View.
export const getTemplateTenantStates = (templateGuid) => {
  const template = templateDefinitions.find(
    (entry) => entry.GUID === templateGuid
  )
  if (!template) return []
  return Object.entries(standardsV3StageStates)
    .flatMap(([tenantId, states]) =>
      states
        .filter((state) => state.templateId === templateGuid)
        .map((state) => {
          const tenant = standardsV3Tenants.find(
            (entry) => entry.tenantId === tenantId
          )
          const nextStage = template.stages[state.currentStage]
          const timeCondition = nextStage?.conditions?.find(
            (condition) => condition.type === 'time'
          )
          const estimatedAdvanceAt = timeCondition
            ? new Date(
                new Date(state.enteredStageAt).getTime() +
                  timeCondition.days *
                    (timeCondition.unit === 'weeks' ? 7 : 1) *
                    24 *
                    60 *
                    60 *
                    1000
              ).toISOString()
            : null
          return {
            tenantFilter: tenantId,
            tenantName: tenant?.displayName ?? tenantId,
            currentStage: state.currentStage,
            totalStages: template.stages.length,
            stageName: template.stages[state.currentStage - 1]?.name,
            enteredStageAt: state.enteredStageAt,
            nextStage,
            nextStageName: nextStage?.name ?? null,
            estimatedAdvanceAt,
            manualAdvance:
              nextStage?.conditions?.some(
                (condition) => condition.type === 'manual'
              ) ?? false,
          }
        })
    )
    .sort(
      (a, b) =>
        b.currentStage - a.currentStage ||
        a.tenantName.localeCompare(b.tenantName)
    )
}

// Chronological deviation feed for one tenant, derived from the resolved rows: detections,
// triage decisions, per-property acceptances, and remediations, newest first.
export const getTenantDeviationFeed = (tenantId) => {
  const rows = standardsV3Resolved.filter(
    (row) => row.tenantFilter === tenantId
  )
  const events = []
  rows.forEach((row) => {
    if (row.deviationState === 'Detected') {
      events.push({
        timestamp: row.lastRun,
        feedEvent: 'Detected',
        standardLabel: row.standardLabel,
        detail: `Drift detected by the ${row.sourceTemplate} run`,
        by: 'CIPP',
      })
    }
    if (
      row.deviationState === 'Accepted' ||
      row.deviationState === 'Suppressed'
    ) {
      events.push({
        timestamp: row.deviationAt,
        feedEvent: row.deviationState,
        standardLabel: row.standardLabel,
        detail: row.deviationReason,
        by: row.deviationBy,
      })
    }
    Object.entries(row.acceptedPaths ?? {}).forEach(([path, info]) => {
      events.push({
        timestamp: info.at,
        feedEvent: 'Property Accepted',
        standardLabel: row.standardLabel,
        detail: `${path}: ${info.reason}`,
        by: info.by,
      })
    })
    if (row.lastRemediated) {
      events.push({
        timestamp: row.lastRemediated,
        feedEvent: 'Remediated',
        standardLabel: row.standardLabel,
        detail: row.pendingVerification
          ? 'Auto-remediated - awaiting verification on the next run'
          : 'Auto-remediated to the expected value',
        by: 'CIPP',
      })
    }
  })
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
