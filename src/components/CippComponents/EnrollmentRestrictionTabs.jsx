import { Button } from '@mui/material'
import { Stack } from '@mui/system'
import Link from 'next/link'
import { CippIcons } from '../../utils/icon-registry'
import { CippTablePage } from './CippTablePage.jsx'
import { CippEnrollmentRestrictionDrawer } from './CippEnrollmentRestrictionDrawer.jsx'
import { useSettings } from '../../hooks/use-settings'

// Every setting a template keeps, mapped from the row of the same name.
const templateFields = [
  'displayName',
  'description',
  'platform',
  'priority',
  'platformBlocked',
  'personalDeviceEnrollmentBlocked',
  'osMinimumVersion',
  'osMaximumVersion',
  'deviceAdminPlatformBlocked',
  'deviceAdminPersonalDeviceEnrollmentBlocked',
  'deviceAdminOsMinimumVersion',
  'deviceAdminOsMaximumVersion',
  'deviceAdminBlockedManufacturers',
  'AssignTo',
  'customGroup',
]

// The default restriction is read-only here; the DefaultPlatformRestrictions standard manages it.
const isGroupRestriction = (row) => !row?.isDefault

// One platform tab: the restrictions for the listed platforms, with the tenant's default last
// on each. createPlatforms are the platforms a new restriction can be created for from this tab.
const EnrollmentRestrictionTable = ({ title, tab, platforms, createPlatforms }) => {
  const currentTenant = useSettings().currentTenant

  const actions = [
    {
      label: 'Edit Restriction',
      icon: <CippIcons.Edit />,
      hideBulk: true,
      noConfirm: true,
      condition: isGroupRestriction,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <CippEnrollmentRestrictionDrawer
          row={row}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
    },
    {
      label: 'Save as Template',
      type: 'POST',
      url: '/api/AddEnrollmentRestrictionTemplate',
      icon: <CippIcons.Book />,
      data: Object.fromEntries(templateFields.map((field) => [field, field])),
      confirmText:
        'Save "[displayName]" as a template? Its groups are saved by name and looked up in each tenant it is deployed to.',
      multiPost: false,
      condition: isGroupRestriction,
    },
    {
      label: 'Delete Restriction',
      type: 'POST',
      url: '/api/ExecRemoveEnrollmentRestriction',
      icon: <CippIcons.Delete />,
      data: { ids: 'ids', displayName: 'displayName' },
      confirmText:
        'Delete the enrollment restriction "[displayName]"? Users it applies to fall back to the next restriction by priority.',
      color: 'danger',
      multiPost: false,
      condition: isGroupRestriction,
    },
  ]

  return (
    <CippTablePage
      title={title}
      apiUrl="/api/ListEnrollmentRestrictions"
      apiData={{ platform: platforms.join(',') }}
      apiDataKey="Results"
      queryKey={`EnrollmentRestrictions-${tab}-${currentTenant}`}
      actions={actions}
      offCanvas={{
        extendedInfoFields: [
          'displayName',
          'description',
          'platformLabel',
          'priority',
          'PolicyAssignment',
          'ids',
          'lastModifiedDateTime',
        ],
        actions,
      }}
      simpleColumns={['platformLabel', 'priority', 'displayName', 'description', 'PolicyAssignment']}
      cardButton={
        <Stack direction="row" spacing={1}>
          <CippEnrollmentRestrictionDrawer platforms={createPlatforms} />
          <Button
            component={Link}
            href="/endpoint/autopilot/enrollment-restriction-templates"
            startIcon={<CippIcons.Book />}
          >
            Templates
          </Button>
        </Stack>
      }
    />
  )
}

export const WindowsEnrollmentRestrictions = () => (
  <EnrollmentRestrictionTable
    title="Windows Enrollment Restrictions"
    tab="windows"
    platforms={['windows']}
    createPlatforms={['windows']}
  />
)

// Graph can only create Apple restrictions for iOS/iPadOS and macOS; tvOS and visionOS show the
// tenant's default restriction only.
export const AppleEnrollmentRestrictions = () => (
  <EnrollmentRestrictionTable
    title="Apple Enrollment Restrictions"
    tab="apple"
    platforms={['ios', 'macOS', 'tvOS', 'visionOS']}
    createPlatforms={['ios', 'macOS']}
  />
)

export const AndroidEnrollmentRestrictions = () => (
  <EnrollmentRestrictionTable
    title="Android Enrollment Restrictions"
    tab="android"
    platforms={['android']}
    createPlatforms={['android']}
  />
)
