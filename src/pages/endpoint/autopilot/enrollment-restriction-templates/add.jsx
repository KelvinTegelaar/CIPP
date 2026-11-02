import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippEnrollmentRestrictionForm, {
  enrollmentRestrictionDefaults,
} from '../../../../components/CippFormPages/CippEnrollmentRestrictionForm'

const Page = () => {
  const formControl = useForm({ mode: 'onChange', defaultValues: enrollmentRestrictionDefaults })

  return (
    <CippFormPage
      resetForm={false}
      queryKey={['ListEnrollmentRestrictionTemplates', 'EnrollmentRestrictionTemplates']}
      formControl={formControl}
      title="Enrollment Restriction Template"
      backButtonTitle="Enrollment Restriction Templates"
      backUrl="/endpoint/autopilot/enrollment-restriction-templates"
      postUrl="/api/AddEnrollmentRestrictionTemplate"
    >
      <Box sx={{ my: 2 }}>
        <CippEnrollmentRestrictionForm formControl={formControl} />
      </Box>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
