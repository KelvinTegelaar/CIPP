// Maps the onboarding wizard's selections to the Fixes array /api/ExecOnboardUser expects.

// Tick state for the scan findings: keeps what the technician already chose and falls back to
// each fix's default. RestoreUser is never a job step, the wizard restores before the job runs.
export const getScanSelection = (findings = [], previous = {}) =>
  Object.fromEntries(
    findings
      .filter((finding) => finding.Fix && finding.Fix.Key !== 'RestoreUser')
      .map((finding) => [
        finding.Id,
        previous[finding.Id] ?? finding.Fix.Default === true,
      ])
  )

// Snapshot defaults: everything that can be restored, except licences with no seats left.
export const getSnapshotDefaults = (snapshot) => ({
  snapshotLicenses: (snapshot?.Licenses ?? [])
    .filter((licence) => licence.available > 0)
    .map((licence) => licence.skuId),
  snapshotManager: Boolean(snapshot?.Manager?.id),
  snapshotGroups: (snapshot?.Groups ?? [])
    .filter((group) => group.restorable)
    .map((group) => group.id),
})

// A user template stores groups either as picker options or as raw Graph groups.
export const templateGroupsToOptions = (template) =>
  [template?.addToGroups || template?.groupMemberships || []]
    .flat()
    .map((group) => {
      if (group.label && group.value) return group
      const unified = group.groupTypes?.includes('Unified')
      const groupType = unified
        ? 'Microsoft 365'
        : group.mailEnabled
          ? group.securityEnabled
            ? 'Mail-Enabled Security'
            : 'Distribution list'
          : 'Security'
      return {
        label: group.mail
          ? `${group.displayName} - ${group.mail}`
          : group.displayName,
        value: group.id,
        addedFields: { groupType },
      }
    })

const pickValues = (list) =>
  [list ?? []]
    .flat()
    .map((option) => option?.value ?? option)
    .filter(Boolean)

// getSetupFixes only grants calendar access with a level, so people picked without one would be dropped.
export const isCalendarLevelMissing = (setup) =>
  pickValues(setup?.calendarUsers).length > 0 &&
  pickValues(setup?.calendarLevel).length === 0

// Mailbox and OneDrive setup options (HIDDEN_setup) as job fixes; only what was chosen is sent.
export const getSetupFixes = (setup) => {
  const fixes = []
  const shortcuts = pickValues(setup?.shortcuts).map((URL) => ({ URL }))
  // A shortcut needs the OneDrive to exist, so choosing one always pre-provisions it.
  if (setup?.provisionOneDrive || shortcuts.length > 0)
    fixes.push({ Key: 'ProvisionOneDrive', Params: {} })
  if (shortcuts.length > 0)
    fixes.push({ Key: 'AddOneDriveShortcuts', Params: { Items: shortcuts } })
  const [Locale] = pickValues(setup?.locale)
  const [TimeZone] = pickValues(setup?.timeZone)
  if (Locale)
    fixes.push({
      Key: 'SetMailboxLocale',
      Params: TimeZone ? { Locale, TimeZone } : { Locale },
    })
  if (setup?.enableArchive) fixes.push({ Key: 'EnableArchive', Params: {} })

  // One entry per person, carrying every right picked for them; automap wins if both were picked.
  const access = new Map()
  const grant = (list, right, autoMap) =>
    pickValues(list).forEach((User) => {
      const entry = access.get(User) ?? {
        User,
        AccessRights: [],
        AutoMap: false,
      }
      if (!entry.AccessRights.includes(right)) entry.AccessRights.push(right)
      entry.AutoMap = entry.AutoMap || autoMap
      access.set(User, entry)
    })
  grant(setup?.accessNoAutomap, 'FullAccess', false)
  grant(setup?.accessAutomap, 'FullAccess', true)
  grant(setup?.accessSendAs, 'SendAs', false)
  grant(setup?.accessSendOnBehalf, 'SendOnBehalf', false)
  if (access.size > 0)
    fixes.push({
      Key: 'GrantMailboxAccess',
      Params: { Items: [...access.values()] },
    })

  const [Permissions] = pickValues(setup?.calendarLevel)
  const calendarUsers = pickValues(setup?.calendarUsers)
  if (Permissions && calendarUsers.length > 0)
    fixes.push({
      Key: 'GrantCalendarAccess',
      Params: {
        Items: calendarUsers.map((User) => ({
          User,
          Permissions,
          CanViewPrivateItems:
            Permissions === 'Editor' && setup?.calendarPrivateItems === true,
        })),
      },
    })
  return fixes
}

export const getOnboardingFixes = ({
  findings = [],
  ticked = {},
  reentitle = {},
  snapshot,
  setup,
}) => {
  const fixes = findings
    .filter(
      (finding) =>
        finding.Fix && finding.Fix.Key !== 'RestoreUser' && ticked[finding.Id]
    )
    .map((finding) => ({
      Key: finding.Fix.Key,
      Params: finding.Fix.Params ?? {},
    }))

  let licences = []
  let groups = []
  if (reentitle.mode === 'snapshot' && snapshot) {
    licences = (snapshot.Licenses ?? [])
      .filter((licence) => reentitle.snapshotLicenses?.includes(licence.skuId))
      .map((licence) => licence.skuId)
    groups = (snapshot.Groups ?? [])
      .filter(
        (group) =>
          group.restorable && reentitle.snapshotGroups?.includes(group.id)
      )
      .map(({ id, displayName, groupType }) => ({ id, displayName, groupType }))
    if (reentitle.snapshotManager && snapshot.Manager?.id) {
      fixes.push({
        Key: 'SetManager',
        // The address reads better than an object id in the job's result.
        Params: {
          ManagerId: snapshot.Manager.userPrincipalName ?? snapshot.Manager.id,
        },
      })
    }
  } else if (reentitle.mode === 'template') {
    licences = (reentitle.licenses ?? []).map(
      (licence) => licence.value ?? licence
    )
    groups = (reentitle.AddToGroups ?? []).map((group) => ({
      id: group.value,
      displayName: group.addedFields?.displayName ?? group.label,
      groupType: group.addedFields?.groupType,
    }))
    if (reentitle.copyFrom?.value) {
      fixes.push({
        Key: 'CopyGroupsFrom',
        Params: { UserId: reentitle.copyFrom.value },
      })
    }
  }
  if (licences.length > 0)
    fixes.push({ Key: 'AssignLicenses', Params: { Licenses: licences } })
  if (groups.length > 0)
    fixes.push({ Key: 'AddGroups', Params: { Items: groups } })
  fixes.push(...getSetupFixes(setup))
  return fixes
}
