import { useFieldArray } from 'react-hook-form'
import {
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CippFormComponent from '../CippComponents/CippFormComponent'
import { CippIcons } from '../../utils/icon-registry'

const newLink = (index) => ({
  priority: 100 * (index + 1),
  enabled: true,
  logging: true,
})

export const securityProfileDefaults = { enabled: true, policies: [newLink(0)] }

// Links must carry policy as a { label, value } option
export const securityProfileToForm = (profile) => ({
  name: profile.name,
  description: profile.description,
  priority: profile.priority,
  enabled: profile.state === 'enabled',
  policies: (profile.policies ?? []).map((link) => ({
    policy: link.policy,
    priority: link.priority,
    enabled: link.state === 'enabled',
    logging: link.loggingState === 'enabled',
  })),
})

export const securityProfileToBody = (values) => ({
  name: values.name,
  description: values.description,
  priority: Number(values.priority),
  state: values.enabled ? 'enabled' : 'disabled',
  policies: (values.policies ?? []).map((link) => ({
    policy: link.policy,
    priority: Number(link.priority),
    state: link.enabled ? 'enabled' : 'disabled',
    loggingState: link.logging ? 'enabled' : 'disabled',
  })),
})

const CippGSASecurityProfileForm = ({
  formControl,
  nameHelperText,
  policyLabel,
  policyApi,
  isBaseline = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: 'policies',
  })

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="textField"
            name="name"
            label="Name"
            helperText={nameHelperText}
            formControl={formControl}
            validators={{ required: 'A name is required' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CippFormComponent
            type="number"
            name="priority"
            label="Priority"
            helperText={
              isBaseline
                ? 'The baseline profile always runs last, at 65000.'
                : '100 to 64999. Lower numbers are processed first.'
            }
            disabled={isBaseline}
            formControl={formControl}
            validators={{
              required: 'A priority is required',
              min: { value: 100, message: 'The lowest priority is 100' },
              max: isBaseline
                ? undefined
                : { value: 64999, message: 'The highest priority is 64999' },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <CippFormComponent
            type="switch"
            name="enabled"
            label="Enabled"
            formControl={formControl}
          />
        </Grid>
        <Grid size={12}>
          <CippFormComponent
            type="textField"
            name="description"
            label="Description"
            formControl={formControl}
          />
        </Grid>
      </Grid>

      <Typography variant="h6">Filtering policies</Typography>
      {fields.map((field, index) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              Policy {index + 1}
            </Typography>
            <Tooltip title="Remove policy">
              <span>
                <IconButton
                  size="small"
                  aria-label="Remove policy"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <CippIcons.DeleteOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                name={`policies.${index}.policy`}
                label={policyLabel}
                api={policyApi}
                multiple={false}
                creatable={false}
                formControl={formControl}
                validators={{ required: 'Choose a filtering policy' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CippFormComponent
                type="number"
                name={`policies.${index}.priority`}
                label="Priority"
                formControl={formControl}
                validators={{
                  required: 'A priority is required',
                  min: { value: 100, message: 'The lowest priority is 100' },
                  max: {
                    value: 65000,
                    message: 'The highest priority is 65000',
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CippFormComponent
                type="switch"
                name={`policies.${index}.enabled`}
                label="Enabled"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CippFormComponent
                type="switch"
                name={`policies.${index}.logging`}
                label="Logging"
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      <div>
        <Button
          startIcon={<CippIcons.Add />}
          onClick={() => append(newLink(fields.length))}
        >
          Add filtering policy
        </Button>
      </div>
    </Stack>
  )
}

export default CippGSASecurityProfileForm
