import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippGSAFilteringPolicyForm, {
  filteringPolicyDefaults,
  filteringPolicyToBody,
  filteringPolicyToForm,
} from '../../../../components/CippFormPages/CippGSAFilteringPolicyForm'
import { ApiGetCall } from '../../../../api/ApiCall'

const Page = () => {
  const router = useRouter()
  const { GUID } = router.query
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: filteringPolicyDefaults,
  })
  const template = ApiGetCall({
    url: `/api/ListGSAFilteringPolicyTemplates?GUID=${GUID}`,
    queryKey: `GSAFilteringPolicyTemplate-${GUID}`,
    waiting: !!GUID,
  })

  useEffect(() => {
    if (template.isSuccess && template.data?.[0]) {
      formControl.reset({
        GUID: template.data[0].GUID,
        ...filteringPolicyToForm(template.data[0]),
      })
    }
  }, [template.isSuccess, template.data]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <CippFormPage
      title="Filtering Policy Template"
      formPageType={GUID ? 'Edit' : 'Add'}
      backButtonTitle="Filtering Policy Templates"
      formControl={formControl}
      postUrl="/api/AddGSAFilteringPolicyTemplate"
      queryKey={[
        'ListGSAFilteringPolicyTemplates',
        `GSAFilteringPolicyTemplate-${GUID}`,
      ]}
      customDataformatter={(values) => ({
        GUID: values.GUID,
        ...filteringPolicyToBody(values),
      })}
    >
      <CippGSAFilteringPolicyForm
        formControl={formControl}
        nameHelperText="Used as the policy name in every tenant this is deployed to."
      />
    </CippFormPage>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
