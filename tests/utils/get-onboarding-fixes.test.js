import { describe, expect, it } from 'vitest'
import {
  getOnboardingFixes,
  getScanSelection,
  getSetupFixes,
  getSnapshotDefaults,
} from '../../src/utils/get-onboarding-fixes'

const delegate = {
  Items: [{ User: 'tom@contoso.com', AccessRights: ['FullAccess', 'SendAs'] }],
}
const findings = [
  {
    Id: 'SignInBlocked',
    Fix: { Key: 'EnableSignIn', Default: true, Params: {} },
  },
  {
    Id: 'TemporaryAccessPass',
    Fix: { Key: 'IssueTAP', Default: false, Params: {} },
  },
  { Id: 'NoMfaMethods', Fix: null, Note: 'Report only' },
  {
    Id: 'MailboxDelegate:tom@contoso.com',
    Fix: { Key: 'RemoveMailboxPermissions', Default: true, Params: delegate },
  },
]
const snapshot = {
  Licenses: [
    { skuId: 'sku-1', available: 2 },
    { skuId: 'sku-2', available: 0 },
  ],
  Groups: [
    { id: 'g1', displayName: 'Sales', groupType: 'Security', restorable: true },
    {
      id: 'g2',
      displayName: 'Dynamic',
      groupType: 'Security',
      restorable: false,
    },
  ],
  Manager: { id: 'm1', userPrincipalName: 'boss@contoso.com' },
}

describe('getScanSelection', () => {
  it('starts from each fix default and skips findings with nothing to run', () => {
    expect(getScanSelection(findings)).toEqual({
      SignInBlocked: true,
      TemporaryAccessPass: false,
      'MailboxDelegate:tom@contoso.com': true,
    })
  })

  it('keeps earlier choices across a rescan and never offers RestoreUser as a job step', () => {
    const deleted = [
      { Id: 'SoftDeleted', Fix: { Key: 'RestoreUser', Default: true } },
    ]
    expect(
      getScanSelection(findings, { SignInBlocked: false }).SignInBlocked
    ).toBe(false)
    expect(getScanSelection(deleted)).toEqual({})
  })
})

describe('getOnboardingFixes', () => {
  it('sends only the ticked scan fixes, with their params untouched', () => {
    const ticked = {
      SignInBlocked: false,
      'MailboxDelegate:tom@contoso.com': true,
    }
    expect(getOnboardingFixes({ findings, ticked })).toEqual([
      { Key: 'RemoveMailboxPermissions', Params: delegate },
    ])
  })

  it('maps the snapshot option to SetManager, AssignLicenses and AddGroups', () => {
    const reentitle = {
      mode: 'snapshot',
      ...getSnapshotDefaults(snapshot),
      snapshotGroups: ['g1', 'g2'],
    }
    expect(reentitle.snapshotLicenses).toEqual(['sku-1'])
    expect(getOnboardingFixes({ reentitle, snapshot })).toEqual([
      { Key: 'SetManager', Params: { ManagerId: 'boss@contoso.com' } },
      { Key: 'AssignLicenses', Params: { Licenses: ['sku-1'] } },
      {
        Key: 'AddGroups',
        Params: {
          Items: [{ id: 'g1', displayName: 'Sales', groupType: 'Security' }],
        },
      },
    ])
  })

  it('maps the template option and ignores snapshot ticks left over from the other option', () => {
    const reentitle = {
      mode: 'template',
      ...getSnapshotDefaults(snapshot),
      licenses: [{ label: 'E3 (4 available)', value: 'sku-3' }],
      AddToGroups: [
        {
          label: 'Staff - staff@contoso.com',
          value: 'g3',
          addedFields: { groupType: 'Microsoft 365', displayName: 'Staff' },
        },
      ],
      copyFrom: { value: 'user-9' },
    }
    expect(getOnboardingFixes({ reentitle, snapshot })).toEqual([
      { Key: 'CopyGroupsFrom', Params: { UserId: 'user-9' } },
      { Key: 'AssignLicenses', Params: { Licenses: ['sku-3'] } },
      {
        Key: 'AddGroups',
        Params: {
          Items: [
            { id: 'g3', displayName: 'Staff', groupType: 'Microsoft 365' },
          ],
        },
      },
    ])
  })

  it('maps the mailbox and OneDrive setup options and sends only what was chosen', () => {
    expect(getSetupFixes(undefined)).toEqual([])
    expect(getSetupFixes({ locale: null, calendarUsers: [] })).toEqual([])
    // A time zone or a calendar level alone has nothing to act on.
    expect(
      getSetupFixes({
        timeZone: { value: 'GMT Standard Time' },
        calendarLevel: { value: 'Editor' },
      })
    ).toEqual([])

    // A shortcut on its own still pre-provisions the OneDrive first.
    expect(
      getSetupFixes({ shortcuts: ['https://contoso.sharepoint.com/sites/hr'] })
    ).toEqual([
      { Key: 'ProvisionOneDrive', Params: {} },
      {
        Key: 'AddOneDriveShortcuts',
        Params: {
          Items: [{ URL: 'https://contoso.sharepoint.com/sites/hr' }],
        },
      },
    ])

    const setup = {
      provisionOneDrive: true,
      shortcuts: [
        { label: 'HR', value: 'https://contoso.sharepoint.com/sites/hr' },
        'https://contoso.sharepoint.com/sites/typed',
      ],
      locale: { value: 'en-GB' },
      timeZone: { value: 'GMT Standard Time' },
      enableArchive: true,
      accessNoAutomap: [{ value: 'tom@contoso.com' }],
      accessAutomap: [{ value: 'tom@contoso.com' }],
      accessSendAs: [
        { value: 'tom@contoso.com' },
        { value: 'ann@contoso.com' },
      ],
      calendarUsers: [{ value: 'ann@contoso.com' }],
      calendarLevel: { value: 'Reviewer' },
      calendarPrivateItems: true,
    }
    expect(getSetupFixes(setup)).toEqual([
      { Key: 'ProvisionOneDrive', Params: {} },
      {
        Key: 'AddOneDriveShortcuts',
        Params: {
          Items: [
            { URL: 'https://contoso.sharepoint.com/sites/hr' },
            { URL: 'https://contoso.sharepoint.com/sites/typed' },
          ],
        },
      },
      {
        Key: 'SetMailboxLocale',
        Params: { Locale: 'en-GB', TimeZone: 'GMT Standard Time' },
      },
      { Key: 'EnableArchive', Params: {} },
      {
        Key: 'GrantMailboxAccess',
        Params: {
          Items: [
            {
              User: 'tom@contoso.com',
              AccessRights: ['FullAccess', 'SendAs'],
              AutoMap: true,
            },
            {
              User: 'ann@contoso.com',
              AccessRights: ['SendAs'],
              AutoMap: false,
            },
          ],
        },
      },
      {
        Key: 'GrantCalendarAccess',
        Params: {
          Items: [
            {
              User: 'ann@contoso.com',
              Permissions: 'Reviewer',
              CanViewPrivateItems: false,
            },
          ],
        },
      },
    ])
    // The existing-user path sends them after the scan and re-entitle fixes.
    expect(getOnboardingFixes({ setup: { enableArchive: true } })).toEqual([
      { Key: 'EnableArchive', Params: {} },
    ])
  })

  it('returns nothing when nothing is selected', () => {
    expect(
      getOnboardingFixes({
        findings,
        ticked: {},
        reentitle: { mode: 'template' },
      })
    ).toEqual([])
  })
})
