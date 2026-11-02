import { useEffect } from 'react'
import { Box } from '@mui/material'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { ApiGetCall } from '../../../../api/ApiCall'
import CippEnrollmentRestrictionForm, {
  enrollmentRestrictionDefaults,
  enrollmentRestrictionToForm,
} from '../../../../components/CippFormPages/CippEnrollmentRestrictionForm'

const Page = () => {
  const router = useRouter()
  const { id } = router.query
  const formControl = useForm({ mode: 'onChange', defaultValues: enrollmentRestrictionDefaults })

  const { data: templates, isFetching } = ApiGetCall({
    url: `/api/ListEnrollmentRestrictionTemplates?id=${id}`,
    queryKey: `EnrollmentRestrictionTemplate-${id}`,
    waiting: Boolean(id),
  })

  useEffect(() => {
    const template = templates?.[0]
    if (template) {
      formControl.reset({ ...enrollmentRestrictionToForm(template), GUID: template.GUID })
    }
  }, [templates, formControl])

  return (
    <CippFormPage
      resetForm={false}
      queryKey={[
        'ListEnrollmentRestrictionTemplates',
        'EnrollmentRestrictionTemplates',
        `EnrollmentRestrictionTemplate-${id}`,
      ]}
      formControl={formControl}
      title="Enrollment Restriction Template"
      formPageType="Edit"
      backButtonTitle="Enrollment Restriction Templates"
      backUrl="/endpoint/autopilot/enrollment-restriction-templates"
      postUrl="/api/AddEnrollmentRestrictionTemplate"
      isFetching={isFetching}
    >
      <Box sx={{ my: 2 }}>
        <CippEnrollmentRestrictionForm formControl={formControl} />
      </Box>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
