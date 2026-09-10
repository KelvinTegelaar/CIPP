import { useEffect, useState } from 'react'
import { Button, Box } from '@mui/material'
import { useRouter } from 'next/router'
import ReactTimeAgo from 'react-time-ago'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useDialog } from '../../../../../hooks/use-dialog'
import { usePermissions } from '../../../../../hooks/use-permissions'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippUserSwitcher } from '../../../../../components/CippComponents/CippUserSwitcher'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../../../components/CippComponents/CippApiDialog'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import tabOptions from './tabOptions'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { userId } = router.query
  const tenant = router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  const [waiting, setWaiting] = useState(false)
  const addDialog = useDialog()
  const { checkPermissions } = usePermissions()
  const canWriteUser = checkPermissions(['Identity.User.ReadWrite'])

  useEffect(() => {
    if (userId) setWaiting(true)
  }, [userId])

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${tenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting,
  })

  const user = userRequest.data?.[0]
  const userPrincipalName = user?.userPrincipalName
  const shortcutsQueryKey = `ListUserOneDriveShortcuts-${tenant}-${userId}`

  const title = userRequest.isSuccess ? user?.displayName : 'Loading...'
  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <CippIcons.Mail />,
          text: <CippCopyToClipBoard type="chip" text={userPrincipalName} />,
        },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={user?.id} />,
        },
        {
          icon: <CippIcons.CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(user?.createdDateTime)} />
            </>
          ),
        },
      ]
    : []

  const actions = [
    {
      label: 'Migrate to Shortcuts folder',
      type: 'POST',
      icon: <CippIcons.Shortcut />,
      url: '/api/ExecMigrateOneDriveShortCuts',
      data: {
        id: 'id',
        username: 'userPrincipalName',
      },
      relatedQueryKeys: [shortcutsQueryKey],
      confirmText: 'Move OneDrive shortcut [name] from the root into the Shortcuts folder?',
      condition: (row) => canWriteUser && row?.location === 'OneDrive root',
    },
    {
      label: 'Remove Shortcut',
      type: 'POST',
      icon: <CippIcons.Delete />,
      url: '/api/ExecRemoveOneDriveShortCut',
      data: {
        id: 'id',
        name: 'name',
        username: 'userPrincipalName',
      },
      relatedQueryKeys: [shortcutsQueryKey],
      confirmText: 'Remove OneDrive shortcut [name] for this user?',
      color: 'danger',
      condition: () => canWriteUser,
    },
  ]

  return (
    <>
      <CippHead title="OneDrive Shortcuts" />
      <HeaderedTabbedLayout
        tabOptions={tabOptions}
        title={title}
        titleControl={
          <CippUserSwitcher title={title} currentUserId={userId} tenantFilter={tenant} />
        }
        subtitle={subtitle}
        isFetching={userRequest.isLoading}
      >
        {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
        {userRequest.isSuccess && (
          <Box sx={{ flexGrow: 1, py: 1 }}>
            <CippDataTable
              title="OneDrive Shortcuts"
              queryKey={shortcutsQueryKey}
              simpleColumns={['name', 'location', 'siteUrl', 'createdDateTime', 'lastModifiedDateTime']}
              actions={actions}
              cardButton={
                canWriteUser ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CippIcons.Add />}
                    onClick={addDialog.handleOpen}
                  >
                    Add Shortcut
                  </Button>
                ) : null
              }
              api={{
                url: '/api/ListUserOneDriveShortcuts',
                data: {
                  userId,
                  userPrincipalName,
                  tenantFilter: tenant,
                },
              }}
            />
          </Box>
        )}
      </HeaderedTabbedLayout>
      {user && (
        <CippApiDialog
          createDialog={addDialog}
          title="Add OneDrive Shortcut"
          row={user}
          defaultvalues={{
            destination: { label: 'OneDrive root', value: 'root' },
          }}
          relatedQueryKeys={[shortcutsQueryKey]}
          fields={[
            {
              type: 'autoComplete',
              name: 'siteUrl',
              label: 'Select a Site',
              multiple: false,
              creatable: true,
              validators: { required: 'Please select or enter a SharePoint site URL' },
              api: {
                url: '/api/ListSites',
                data: { type: 'SharePointSiteUsage', URLOnly: true },
                labelField: 'webUrl',
                valueField: 'webUrl',
                queryKey: `sharepointSites-${tenant}`,
              },
            },
            {
              type: 'autoComplete',
              name: 'destination',
              label: 'Shortcut location',
              multiple: false,
              creatable: false,
              options: [
                { label: 'OneDrive root', value: 'root' },
                { label: 'Shortcuts folder (Microsoft UI)', value: 'shortcuts' },
              ],
              validators: { required: 'Please select a shortcut location' },
            },
          ]}
          api={{
            url: '/api/ExecOneDriveShortCut',
            type: 'POST',
            data: {
              username: 'userPrincipalName',
              userid: 'id',
            },
            confirmText: 'Select a SharePoint site and where to create the OneDrive shortcut:',
          }}
        />
      )}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
