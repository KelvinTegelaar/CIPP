import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Alert } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormSkeleton from '../../../../components/CippFormPages/CippFormSkeleton'
import CippGSAFilteringPolicyForm, {
  filteringPolicyDefaults,
  filteringPolicyToBody,
  filteringPolicyToForm,
} from '../../../../components/CippFormPages/CippGSAFilteringPolicyForm'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const router = useRouter()
  const { id } = router.query
  const tenantFilter = useSettings().currentTenant
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: filteringPolicyDefaults,
  })
  const policies = ApiGetCall({
    url: `/api/ListGSAFilteringPolicies?tenantFilter=${tenantFilter}`,
    queryKey: `ListGSAFilteringPolicies-edit-${tenantFilter}`,
    waiting: !!id && !!tenantFilter,
  })
  const policy = policies.data?.find?.((row) => row.id === id)

  useEffect(() => {
    if (policy) formControl.reset({ id, ...filteringPolicyToForm(policy) })
  }, [policy]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippFormPage
      title={policy ? `Filtering Policy: ${policy.name}` : 'Filtering Policy'}
      formPageType={id ? 'Edit' : 'Add'}
      backButtonTitle="Filtering Policies"
      formControl={formControl}
      postUrl="/api/EditGSAFilteringPolicy"
      queryKey={['ListGSAFilteringPolicies*', 'ListGSASecurityProfiles*']}
      customDataformatter={(values) => ({
        tenantFilter,
        ID: values.id,
        ...filteringPolicyToBody(values),
      })}
    >
      {!id || policy ? (
        <CippGSAFilteringPolicyForm
          formControl={formControl}
          nameHelperText="Changes apply to this tenant straight away."
        />
      ) : policies.isSuccess || policies.isError ? (
        <Alert severity="warning">
          {policies.isError
            ? (policies.error?.response?.data?.Results ??
              'The filtering policies could not be loaded.')
            : 'This filtering policy was not found in the selected tenant.'}
        </Alert>
      ) : (
        <CippFormSkeleton layout={[2, 1, 2, 3]} />
      )}
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
