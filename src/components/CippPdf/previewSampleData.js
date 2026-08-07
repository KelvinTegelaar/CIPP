/**
 * Sample data for the branding preview, and for nothing else.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS MUST NEVER BE IMPORTED BY A REPORT.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * The point of the branding preview is to show what a report will look like before a tenant has
 * been scanned, so someone tuning colours is not staring at an empty page. That means inventing
 * numbers — and invented numbers reaching a client report would be far worse than an empty section.
 * A report that has no data must keep saying so.
 *
 * The separation is structural rather than a convention to remember: this module is imported only
 * by CippBrandingReportPreview, and `previewSampleData.test.js` fails the build if anything under
 * `src/` other than the preview imports it.
 *
 * Everything here is deliberately obvious as fiction — Contoso, round numbers, example.com — so a
 * screenshot of the preview can never be mistaken for a real client's report.
 */

export const SAMPLE_TENANT_NAME = 'Contoso (sample data)'

/** Executive report — user counts, secure score history, licences, devices, CA policies. */
export const SAMPLE_EXECUTIVE = {
  userStats: { licensedUsers: 128, unlicensedUsers: 12, guests: 9, globalAdmins: 3 },
  secureScoreData: {
    isSuccess: true,
    translatedData: { currentScore: 61, maxScore: 100, percentageCurrent: 61 },
    secureScore: {
      data: {
        Results: [
          { createdDateTime: '2026-08-04T00:00:00Z', currentScore: 61 },
          { createdDateTime: '2026-08-03T00:00:00Z', currentScore: 60 },
          { createdDateTime: '2026-08-02T00:00:00Z', currentScore: 58 },
          { createdDateTime: '2026-08-01T00:00:00Z', currentScore: 57 },
          { createdDateTime: '2026-07-31T00:00:00Z', currentScore: 55 },
          { createdDateTime: '2026-07-30T00:00:00Z', currentScore: 52 },
          { createdDateTime: '2026-07-29T00:00:00Z', currentScore: 50 },
        ],
      },
    },
  },
  // Field names match what the report's tables actually read. They were previously invented
  // (`skuPartNumber`, `consumedUnits`) and every cell fell through to its 'N/A' fallback, so the
  // preview showed an empty-looking table while the real report showed data.
  licensingData: [
    { License: 'Microsoft 365 E3', CountUsed: 88, CountAvailable: 12, TotalLicenses: 100 },
    { License: 'Exchange Online (Plan 1)', CountUsed: 27, CountAvailable: 3, TotalLicenses: 30 },
    { License: 'Microsoft Defender for Office 365', CountUsed: 64, CountAvailable: 36, TotalLicenses: 100 },
  ],
  // A plain array, matching `deviceData?.data?.Results` in the real report — the wrapper the sample
  // used to carry meant `Array.isArray` failed and the whole Device Management section was skipped.
  deviceData: [
    {
      deviceName: 'SAMPLE-LT-001',
      operatingSystem: 'Windows',
      complianceState: 'compliant',
      isEncrypted: true,
      lastSyncDateTime: '2026-08-05T09:14:00Z',
    },
    {
      deviceName: 'SAMPLE-LT-002',
      operatingSystem: 'Windows',
      complianceState: 'noncompliant',
      isEncrypted: false,
      lastSyncDateTime: '2026-07-28T17:02:00Z',
    },
    {
      deviceName: 'SAMPLE-MB-003',
      operatingSystem: 'iOS',
      complianceState: 'compliant',
      isEncrypted: true,
      lastSyncDateTime: '2026-08-05T07:45:00Z',
    },
    {
      deviceName: 'SAMPLE-MB-004',
      operatingSystem: 'Android',
      complianceState: 'compliant',
      isEncrypted: true,
      lastSyncDateTime: '2026-08-04T21:30:00Z',
    },
  ],
  // Also a plain array — `conditionalAccessData?.data?.Results` in the real report.
  conditionalAccessData: [
    {
      displayName: 'Require MFA for all users',
      state: 'enabled',
      includeApplications: 'All',
      builtInControls: ['mfa'],
    },
    {
      displayName: 'Block legacy authentication',
      state: 'enabled',
      includeApplications: 'All',
      builtInControls: ['block'],
    },
    {
      displayName: 'Require compliant device for Exchange',
      state: 'enabledForReportingButNotEnforced',
      includeApplications: 'Exchange Online',
      builtInControls: ['compliantDevice'],
    },
  ],
  // `driftComplianceData?.data` in the real report: the array itself, not a wrapper around it.
  driftComplianceData: [
    {
      tenantFilter: 'contoso.com',
      alignedCount: 42,
      currentDeviations: [
        { standardName: 'standards.AntiPhishPolicy', receivedValue: 'Disabled' },
        { standardName: 'standards.SafeLinksPolicy', receivedValue: 'Disabled' },
      ],
      acceptedDeviations: [{ standardName: 'standards.AuditLog', receivedValue: 'Custom' }],
      deniedDeviations: [{ standardName: 'standards.DisableBasicAuth', receivedValue: 'Enabled' }],
      customerSpecificDeviations: [{ standardName: 'standards.Guests', receivedValue: 'Allowed' }],
    },
  ],
  // Drives two things: the Security Standards page, and the Applied Standards section of the drift
  // pages — which is built from this rather than from driftComplianceData, so without it that page
  // rendered empty and never appeared in the preview at all.
  //
  // Keys are real standard names where possible, so they resolve against the generated
  // standards.json catalogue and show its wording. A key it does not know still renders, through
  // the report's own fallback naming — which is worth exercising here too.
  standardsCompareData: [
    {
      tenantFilter: 'contoso.com',
      'standards.AntiPhishPolicy': { Value: true },
      'standards.SafeLinksPolicy': { Value: true },
      'standards.AuditLog': { CurrentValue: 'Enabled', ExpectedValue: 'Enabled' },
      'standards.Guests': { CurrentValue: 'Allowed', ExpectedValue: 'Blocked' },
      'standards.PasswordExpireDisabled': { Value: true },
      'standards.DisableBasicAuth': { CurrentValue: 'Partial', ExpectedValue: 'Disabled' },
      'standards.IntuneTemplate.8f2a1c4e-6b3d-4f5a-9e7c-1d2b3a4c5e6f': { Value: true },
    },
  ],
  standardTemplatesData: [
    {
      standards: {
        IntuneTemplate: [
          {
            TemplateList: {
              value: '8f2a1c4e-6b3d-4f5a-9e7c-1d2b3a4c5e6f',
              label: 'Windows Device Compliance',
            },
          },
        ],
      },
    },
  ],
}

/** Report builder — one of each block type, so every renderer is exercised in the preview. */
export const SAMPLE_REPORT_BUILDER_BLOCKS = [
  {
    id: 'sample-1',
    type: 'blank',
    title: 'Summary',
    static: true,
    content:
      '<p>This preview uses <strong>sample data</strong> so you can see how your branding lands before running a report against a real tenant.</p>',
  },
  {
    id: 'sample-2',
    type: 'scorecard',
    title: 'Environment Overview',
    static: true,
    stats: [
      { label: 'Licensed Users', value: '128' },
      { label: 'Devices', value: '96' },
      { label: 'Global Admins', value: '3', caption: 'Target: 2–4' },
      { label: 'Guests', value: '9' },
    ],
  },
  {
    id: 'sample-3',
    type: 'chart',
    title: 'Device Compliance',
    static: true,
    chartKind: 'donut',
    chartCentreLabel: 'Devices',
    chartData: [
      { label: 'Compliant', value: 78 },
      { label: 'Non-compliant', value: 14 },
      { label: 'Not evaluated', value: 4 },
    ],
  },
  {
    id: 'sample-4',
    type: 'chart',
    title: 'Secure Score Trend',
    static: true,
    chartKind: 'trend',
    chartMax: 100,
    chartCaption: 'Current: 61 / 100 (61%)',
    chartData: [
      { label: 'Jul 29', value: 50 },
      { label: 'Jul 31', value: 55 },
      { label: 'Aug 2', value: 58 },
      { label: 'Aug 4', value: 61 },
    ],
  },
  {
    id: 'sample-5',
    type: 'progress',
    title: 'Control Coverage',
    static: true,
    items: [
      { label: 'MFA enforced', value: 92, max: 100 },
      { label: 'Disk encryption', value: 78, max: 100 },
      { label: 'Defender onboarded', value: 64, max: 100 },
    ],
  },
  { id: 'sample-6', type: 'pagebreak', title: '', static: true },
  {
    id: 'sample-7',
    type: 'hero',
    title: 'seconds',
    static: true,
    heroHighlight: '39',
    heroSubText: 'a business falls victim to ransomware',
    heroFooterText: 'Proactive defense beats reactive recovery',
    heroImage: '/reportImages/working.jpg',
  },
  {
    id: 'sample-8',
    type: 'test',
    title: 'Multi-factor authentication',
    status: 'Failed',
    static: false,
    content:
      '14 of 128 accounts can still sign in without a second factor.\n\n## Results\n\n| Account | Method | Last sign-in |\n| --- | --- | --- |\n| sample.one@example.com | None | 2 days ago |\n| sample.two@example.com | None | 9 days ago |\n',
  },
  {
    id: 'sample-9',
    type: 'chart',
    title: 'Devices by Platform',
    static: true,
    chartKind: 'bar',
    chartData: [
      { label: 'Windows', value: 62 },
      { label: 'macOS', value: 18 },
      { label: 'iOS', value: 12 },
      { label: 'Android', value: 4 },
    ],
  },
  {
    // A database block in its markdown form: the query result arrives as a markdown table, which is
    // the path that exercises the table renderer and the long-value wrapping in it. The deliberately
    // over-long identifier is there to show a value being broken across lines rather than running
    // out of its column.
    id: 'sample-10',
    type: 'database',
    title: 'Query Results',
    static: true,
    format: 'text',
    content:
      '| Policy | Identifier | State |\n| --- | --- | --- |\n| Baseline | 8f2a1c4e-6b3d-4f5a-9e7c-1d2b3a4c5e6f | Enabled |\n| Hardened | Microsoft_Defender_for_Business_Servers | Report only |\n',
  },
  {
    // The same block type in its raw form, which renders as a code block instead.
    id: 'sample-11',
    type: 'database',
    title: 'Raw Response',
    static: true,
    format: 'json',
    content: '{\n  "tenant": "contoso.com",\n  "policies": 191,\n  "enabled": 5\n}',
  },
]

/**
 * Shadow AI report.
 *
 * Field names match what the report reads — `tools` not `count`, `aiTool` not `name`, and a `status`
 * of exactly 'Sanctioned' on at least one app, which is what builds the Company Sanctioned AI Tools
 * page. The earlier sample invented its own names, so every table in the preview rendered its empty
 * state and the sanctioned page never appeared at all.
 */
export const SAMPLE_SHADOW_AI = {
  summary: {
    aiToolsDetected: 18,
    deviceInstalls: 36,
    consentedAiApps: 5,
    highRiskTools: 3,
    sanctionedTools: 2,
  },
  byRisk: [
    { risk: 'High', tools: 3 },
    { risk: 'Medium', tools: 7 },
    { risk: 'Low', tools: 6 },
    { risk: 'Informational', tools: 2 },
  ],
  topTools: [
    { tool: 'Sample AI Assistant', category: 'Chat', status: 'Unsanctioned', devices: 22, users: 18 },
    { tool: 'Sample Code Helper', category: 'Development', status: 'Unsanctioned', devices: 14, users: 9 },
    { tool: 'Sample Notetaker', category: 'Meetings', status: 'Sanctioned', devices: 11, users: 24 },
  ],
  detectedApps: [
    {
      application: 'Sample AI Assistant Desktop',
      aiTool: 'Sample AI Assistant',
      vendor: 'Example Corp',
      category: 'Chat',
      risk: 'High',
      status: 'Unsanctioned',
      deviceCount: 22,
    },
    {
      application: 'Sample Code Helper',
      aiTool: 'Sample Code Helper',
      vendor: 'Example Labs',
      category: 'Development',
      risk: 'Medium',
      status: 'Unsanctioned',
      deviceCount: 14,
    },
    {
      application: 'Sample Notetaker',
      aiTool: 'Sample Notetaker',
      vendor: 'Example Corp',
      category: 'Meetings',
      risk: 'Informational',
      status: 'Sanctioned',
      deviceCount: 11,
    },
  ],
  consentedApps: [
    {
      applicationId: '00000000-0000-0000-0000-000000000001',
      application: 'Sample AI Connector',
      aiTool: 'Sample AI Assistant',
      vendor: 'Example Corp',
      category: 'Chat',
      risk: 'High',
      status: 'Unsanctioned',
      activeUsersLast7Days: 18,
      firstConsentedDateTime: '2026-06-11T10:22:00Z',
    },
    {
      applicationId: '00000000-0000-0000-0000-000000000002',
      application: 'Sample Meeting Notes',
      aiTool: 'Sample Notetaker',
      vendor: 'Example Corp',
      category: 'Meetings',
      risk: 'Informational',
      status: 'Sanctioned',
      activeUsersLast7Days: 24,
      firstConsentedDateTime: '2026-03-02T14:05:00Z',
    },
  ],
}

/** BEC remediation report. */
export const SAMPLE_BEC = {
  userData: { displayName: 'Sample User', userPrincipalName: 'sample.user@example.com' },
  becData: {
    ExtractedAt: '2026-08-05T09:00:00Z',
    ExtractResult: 'Completed',
    NewRules: [{ Name: 'Sample forwarding rule', MoveToFolder: 'RSS Feeds' }],
    InboxRuleChanges: [{ Name: 'Sample rule change' }],
    NewUsers: [],
    AddedApps: [{ DisplayName: 'Sample OAuth app' }],
    MailboxPermissionChanges: [{ Grantee: 'sample.other@example.com' }],
    MFADevices: [{ Device: 'Sample phone' }],
    ChangedPasswords: [{ User: 'sample.user@example.com' }],
    TrustedSenders: [],
    BlockedSenders: [],
    SafelistChanges: [],
  },
}

/** SharePoint sharing report. */
export const SAMPLE_SHARING = {
  summary: {
    totalLinks: 24,
    itemsShared: 18,
    externalRecipients: 6,
    anonymousLinks: 4,
    anonymousEditLinks: 1,
    neverExpiringAnonymous: 2,
    folderShares: 3,
    externalLinks: 6,
    sharePointSites: 5,
    teamsSites: 3,
    oneDriveAccounts: 12,
  },
  links: [
    {
      itemName: 'Sample Proposal.docx',
      siteName: 'Sample Marketing',
      linkType: 'Anonymous',
      scope: 'Edit',
      expires: 'Never',
      recipients: 'Anyone with the link',
    },
    {
      itemName: 'Sample Budget.xlsx',
      siteName: 'Sample Finance',
      linkType: 'External',
      scope: 'View',
      expires: '2026-12-31',
      recipients: 'partner@example.com',
    },
  ],
  topRecipients: [
    { recipient: 'partner@example.com', links: 5 },
    { recipient: 'supplier@example.net', links: 3 },
  ],
  topLibraries: [
    { library: 'Sample Marketing / Documents', links: 9 },
    { library: 'Sample Finance / Documents', links: 6 },
  ],
}

/** SharePoint permissions report. */
export const SAMPLE_PERMISSIONS = {
  summary: {
    sitesScanned: 12,
    librariesScanned: 34,
    totalAssignments: 156,
    broadClaimGrants: 2,
    externalGrants: 5,
    directFullControlGrants: 3,
    uniquePermissionLibraries: 7,
  },
  assignments: [
    {
      siteName: 'Sample Marketing',
      libraryName: 'Documents',
      principal: 'Everyone except external users',
      permission: 'Edit',
      type: 'Broad claim',
    },
    {
      siteName: 'Sample Finance',
      libraryName: 'Documents',
      principal: 'partner@example.com',
      permission: 'Full Control',
      type: 'External',
    },
  ],
}

/**
 * Which sample set feeds which report, keyed by the ids in REPORT_COVER_PRESETS so the preview's
 * report picker and its data stay in step.
 */
export const SAMPLE_DATA_BY_REPORT = {
  // The executive report can append the Shadow AI pages, so it is given the same sample the Shadow
  // AI report uses. Without it that whole section was silently absent from the preview.
  executive: { ...SAMPLE_EXECUTIVE, shadowAIData: SAMPLE_SHADOW_AI },
  reportBuilder: { blocks: SAMPLE_REPORT_BUILDER_BLOCKS },
  shadowAI: { data: SAMPLE_SHADOW_AI },
  bec: SAMPLE_BEC,
  sharing: { sharingData: SAMPLE_SHARING },
  permissions: { permissionsData: SAMPLE_PERMISSIONS },
}
