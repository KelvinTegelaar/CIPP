import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Alert } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormSkeleton from '../../../../components/CippFormPages/CippFormSkeleton'
import CippGSASecurityProfileForm, {
  securityProfileToBody,
  securityProfileToForm,
} from '../../../../components/CippFormPages/CippGSASecurityProfileForm'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const router = useRouter()
  const { id } = router.query
  const tenantFilter = useSettings().currentTenant
  const formControl = useForm({ mode: 'onChange' })
  const profiles = ApiGetCall({
    url: `/api/ListGSASecurityProfiles?tenantFilter=${tenantFilter}`,
    queryKey: `ListGSASecurityProfiles-edit-${tenantFilter}`,
    waiting: !!id && !!tenantFilter,
  })
  const profile = profiles.data?.find?.((row) => row.id === id)

  useEffect(() => {
    if (!profile) return
    formControl.reset({
      id,
      ...securityProfileToForm({
        ...profile,
        policies: (profile.policies ?? []).map((link) => ({
          ...link,
          policy: { label: link.policy?.name, value: link.policy?.id },
        })),
      }),
    })
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippFormPage
      title={profile ? `Security Profile: ${profile.name}` : 'Security Profile'}
      formPageType="Edit"
      backButtonTitle="Security Profiles"
      formControl={formControl}
      postUrl="/api/EditGSASecurityProfile"
      queryKey={['ListGSASecurityProfiles*', 'ListGSAFilteringPolicies*']}
      customDataformatter={(values) => ({
        tenantFilter,
        ID: values.id,
        ...securityProfileToBody(values),
      })}
    >
      {profile ? (
        <CippGSASecurityProfileForm
          formControl={formControl}
          nameHelperText="Changes apply to this tenant straight away."
          policyLabel="Filtering policy"
          policyApi={{
            url: '/api/ListGSAFilteringPolicies',
            labelField: 'name',
            valueField: 'id',
            queryKey: 'ListGSAFilteringPolicies-picker',
          }}
          isBaseline={profile.priority === 65000}
        />
      ) : profiles.isSuccess || profiles.isError ? (
        <Alert severity="warning">
          {profiles.isError
            ? (profiles.error?.response?.data?.Results ??
              'The security profiles could not be loaded.')
            : 'This security profile was not found in the selected tenant.'}
        </Alert>
      ) : (
        <CippFormSkeleton layout={[2, 1, 2, 3]} />
      )}
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
