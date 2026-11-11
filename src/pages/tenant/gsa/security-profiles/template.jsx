import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippGSASecurityProfileForm, {
  securityProfileDefaults,
  securityProfileToBody,
  securityProfileToForm,
} from '../../../../components/CippFormPages/CippGSASecurityProfileForm'
import { ApiGetCall } from '../../../../api/ApiCall'

const Page = () => {
  const router = useRouter()
  const { GUID } = router.query
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: securityProfileDefaults,
  })
  const template = ApiGetCall({
    url: `/api/ListGSASecurityProfileTemplates?GUID=${GUID}`,
    queryKey: `GSASecurityProfileTemplate-${GUID}`,
    waiting: !!GUID,
  })

  useEffect(() => {
    if (template.isSuccess && template.data?.[0]) {
      formControl.reset({
        GUID: template.data[0].GUID,
        ...securityProfileToForm(template.data[0]),
      })
    }
  }, [template.isSuccess, template.data]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippFormPage
      title="Security Profile Template"
      formPageType={GUID ? 'Edit' : 'Add'}
      backButtonTitle="Security Profile Templates"
      formControl={formControl}
      postUrl="/api/AddGSASecurityProfileTemplate"
      queryKey={[
        'ListGSASecurityProfileTemplates',
        `GSASecurityProfileTemplate-${GUID}`,
      ]}
      customDataformatter={(values) => ({
        GUID: values.GUID,
        ...securityProfileToBody(values),
      })}
    >
      <CippGSASecurityProfileForm
        formControl={formControl}
        nameHelperText="Used as the security profile name in every tenant this is deployed to."
        policyLabel="Filtering policy template"
        policyApi={{
          url: '/api/ListGSAFilteringPolicyTemplates',
          labelField: 'name',
          valueField: 'GUID',
          queryKey: 'ListGSAFilteringPolicyTemplates',
        }}
      />
    </CippFormPage>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
