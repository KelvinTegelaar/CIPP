import React from 'react'
import { Box } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippCAPolicyBuilder, {
  extractCAPolicyJSON,
} from '../../../../components/CippComponents/CippCAPolicyBuilder'

const CreateCATemplate = () => {
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      state: {
        label: 'Report-only',
        value: 'enabledForReportingButNotEnforced',
      },
      conditions: { clientAppTypes: [{ label: 'All', value: 'all' }] },
      grantControls: {
        operator: {
          label: 'Require one of the selected controls',
          value: 'OR',
        },
      },
    },
  })

  const customDataFormatter = (values) => {
    const policy = extractCAPolicyJSON(values)
    // The default operator on its own is not a grant control
    if (Object.keys(policy.grantControls ?? {}).join() === 'operator') {
      delete policy.grantControls
    }
    return policy
  }

  return (
    <CippFormPage
      title="Create CA Template"
      formControl={formControl}
      queryKey={['CATemplates']}
      backButtonTitle="Conditional Access Templates"
      postUrl="/api/ExecCreateCATemplate"
      customDataformatter={customDataFormatter}
      formPageType="Add"
    >
      <Box sx={{ my: 2 }}>
        <CippCAPolicyBuilder
          formControl={formControl}
          showNamedLocations={true}
        />
      </Box>
    </CippFormPage>
  )
}

CreateCATemplate.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default CreateCATemplate
