import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippAdministrativeUnitForm from '../../../../components/CippFormPages/CippAdministrativeUnitForm'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'

const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      visibility: 'Public',
      membershipType: 'Assigned',
      isMemberManagementRestricted: false,
      members: [],
      memberDevices: [],
    },
  })

  // Users, groups and devices go up as one member list; a dynamic unit takes its members from the rule.
  const toRequest = ({ members, memberDevices, ...values }) => ({
    ...values,
    tenantFilter,
    members:
      values.membershipType === 'Assigned'
        ? [...(members ?? []), ...(memberDevices ?? [])].map(
            ({ value, label }) => ({ value, label })
          )
        : [],
  })

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`AdministrativeUnits-${tenantFilter}`}
      title="Administrative Unit"
      backButtonTitle="Administrative Units"
      postUrl="/api/AddAdministrativeUnit"
      customDataformatter={toRequest}
    >
      <Box sx={{ my: 2 }}>
        <CippAdministrativeUnitForm
          formControl={formControl}
          tenantFilter={tenantFilter}
        />
      </Box>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
