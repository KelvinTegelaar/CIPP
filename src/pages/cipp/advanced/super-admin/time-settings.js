import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { useForm } from 'react-hook-form'
import { Grid } from '@mui/system'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useEffect } from 'react'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import { useTimezones } from '../../../../hooks/use-timezones'
import tabOptions from './tabOptions'
import { Alert, Typography } from '@mui/material'

const Page = () => {
  const pageTitle = 'Time Settings'

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      Timezone: { label: 'UTC', value: 'UTC' },
    },
  })

  // Get timezone and backend info
  const backendInfo = ApiGetCall({
    url: '/api/ExecBackendURLs',
    queryKey: 'backendInfo',
  })

  const { timezones, loading: timezonesLoading } = useTimezones()

  useEffect(() => {
    if (backendInfo.isSuccess && backendInfo.data) {
      const tzStr = backendInfo.data?.Results?.Timezone || 'UTC'
      const tzOption = (timezones || []).find(
        (o) => o?.value === tzStr || o?.alternativeName === tzStr
      ) || {
        label: tzStr,
        value: tzStr,
      }
      formControl.reset({ Timezone: tzOption })
    }
  }, [backendInfo.isSuccess, backendInfo.data, timezones])

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecTimeSettings"
      queryKey="backendInfo"
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={12}>
          <Alert severity="info">
            Configure the timezone for CIPP. This setting will determine which timezone is used when
            background tasks run. If no timezone is selected, UTC will be used by default.
          </Alert>
        </Grid>

        {!backendInfo.isSuccess && (
          <Grid size={12}>
            <Alert severity="info">Loading backend information...</Alert>
          </Grid>
        )}

        {timezonesLoading && (
          <Grid size={12}>
            <Alert severity="info">Loading timezones...</Alert>
          </Grid>
        )}

        {backendInfo.isSuccess && (
          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              name="Timezone"
              label="Timezone"
              multiple={false}
              formControl={formControl}
              options={timezones?.length ? timezones : [{ label: 'UTC', value: 'UTC' }]}
              creatable={false}
              validators={{ required: 'Please select a timezone' }}
            />
          </Grid>
        )}
      </Grid>
    </CippFormPage>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
