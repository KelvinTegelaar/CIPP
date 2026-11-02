// The figures the branding editor's cover mock quotes for each report. They are the headline
// values of the server-side samples (backend/Config/ReportSamples/<type>.json) the live preview
// renders, copied here because the static frontend build cannot read the backend tree; keep the two
// in step so the mock and the rendered preview describe the same report.

export const SAMPLE_TENANT_NAME = 'Contoso (sample data)'

export const SAMPLE_BEC = {
  userData: {
    displayName: 'Sample User',
    userPrincipalName: 'sample.user@example.com',
  },
  becData: {
    ExtractedAt: '2026-08-05T09:00:00Z',
    ExtractResult: 'Successfully extracted logs from auditlog',
    AnalysisWindowDays: 7,
    CaseId: 'BEC-20260805090000-a1b2c3',
    ContentPolicy: 'metadata-only',
    // Server-side score: the report prefers this over its own calculation when present
    Score: {
      Value: 19,
      Level: 'High',
      Thresholds: { High: 7, Medium: 4 },
      Breakdown: [
        {
          Signal: 'NewRules',
          Description: 'Inbox rules exist on the mailbox',
          Weight: 3,
          Count: 1,
          Applied: true,
        },
        {
          Signal: 'InboxRuleChanges',
          Description:
            'Inbox rules were created, changed or removed in the window',
          Weight: 3,
          Count: 1,
          Applied: true,
        },
        {
          Signal: 'SuspiciousRules',
          Description: 'An inbox rule moves mail to a RSS folder',
          Weight: 5,
          Count: 1,
          Applied: true,
        },
        {
          Signal: 'MaliciousApps',
          Description: 'Applications match the known-malicious catalog',
          Weight: 5,
          Count: 1,
          Applied: true,
        },
        {
          Signal: 'ForeignActivity',
          Description:
            'Rule, safelist, sharing or mail activity from outside the usage location',
          Weight: 3,
          Count: 2,
          Applied: true,
        },
        {
          Signal: 'AnonymousLinks',
          Description: 'Anonymous sharing links were created or changed',
          Weight: 3,
          Count: 0,
          Applied: false,
        },
      ],
      Version: 2,
    },
    Completeness: {
      AuditLog: { Complete: true, Cap: null, Error: null, Count: 2 },
      SignIns: { Complete: true, Cap: null, Error: null, Count: 3 },
      SentMessages: {
        Complete: false,
        Cap: '5 pages of 5000 rows',
        Error: null,
        Count: 25000,
      },
    },
    NewRules: [
      {
        Name: 'Sample forwarding rule',
        Description:
          'Move messages from billing@example.com to folder RSS Feeds',
        MoveToFolder: 'RSS Feeds',
        RecentlyChanged: true,
      },
    ],
    InboxRuleChanges: [
      {
        Operation: 'New-InboxRule',
        UserKey: 'sample.user@example.com',
        RuleName: 'Sample forwarding rule',
        Parameters: 'MoveToFolder=RSS Feeds; MarkAsRead=True',
        Date: '2026-08-03T11:24:00Z',
        ClientIP: '203.0.113.10',
        Country: 'NG',
        City: 'Lagos',
        ForeignLocation: true,
      },
    ],
    NewUsers: [
      {
        displayName: 'Sample Contractor',
        userPrincipalName: 'sample.contractor@example.com',
        createdDateTime: '2026-08-02T08:00:00Z',
      },
    ],
    AddedApps: [
      {
        displayName: 'Sample OAuth app',
        appId: '00000000-0000-0000-0000-000000000001',
        publisher: 'Sample Publisher',
        createdDateTime: '2026-08-01T10:00:00Z',
        MaliciousMatch: null,
      },
    ],
    MaliciousSPs: [
      {
        displayName: 'Sample Mail Sync Tool',
        appId: '00000000-0000-0000-0000-000000000002',
        accountEnabled: true,
        createdDateTime: '2026-07-30T09:30:00Z',
        CatalogName: 'Sample Mail Sync Tool',
        Categories: ['Mailbox exfiltration', 'Business Email Compromise'],
        Description: 'Sample catalog entry used for preview data.',
      },
    ],
    MailboxPermissionChanges: [
      {
        Operation: 'Add-MailboxPermission',
        UserKey: 'admin@example.com',
        ObjectId: 'sample.user@example.com',
        Permissions: 'FullAccess',
        TargetsSuspect: true,
      },
    ],
    SentMessages: [
      {
        MessageTraceId: '00000000-0000-0000-0000-000000000003',
        Status: 'Delivered',
        Subject: 'Sample invoice',
        RecipientAddress: 'supplier@example.net',
        Received: '2026-08-04 15:02:11Z',
        FromIP: '203.0.113.10',
        Country: 'NG',
        City: 'Lagos',
        ForeignLocation: true,
      },
    ],
    SentMessageAnalysis: {
      TotalMessages: 47,
      TotalRecipients: 212,
      RepeatedSubjects: [
        {
          Subject: 'Sample invoice',
          MessageCount: 38,
          RecipientCount: 190,
          FirstSent: '2026-08-04 14:55:00Z',
          LastSent: '2026-08-04 15:20:00Z',
          Flagged: true,
        },
      ],
      FlaggedSubjectCount: 1,
      Bursts: [
        {
          WindowStart: '2026-08-04 15:00:00Z',
          WindowMinutes: 10,
          MessageCount: 31,
          RecipientCount: 160,
          TopSubject: 'Sample invoice',
        },
      ],
      Flagged: true,
    },
    MFADevices: [
      {
        '@odata.type':
          '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod',
        displayName: 'Sample phone',
        createdDateTime: '2026-08-03T12:00:00Z',
      },
    ],
    ChangedPasswords: [
      {
        displayName: 'Sample User',
        userPrincipalName: 'sample.user@example.com',
        lastPasswordChangeDateTime: '2026-08-03T12:05:00Z',
      },
    ],
    TrustedSenders: ['trusted@example.net', 'example-partner.com'],
    BlockedSenders: ['security-alerts@example.org'],
    SafelistChanges: [
      {
        Operation: 'Set-MailboxJunkEmailConfiguration',
        UserKey: 'sample.user@example.com',
        Date: '2026-08-03T11:30:00Z',
        ClientIP: '203.0.113.10',
        Country: 'NG',
        City: 'Lagos',
        ForeignLocation: true,
        Trusted: ['attacker-domain.example'],
        Blocked: null,
      },
    ],
    SharingChanges: [
      {
        Operation: 'AnonymousLinkCreated',
        UserKey: 'sample.user@example.com',
        Date: '2026-08-04T10:15:00Z',
        Workload: 'OneDrive',
        FileName: 'Payroll Q3.xlsx',
        ItemUrl:
          'https://example-my.sharepoint.com/personal/sample_user/Documents/Payroll Q3.xlsx',
        Target: null,
        TargetType: null,
        ClientIP: '203.0.113.10',
        Country: 'NG',
        City: 'Lagos',
        ForeignLocation: true,
      },
    ],
    IntuneDevices: [
      {
        id: '00000000-0000-0000-0000-000000000004',
        deviceName: 'SAMPLE-VM01',
        operatingSystem: 'Windows',
        osVersion: '10.0.26100',
        complianceState: 'noncompliant',
        enrolledDateTime: '2026-08-03T13:00:00Z',
        lastSyncDateTime: '2026-08-05T08:00:00Z',
        deviceEnrollmentType: 'windowsAzureADJoin',
        serialNumber: 'SAMPLE1234',
      },
    ],
    SuspectUserSignIns: [
      {
        CreatedDateTime: '2026-08-04T22:14:00Z',
        AppDisplayName: 'Office 365 Exchange Online',
        ClientAppUsed: 'Browser',
        Status: 'Success',
        IPAddress: '203.0.113.10',
        Country: 'NG',
        City: 'Lagos',
        ForeignLocation: true,
      },
      {
        CreatedDateTime: '2026-08-04T09:02:00Z',
        AppDisplayName: 'Microsoft Teams',
        ClientAppUsed: 'Mobile Apps and Desktop clients',
        Status: 'Success',
        IPAddress: '198.51.100.24',
        Country: 'US',
        City: 'Seattle',
        ForeignLocation: false,
      },
    ],
    LocationAnalysis: {
      UsageLocation: 'US',
      UserRegisteredCountry: 'United States',
      SignInCountries: [
        { Country: 'US', Count: 41 },
        { Country: 'NG', Count: 9 },
      ],
      ForeignSignInCount: 9,
      ForeignSuccessfulSignInCount: 8,
      ForeignRuleChangeCount: 1,
      ForeignSafelistChangeCount: 1,
      ForeignSharingChangeCount: 1,
      ForeignSentMessageCount: 1,
      Note: null,
    },
  },
}

export const SAMPLE_SHARING = {
  summary: {
    totalLinks: 24,
    itemsShared: 18,
    externalRecipients: 6,
  },
}

export const SAMPLE_PERMISSIONS = {
  summary: {
    totalAssignments: 156,
    sitesScanned: 12,
    librariesScanned: 34,
  },
}

export const SAMPLE_MAIL_FLOW = {
  days: 14,
  totals: {
    GoodMail: 48210,
    TransportRules: 1340,
    SpamDetections: 6120,
    EdgeBlockSpam: 3980,
    EmailPhish: 412,
    EmailMalware: 37,
  },
}

export const SAMPLE_LICENSING = {
  licensedUsers: 96,
  plans: 11,
  monthlySpend: 2433.75,
  potentialAnnual: 10059.6,
}
