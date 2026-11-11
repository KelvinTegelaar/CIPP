import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { CippIcons } from '../../../../utils/icon-registry'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions.json'

const actions = [
  {
    label: 'Edit Profile',
    link: '/tenant/gsa/security-profiles/edit?id=[id]',
    icon: <CippIcons.Edit />,
    color: 'info',
    hideBulk: true,
  },
  {
    label: 'Save as Template',
    type: 'POST',
    url: '/api/ExecSaveGSASecurityProfileTemplate',
    relatedQueryKeys: [
      'ListGSASecurityProfileTemplates*',
      'ListGSAFilteringPolicyTemplates*',
    ],
    data: { ID: 'id' },
    confirmText:
      'Save [name] as a security profile template? Its filtering policies reuse templates with the same name, or get new ones. If an existing template differs from the tenant policy, nothing is saved.',
    icon: <CippIcons.Book />,
    color: 'info',
    hideBulk: true,
    multiPost: false,
    condition: (row) => row.priority !== 65000,
  },
  {
    label: 'Delete Profile',
    type: 'POST',
    url: '/api/RemoveGSASecurityProfile',
    data: { ID: 'id' },
    confirmText:
      'Delete the security profile [name] from this tenant? Its filtering policies stay. A profile a Conditional Access policy applies cannot be deleted.',
    icon: <CippIcons.Delete />,
    color: 'danger',
    multiPost: false,
    condition: (row) => row.priority !== 65000,
  },
]

const Page = () => {
  const tenant = useSettings().currentTenant
  return (
    <CippTablePage
      title="Security Profiles"
      apiUrl="/api/ListGSASecurityProfiles"
      queryKey={`ListGSASecurityProfiles-${tenant}`}
      actions={actions}
      offCanvas={{
        children: (row) => <CippJsonView object={row} defaultOpen={true} />,
        size: 'xl',
      }}
      simpleColumns={[
        'name',
        'priority',
        'state',
        'filteringPolicies',
        'conditionalAccessPolicyNames',
        'description',
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
