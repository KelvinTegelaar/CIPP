import { Stack, Typography } from '@mui/material'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import CippFormComponent from '../CippComponents/CippFormComponent'
import CippFormSkeleton from '../CippFormPages/CippFormSkeleton'
import { CippBaselineStandardSettings } from './CippBaselineStandardSettings'

const optionValue = (option) =>
  option && typeof option === 'object' ? option.value : option

const AddStandardFields = ({ formHook, standard, baselines }) => {
  const selectedBaseline = useWatch({
    control: formHook.control,
    name: 'baselineId',
  })
  const baseline = baselines.find(
    (entry) => entry.GUID === optionValue(selectedBaseline)
  )
  const stageOptions = (baseline?.stages ?? []).map((stage, index) => ({
    label: stage.name || `Stage ${index + 1}`,
    value: index + 1,
  }))
  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {standard.label} is added to the baseline you pick with the settings
        below. The baseline applies it to its tenants on the next run.
      </Typography>
      <CippFormComponent
        type="autoComplete"
        name="baselineId"
        label="Baseline"
        formControl={formHook}
        multiple={false}
        creatable={false}
        options={baselines.map((entry) => ({
          label: entry.templateName,
          value: entry.GUID,
        }))}
        validators={{ required: { value: true, message: 'Pick a baseline' } }}
      />
      {stageOptions.length > 1 && (
        <CippFormComponent
          type="autoComplete"
          name="stage"
          label="Stage"
          formControl={formHook}
          multiple={false}
          creatable={false}
          options={stageOptions}
        />
      )}
      <CippFormComponent
        type="switch"
        name="remediateEnabled"
        label="Remediate automatically when the tenant drifts"
        formControl={formHook}
      />
      <CippBaselineStandardSettings
        standard={standard}
        formControl={formHook}
        namePrefix="variables"
      />
    </Stack>
  )
}

// Adds one standard to an existing baseline from anywhere in CIPP. The settings fields are the
// same CippBaselineStandardSettings the baseline editor renders, and the save goes through
// ExecBaselineAddStandard, which re-saves the baseline with New-CIPPBaseline.
export const CippBaselineAddStandardDialog = ({
  createDialog,
  standardName,
  relatedQueryKeys = [],
}) => {
  const catalogApi = ApiGetCall({
    url: '/api/ListBaselineStandards',
    queryKey: 'ListBaselineStandards',
  })
  const baselinesApi = ApiGetCall({
    url: '/api/ListBaselines',
    queryKey: 'ListBaselines',
  })
  const catalog = Array.isArray(catalogApi.data) ? catalogApi.data : []
  const baselines = Array.isArray(baselinesApi.data) ? baselinesApi.data : []
  const standard = catalog.find((entry) => entry.name === standardName)
  const label = standard?.label ?? standardName

  return (
    <CippApiDialog
      createDialog={createDialog}
      title={`Add ${label} to a baseline`}
      children={({ formHook }) =>
        standard ? (
          <AddStandardFields
            formHook={formHook}
            standard={standard}
            baselines={baselines}
          />
        ) : (
          <CippFormSkeleton layout={[1, 1]} />
        )
      }
      api={{
        url: '/api/ExecBaselineAddStandard',
        type: 'POST',
        data: { standard: `!${standardName}` },
        confirmText: `Add ${label} to the selected baseline?`,
        relatedQueryKeys: ['ListBaselines', ...relatedQueryKeys],
      }}
      row={{ standardName }}
    />
  )
}

export default CippBaselineAddStandardDialog
