import {
  CippOneDriveCopyLibraryPicker,
  oneDriveCopyDisclaimer,
} from '../components/CippComponents/CippOneDriveCopyLibraryPicker'

export { oneDriveCopyDisclaimer }

const userAutoComplete = (name, label, multiple, required, filter) => ({
  type: 'autoComplete',
  name,
  label,
  multiple,
  creatable: false,
  ...(required ? { validators: { required: `${label} is required` } } : {}),
  api: {
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'users',
      $select: 'id,displayName,userPrincipalName',
      $top: 999,
      $count: true,
      ...(filter ? { $filter: filter } : {}),
    },
    queryKey: `ListUsersAutoComplete${filter ? '-blocked' : ''}`,
    dataKey: 'Results',
    labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
    valueField: 'userPrincipalName',
    showRefresh: true,
  },
})

// Only blocked accounts can be copied, so the leaver picker lists only those.
export const oneDriveCopyLeaverField = userAutoComplete(
  'leaver',
  'User whose OneDrive is copied',
  false,
  true,
  'accountEnabled eq false'
)

export const oneDriveCopyConfirmText = `Copy the user's OneDrive into a folder named after them in each selected user's OneDrive and/or a document library. Existing files are kept. The user must already be blocked from signing in. Follow progress on the OneDrive Copies page. ${oneDriveCopyDisclaimer}`

export const oneDriveCopyFields = [
  userAutoComplete('recipients', 'Copy to users', true, false),
  { name: 'library', component: CippOneDriveCopyLibraryPicker },
  {
    type: 'switch',
    name: 'includeVersionHistory',
    label: 'Include version history',
  },
]

// Picker settings for a OneDrive shortcut: the site is required, a blank library means the site's default
// Documents library, and the library carries its URL, which ExecOneDriveShortCut resolves.
export const oneDriveShortcutLocation = {
  siteLabel: 'Site',
  siteRequired: true,
  libraryRequired: false,
  libraryValueField: 'WebUrl',
}
