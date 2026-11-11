import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippIcons } from '../../../../utils/icon-registry'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions.json'

const actions = [
  {
    label: 'Edit Policy',
    link: '/tenant/gsa/filtering-policies/edit?id=[id]',
    icon: <CippIcons.Edit />,
    color: 'info',
    hideBulk: true,
  },
  {
    label: 'Save as Template',
    type: 'POST',
    url: '/api/AddGSAFilteringPolicyTemplate',
    relatedQueryKeys: ['ListGSAFilteringPolicyTemplates*'],
    customDataformatter: (row) => ({
      name: row.name,
      description: row.description,
      action: row.action,
      policyRules: row.policyRules,
    }),
    confirmText:
      'Save [name] as a filtering policy template? A template with the same name is not overwritten.',
    icon: <CippIcons.Book />,
    color: 'info',
    hideBulk: true,
    multiPost: false,
  },
  {
    label: 'Delete Policy',
    type: 'POST',
    url: '/api/RemoveGSAFilteringPolicy',
    data: { ID: 'id' },
    confirmText:
      'Delete the filtering policy [name] from this tenant? A policy still linked by a security profile cannot be deleted.',
    icon: <CippIcons.Delete />,
    color: 'danger',
    multiPost: false,
  },
]

const Page = () => {
  const tenant = useSettings().currentTenant
  return (
    <CippTablePage
      title="Filtering Policies"
      apiUrl="/api/ListGSAFilteringPolicies"
      queryKey={`ListGSAFilteringPolicies-${tenant}`}
      actions={actions}
      offCanvas={{
        children: (row) => <CippJsonView object={row} defaultOpen={true} />,
        size: 'xl',
      }}
      simpleColumns={['name', 'action', 'description', 'securityProfiles']}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
