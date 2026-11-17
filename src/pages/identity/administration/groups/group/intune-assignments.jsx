import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { Box } from '@mui/material'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippIntuneAssignmentsTable } from '../../../../../components/CippComponents/CippIntuneAssignmentsTable'
import tabOptions from './tabOptions'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { groupId } = router.query
  const tenantFilter =
    router.query.tenantFilter ?? userSettingsDefaults.currentTenant

  // Same request and query key as the group overview tab, so switching tabs reuses the cache
  const groupRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: { Endpoint: `groups/${groupId}`, tenantFilter },
    queryKey: `Group-${groupId}`,
    waiting: Boolean(groupId),
  })
  const results = groupRequest.data?.Results
  const group = Array.isArray(results)
    ? results[0]
    : (results ?? groupRequest.data)

  const title = !groupId
    ? 'No Group Selected'
    : groupRequest.isSuccess
      ? group?.displayName
      : 'Loading...'

  const subtitle = groupRequest.isSuccess
    ? [
        {
          icon: <CippIcons.Mail />,
          text: (
            <CippCopyToClipBoard
              type="chip"
              text={group?.mail || group?.mailNickname || 'N/A'}
            />
          ),
        },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={group?.id} />,
        },
      ]
    : []

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippEntitySwitcher
          title={title}
          currentId={groupId}
          queryParamKey="groupId"
          entityName="group"
          api={{
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'groups',
              tenantFilter,
              $select: 'id,displayName,mail',
              $count: true,
              $orderby: 'displayName',
              $top: 999,
            },
            queryKey: `GroupSwitcher-${tenantFilter}`,
          }}
          getPrimary={(entry) => entry.displayName}
          getSecondary={(entry) => entry.mail}
        />
      }
      subtitle={subtitle}
      isFetching={!!groupId && groupRequest.isLoading}
    >
      <CippHead
        title={title ? `${title} - Intune Assignments` : 'Intune Assignments'}
      />
      {groupRequest.isLoading && <CippFormSkeleton layout={[1, 2]} />}
      {groupRequest.isSuccess && (
        <Box sx={{ flexGrow: 1, py: 1 }}>
          <CippIntuneAssignmentsTable
            tenantFilter={tenantFilter}
            type="group"
            id={groupId}
            allowNested
          />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
