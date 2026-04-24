import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippAutopilotStatusPageDrawer } from '../../../../components/CippComponents/CippAutopilotStatusPageDrawer'

const Page = () => {
  const pageTitle = 'Autopilot Status Pages'

  const simpleColumns = [
    'Tenant',
    'displayName',
    'Description',
    'installProgressTimeoutInMinutes',
    'showInstallationProgress',
    'blockDeviceSetupRetryByUser',
    'allowDeviceResetOnInstallFailure',
    'allowDeviceUseOnInstallFailure',
  ]

  // No actions specified in the original file, so none are included here.

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: 'deviceManagement/deviceEnrollmentConfigurations',
        $expand: 'assignments',
        $filter:
          "deviceEnrollmentConfigurationType eq 'windows10EnrollmentCompletionPageConfiguration'",
      }}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAutopilotStatusPageDrawer />
        </>
      }
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
