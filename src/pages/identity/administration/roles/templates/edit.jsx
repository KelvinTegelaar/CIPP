import { useEffect } from 'react'
import { Box } from '@mui/material'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormPage from '../../../../../components/CippFormPages/CippFormPage'
import {
  CippPIMRoleSettingsTemplateForm,
  templateToFormValues,
} from '../../../../../components/CippFormPages/CippPIMRoleSettingsTemplateForm'
import { Layout as DashboardLayout } from '../../../../../layouts/index'

const Page = () => {
  const router = useRouter()
  const { id } = router.query

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: templateToFormValues(null),
  })

  const template = ApiGetCall({
    url: `/api/ListPIMRoleSettingsTemplates?GUID=${id}`,
    queryKey: `PIMRoleSettingsTemplate-${id}`,
    waiting: !!id,
  })

  useEffect(() => {
    if (template.isSuccess && template.data?.[0]) {
      formControl.reset(templateToFormValues({ ...template.data[0], GUID: id }))
    }
  }, [template.isSuccess, template.data])

  return (
    <CippFormPage
      resetForm={false}
      formPageType="Edit"
      queryKey="ListPIMRoleSettingsTemplates*"
      formControl={formControl}
      title="PIM Template"
      backButtonTitle="PIM Templates"
      postUrl="/api/AddPIMRoleSettingsTemplate"
    >
      <Box sx={{ my: 2 }}>
        <CippPIMRoleSettingsTemplateForm formControl={formControl} />
      </Box>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
