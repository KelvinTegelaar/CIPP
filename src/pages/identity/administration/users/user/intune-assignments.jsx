import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import ReactTimeAgo from 'react-time-ago'
import { Box, Button } from '@mui/material'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippUserSwitcher } from '../../../../../components/CippComponents/CippUserSwitcher'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippIntuneAssignmentsTable } from '../../../../../components/CippComponents/CippIntuneAssignmentsTable'
import tabOptions from './tabOptions'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { userId } = router.query
  const tenant = userSettingsDefaults.currentTenant

  // Same request and query key as the other user tabs, so switching tabs reuses the cache
  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${tenant}`,
    queryKey: `ListUsers-${userId}`,
  })
  const user = userRequest.data?.[0]
  const title = userRequest.isSuccess ? user?.displayName : 'Loading...'

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <CippIcons.Mail />,
          text: (
            <CippCopyToClipBoard type="chip" text={user?.userPrincipalName} />
          ),
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
        {
          icon: <CippIcons.Launch />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://entra.microsoft.com/${tenant}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ]
    : []

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippUserSwitcher
          title={title}
          currentUserId={userId}
          tenantFilter={tenant}
        />
      }
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
      <CippHead
        title={title ? `${title} - Intune Assignments` : 'Intune Assignments'}
      />
      {userRequest.isLoading && <CippFormSkeleton layout={[1, 2]} />}
      {userRequest.isSuccess && (
        <Box sx={{ flexGrow: 1, py: 1 }}>
          <CippIntuneAssignmentsTable
            tenantFilter={tenant}
            type="user"
            id={userId}
          />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
