import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import CippFormPage from '../../../../../components/CippFormPages/CippFormPage'
import {
  CippPIMRoleSettingsTemplateForm,
  templateToFormValues,
} from '../../../../../components/CippFormPages/CippPIMRoleSettingsTemplateForm'
import { Layout as DashboardLayout } from '../../../../../layouts/index'

const Page = () => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: templateToFormValues(null),
  })

  return (
    <CippFormPage
      resetForm={false}
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
