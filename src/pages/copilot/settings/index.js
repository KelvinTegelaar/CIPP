import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { useSettings } from '../../../hooks/use-settings'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const queryKey = `ListCopilotSettings-${currentTenant}`

  const actions = [
    {
      label: 'Set Status',
      type: 'POST',
      url: '/api/ExecCopilotSettings',
      icon: <Cog6ToothIcon />,
      data: { settingId: 'settingId' },
      fields: [
        {
          type: 'autoComplete',
          name: 'value',
          label: 'Desired state',
          multiple: false,
          creatable: false,
          options: [
            { label: 'Enabled', value: '1' },
            { label: 'Disabled', value: '0' },
            { label: 'Not configured', value: 'clear' },
          ],
        },
      ],
      confirmText: "Set '[setting]' to the selected state?",
      relatedQueryKeys: [queryKey],
    },
  ]

  return (
    <CippTablePage
      title="Copilot Settings"
      apiUrl="/api/ListCopilotSettings"
      queryKey={queryKey}
      simpleColumns={['setting', 'state']}
      actions={actions}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
