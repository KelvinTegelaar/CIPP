// Issue #918: the extension list only exists beneath the Enabled option of its ADMX parent, whose
// default is Disabled. Copied from frontend/public/intune-definitions (catalog bundles + _index).
const PREFIX = '#microsoft.graph.deviceManagementConfiguration'
const CHROME =
  'device_vendor_msft_policy_config_chromeintunev1~policy~googlechrome~extensions'

export const forceListDisabled = `${CHROME}_extensioninstallforcelist_0`
export const forceListEnabled = `${CHROME}_extensioninstallforcelist_1`

export const forceListIdsDefinition = {
  id: `${CHROME}_extensioninstallforcelist_extensioninstallforcelistdesc`,
  '@odata.type': `${PREFIX}SimpleSettingCollectionDefinition`,
  displayName:
    'Extension/App IDs and update URLs to be silently installed (Device)',
  valueDefinition: { '@odata.type': `${PREFIX}StringSettingValueDefinition` },
  dependentOn: [
    {
      dependentOn: forceListEnabled,
      parentSettingId: `${CHROME}_extensioninstallforcelist`,
    },
  ],
}

export const forceListDefinition = {
  id: `${CHROME}_extensioninstallforcelist`,
  '@odata.type': `${PREFIX}ChoiceSettingDefinition`,
  displayName: 'Configure the list of force-installed apps and extensions',
  defaultOptionId: forceListDisabled,
  options: [
    { id: forceListDisabled, displayName: 'Disabled', dependedOnBy: [] },
    {
      id: forceListEnabled,
      displayName: 'Enabled',
      dependedOnBy: [
        { dependedOnBy: forceListIdsDefinition.id, required: true },
      ],
    },
  ],
}

export const forceListChildren = {
  [forceListIdsDefinition.id]: forceListIdsDefinition,
}

// Edge's Extensions category has the same display name; the description is the path that tells them apart.
export const forceListCategory = {
  id: '216de445-a80d-4981-b151-3b4466edc808',
  displayName: 'Extensions',
  description: 'Google Google Chrome Extensions',
}

export const forceListIndexRows = [
  {
    id: forceListDefinition.id,
    displayName: forceListDefinition.displayName,
    categoryName: forceListCategory.displayName,
    categoryId: forceListCategory.id,
    technologies: 'mdm',
  },
  {
    id: forceListIdsDefinition.id,
    displayName: forceListIdsDefinition.displayName,
    categoryName: forceListCategory.displayName,
    categoryId: forceListCategory.id,
    technologies: 'mdm',
    parentId: forceListDefinition.id,
  },
]
