import { useEffect } from 'react'
import { Alert, Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippAdministrativeUnitForm from '../../../../components/CippFormPages/CippAdministrativeUnitForm'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall'

const Page = () => {
  const router = useRouter()
  const { id } = router.query
  const tenantFilter = useSettings().currentTenant
  const formControl = useForm({ mode: 'onChange' })

  const unitRequest = ApiGetCall({
    url: '/api/ListAdministrativeUnits',
    data: { tenantFilter, ID: id },
    queryKey: `AdministrativeUnit-${tenantFilter}-${id}`,
    waiting: !!id,
  })
  const unit = Array.isArray(unitRequest.data) ? unitRequest.data[0] : undefined
  const membersRequest = ApiGetCall({
    url: '/api/ListAdministrativeUnitMembers',
    data: { tenantFilter, ID: id },
    queryKey: `AdministrativeUnitMembers-${id}`,
    waiting: !!id,
  })
  const currentMembers = Array.isArray(membersRequest.data)
    ? membersRequest.data
    : []

  useEffect(() => {
    if (unit) {
      formControl.reset({
        displayName: unit.displayName,
        description: unit.description ?? '',
        visibility: unit.visibility,
        membershipType: unit.membershipType,
        membershipRule: unit.membershipRule ?? '',
        pauseProcessing: unit.membershipRuleProcessingState === 'Paused',
        isMemberManagementRestricted: unit.isMemberManagementRestricted,
        AddMember: [],
        AddDevice: [],
        RemoveMember: [],
      })
    }
  }, [unit, formControl])

  // Send only what changed, so an unchanged rule is not re-submitted and re-evaluated.
  const toRequest = (values) => {
    const changes = {
      tenantFilter,
      ID: id,
      currentDisplayName: unit?.displayName,
    }
    if (values.displayName !== unit?.displayName)
      changes.displayName = values.displayName
    if ((values.description ?? '') !== (unit?.description ?? ''))
      changes.description = values.description
    if (values.visibility !== unit?.visibility)
      changes.visibility = values.visibility
    const ruleChanged =
      (values.membershipRule ?? '') !== (unit?.membershipRule ?? '')
    if (
      values.membershipType !== unit?.membershipType ||
      (values.membershipType === 'Dynamic' && ruleChanged)
    ) {
      changes.membershipType = values.membershipType
      changes.membershipRule = values.membershipRule
    }
    if (values.membershipType === 'Dynamic') {
      const state = values.pauseProcessing ? 'Paused' : 'On'
      if (
        state !== (unit?.membershipRuleProcessingState ?? 'On') ||
        changes.membershipType
      ) {
        changes.membershipRuleProcessingState = state
      }
    }
    // A dynamic unit's members come from its rule, so member changes only go with an assigned unit.
    if (values.membershipType === 'Assigned') {
      const toMember = ({ value, label }) => ({ value, label })
      changes.AddMember = [
        ...(values.AddMember ?? []),
        ...(values.AddDevice ?? []),
      ].map(toMember)
      changes.RemoveMember = (values.RemoveMember ?? []).map(toMember)
    }
    return changes
  }

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={[
        'AdministrativeUnits*',
        `AdministrativeUnit-${tenantFilter}-${id}`,
        `AdministrativeUnitMembers-${id}`,
      ]}
      title={
        unit?.displayName
          ? `Administrative Unit - ${unit.displayName}`
          : 'Administrative Unit'
      }
      formPageType="Edit"
      hideSubmit={!unit}
      backButtonTitle="Administrative Units"
      postUrl="/api/EditAdministrativeUnit"
      customDataformatter={toRequest}
      resetForm={false}
    >
      {!id && (
        <Alert severity="info" sx={{ mb: 1 }}>
          No administrative unit selected. Open this page from the
          Administrative Units list.
        </Alert>
      )}
      {unitRequest.isError && (
        <Alert severity="error" sx={{ mb: 1 }}>
          The administrative unit could not be loaded.
        </Alert>
      )}
      <Box sx={{ my: 2 }}>
        <CippAdministrativeUnitForm
          formControl={formControl}
          tenantFilter={tenantFilter}
          isEdit
          disabled={unitRequest.isFetching || !unit}
          currentMembers={currentMembers}
        />
      </Box>
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
