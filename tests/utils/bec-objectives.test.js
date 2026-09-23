import {
  BEC_FINDING_MARKERS,
  BEC_GROUPS,
  BEC_SIGNAL_GROUP,
  becFindingFlags,
  becGroupFlagged,
  becPartnerActions,
} from '../../src/utils/bec-objectives'

const finding = (key) =>
  BEC_GROUPS.flatMap((group) => group.findings).find((f) => f.key === key)

describe('bec-objectives inbox rules', () => {
  it('folds the latest audited change into each rule and keeps the rule detail for More Info', () => {
    const rows = finding('NewRules').rows(
      {
        NewRules: [
          {
            Name: 'Exfil',
            Risk: 'High',
            RiskReasons: ['Forwards or redirects mail to an external address'],
            Description: 'If the message... forward it to x@example.org',
            ForwardTo: ['x@example.org'],
            SubjectContainsWords: [],
            DistinguishedName: 'CN=Exfil,CN=...',
            Enabled: true,
            RecentlyChanged: true,
          },
        ],
        InboxRuleChanges: [
          {
            Operation: 'New-InboxRule',
            RuleName: 'mailbox\\Exfil',
            Date: '2026-08-19T01:00:00Z',
            ClientIP: '203.0.113.10',
            Country: 'NG',
          },
          {
            Operation: 'Set-InboxRule',
            RuleName: 'exfil',
            Date: '2026-08-20T01:00:00Z',
            ClientIP: '198.51.100.7',
            Country: 'US',
            AuditData: { Operation: 'Set-InboxRule' },
          },
          {
            Operation: 'Set-InboxRule',
            RuleName: 'Other',
            Date: '2026-08-21T01:00:00Z',
            ClientIP: '198.51.100.8',
            Country: 'US',
          },
        ],
      },
      { windowDays: 7 }
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      Name: 'Exfil',
      Risk: 'High',
      RiskReasons: 'Forwards or redirects mail to an external address',
      LastChange: 'Set-InboxRule',
      ChangeDate: '2026-08-20T01:00:00Z',
      ChangedFrom: '198.51.100.7',
      Country: 'US',
      ForwardTo: ['x@example.org'],
      Enabled: true,
      ChangeAuditData: { Operation: 'Set-InboxRule' },
    })
    // Exchange plumbing and empty conditions are dropped, so More Info reads as the rule's behaviour
    expect(rows[0]).not.toHaveProperty('DistinguishedName')
    expect(rows[0]).not.toHaveProperty('SubjectContainsWords')
  })

  it('leaves the change columns empty for a rule with no audited change in the window', () => {
    const rows = finding('NewRules').rows(
      {
        NewRules: [{ Name: 'Old rule', Risk: 'Review', RiskReasons: [] }],
        InboxRuleChanges: [],
      },
      { windowDays: 7 }
    )
    expect(rows[0]).toMatchObject({
      Name: 'Old rule',
      LastChange: '',
      ChangeDate: '',
      ChangedFrom: '',
    })
  })
})

describe('becPartnerActions', () => {
  it('gathers the rows a partner or CIPP identity acted on from every source, newest first', () => {
    const rows = becPartnerActions({
      DirectoryAudits: [
        {
          ActivityDateTime: '2026-08-19T03:00:00Z',
          Activity: 'Reset user password',
          InitiatedBy: 'CIPP-SAM',
          ActorKind: 'CIPP',
          ActorResolved: 'CIPP (service principal)',
          Targets: 'victim@contoso.com',
        },
        {
          ActivityDateTime: '2026-08-19T04:00:00Z',
          Activity: 'Update user',
          InitiatedBy: 'admin@contoso.com',
          ActorKind: 'User',
        },
      ],
      InboxRuleChanges: [
        {
          Date: '2026-08-19T02:00:00Z',
          Operation: 'New-InboxRule',
          RuleName: 'Partner rule',
          UserKey: 'user_0123@contoso.onmicrosoft.com',
          ActorKind: 'Partner',
          ActorResolved: 'tech@msp.example',
          ClientIP: '198.51.100.7',
          Country: 'GB',
        },
      ],
      MailboxPermissionChanges: [
        {
          Date: '2026-08-19T05:00:00Z',
          Operation: 'Add-MailboxPermission',
          Permissions: ['FullAccess'],
          Trustee: 'helper@contoso.com',
          TargetsSuspect: true,
          UserId: 'x',
          ActorKind: 'OtherPartner',
        },
        {
          Date: '2026-08-19T06:00:00Z',
          Operation: 'Add-MailboxPermission',
          Permissions: ['FullAccess'],
          TargetsSuspect: false,
          ActorKind: 'Partner',
        },
      ],
    })
    expect(rows.map((r) => r.Source)).toEqual([
      'Mailbox permission',
      'Directory audit',
      'Inbox rule',
    ])
    expect(rows[0]).toMatchObject({
      ActorKind: 'OtherPartner',
      Detail: 'FullAccess to helper@contoso.com',
    })
    expect(rows[1]).toMatchObject({
      Actor: 'CIPP (service principal)',
      ActorKind: 'CIPP',
      Operation: 'Reset user password',
    })
    expect(rows[2]).toMatchObject({
      Actor: 'tech@msp.example',
      ActorKind: 'Partner',
      Detail: 'Partner rule',
      Country: 'GB',
    })
  })
})

describe('bec-objectives attacker group', () => {
  const becData = {
    IPVerdicts: [
      { IP: '198.51.100.7', Verdict: 'LikelyAttacker' },
      { IP: '192.0.2.44', Verdict: 'Unknown' },
      { IP: '203.0.113.10', Verdict: 'LikelyUser' },
    ],
    IPBaseline: { Successful: 40 },
    IPOverrides: [{ Range: '198.51.100.0/24', Verdict: 'Compromised' }],
    AttackerMailActivity: [
      {
        Operation: 'MailItemsAccessed',
        AccessType: 'Bind',
        IPVerdict: 'LikelyAttacker',
      },
      {
        Operation: 'MailItemsAccessed',
        AccessType: 'Sync',
        IPVerdict: 'Unknown',
      },
    ],
    AttackerMailSummary: {
      MessagesOpened: 1,
      FoldersSynced: 1,
      Deleted: 0,
      Moved: 0,
      Sent: 0,
      AttachmentsRead: 0,
      Searches: 0,
      OtherMailboxes: 0,
      SubjectsUnresolved: 0,
      Unattributed: 2,
    },
    FormsActivity: [
      { Operation: 'CreateForm', Flagged: true, IPVerdict: 'Suspicious' },
    ],
    DelegatedAccess: [
      { Mailbox: 'ceo@contoso.com', Flagged: true },
      { Mailbox: 'hr@contoso.com', Flagged: false },
    ],
  }

  it('is the first group, and every finding in it has coverage markers', () => {
    expect(BEC_GROUPS[0].id).toBe('attacker')
    BEC_GROUPS[0].findings.forEach((f) =>
      expect(BEC_FINDING_MARKERS[f.key]?.length).toBeGreaterThan(0)
    )
  })

  it('flags only what the attacker addresses did, and counts forms and mailboxes as flagged by the backend', () => {
    const flags = becFindingFlags(becData, 7)
    expect(flags.IPVerdicts.count).toBe(1)
    expect(flags.AttackerMailActivity.count).toBe(1)
    expect(flags.AttackerFileActivity).toBeNull()
    expect(flags.FormsActivity.count).toBe(1)
    expect(flags.DelegatedAccess.count).toBe(1)
    expect(becGroupFlagged(becData, 7).attacker).toBe(4)
  })

  it('summarises the verdicts and the mail, and lists the synced folders on their own', () => {
    expect(finding('IPVerdicts').summary(becData)).toMatch(
      /3 address\(es\): 0 confirmed compromised, 1 likely attacker.*40 successful sign-in.*1 investigator override/
    )
    expect(finding('AttackerMailActivity').summary(becData)).toMatch(
      /1 message\(s\) opened, 1 folder\(s\) synced whole.*2 mailbox record\(s\) carried no address/
    )
    expect(
      finding('AttackerMailActivity').sections[0].rows(becData)
    ).toHaveLength(1)
  })

  it('routes the attacker score signals to the group', () => {
    ;[
      'AttackerIPs',
      'AttackerMailAccess',
      'AttackerFileAccess',
      'AttackerForms',
      'DelegatedMailboxAttackerAccess',
    ].forEach((s) => expect(BEC_SIGNAL_GROUP[s]).toBe('attacker'))
  })

  it('flags only the other accounts an attacker address reached, and routes the signal to the blast group', () => {
    const flags = becFindingFlags({
      BlastRadius: [
        { UserPrincipalName: 'a@contoso.com', Reached: true },
        { UserPrincipalName: 'b@contoso.com', Reached: false },
      ],
    })
    expect(flags.BlastRadius.count).toBe(1)
    expect(becFindingFlags({ BlastRadius: [] }).BlastRadius).toBeNull()
    expect(BEC_SIGNAL_GROUP.OtherAccountsReached).toBe('blast')
  })

  it('guides the Forms remediation to the Defender alerts of the tenant, since no API removes one form', () => {
    const forms = BEC_GROUPS.flatMap((g) => g.findings).find(
      (f) => f.key === 'FormsActivity'
    )
    expect(forms.remediation.text).toMatch(/Confirm phishing/)
    expect(forms.remediation.links[0].href('contoso.com')).toBe(
      'https://security.microsoft.com/alerts?tid=contoso.com'
    )
  })
})
