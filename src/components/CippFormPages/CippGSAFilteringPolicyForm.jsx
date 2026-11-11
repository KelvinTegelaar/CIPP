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
import { CippFormCondition } from '../CippComponents/CippFormCondition'
import { CippIcons } from '../../utils/icon-registry'
import webCategories from '../../data/GSAWebCategories.json'

const actionOptions = [
  { label: 'Block', value: 'block' },
  { label: 'Allow', value: 'allow' },
]
const ruleTypeOptions = [
  { label: 'Web categories', value: 'webCategory' },
  { label: 'Domains (FQDN)', value: 'fqdn' },
  { label: 'URLs', value: 'url' },
]
const categoryOptions = webCategories.map((category) => ({
  label: category.displayName,
  value: category.name,
  group: category.group.replace(/([a-z])([A-Z])/g, '$1 $2'),
}))
const toOption = (options, value) =>
  options.find((option) => option.value === value) ?? { label: value, value }

export const filteringPolicyDefaults = {
  action: actionOptions[0],
  policyRules: [{ ruleType: ruleTypeOptions[0] }],
}

// Accepts a template or a tenant policy: both carry Graph-shaped rules
export const filteringPolicyToForm = (policy) => ({
  name: policy.name,
  description: policy.description,
  action: toOption(actionOptions, policy.action),
  policyRules: (policy.policyRules ?? []).map((rule) => {
    const values = (rule.destinations ?? []).map(
      (destination) => destination.name ?? destination.value
    )
    return {
      name: rule.name,
      ruleType: toOption(ruleTypeOptions, rule.ruleType),
      [rule.ruleType]: values.map((value) => toOption(categoryOptions, value)),
    }
  }),
})

export const filteringPolicyToBody = (values) => ({
  name: values.name,
  description: values.description,
  action: values.action?.value,
  policyRules: (values.policyRules ?? []).map((rule) => ({
    name: rule.name,
    ruleType: rule.ruleType?.value,
    destinations: (rule[rule.ruleType?.value] ?? []).map(
      (option) => option.value
    ),
  })),
})

const CippGSAFilteringPolicyForm = ({ formControl, nameHelperText }) => {
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: 'policyRules',
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
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="autoComplete"
            name="action"
            label="When a rule matches"
            options={actionOptions}
            multiple={false}
            creatable={false}
            formControl={formControl}
            validators={{ required: 'Choose block or allow' }}
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

      <Typography variant="h6">Rules</Typography>
      {fields.map((field, index) => (
        <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              Rule {index + 1}
            </Typography>
            <Tooltip title="Remove rule">
              <span>
                <IconButton
                  size="small"
                  aria-label="Remove rule"
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
                type="textField"
                name={`policyRules.${index}.name`}
                label="Rule name"
                formControl={formControl}
                validators={{ required: 'A rule name is required' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="autoComplete"
                name={`policyRules.${index}.ruleType`}
                label="Match on"
                options={ruleTypeOptions}
                multiple={false}
                creatable={false}
                formControl={formControl}
                validators={{ required: 'Choose what the rule matches on' }}
              />
            </Grid>
            <Grid size={12}>
              <CippFormCondition
                formControl={formControl}
                field={`policyRules.${index}.ruleType.value`}
                compareType="is"
                compareValue="webCategory"
              >
                <CippFormComponent
                  type="autoComplete"
                  name={`policyRules.${index}.webCategory`}
                  label="Web categories"
                  options={categoryOptions}
                  groupBy={(option) => option.group}
                  multiple
                  creatable={false}
                  formControl={formControl}
                />
              </CippFormCondition>
              <CippFormCondition
                formControl={formControl}
                field={`policyRules.${index}.ruleType.value`}
                compareType="is"
                compareValue="fqdn"
              >
                <CippFormComponent
                  type="autoComplete"
                  name={`policyRules.${index}.fqdn`}
                  label="Domains"
                  helperText="For example contoso.com or *.contoso.com."
                  options={[]}
                  multiple
                  creatable
                  formControl={formControl}
                />
              </CippFormCondition>
              <CippFormCondition
                formControl={formControl}
                field={`policyRules.${index}.ruleType.value`}
                compareType="is"
                compareValue="url"
              >
                <CippFormComponent
                  type="autoComplete"
                  name={`policyRules.${index}.url`}
                  label="URLs"
                  helperText="For example www.contoso.com/downloads/*."
                  options={[]}
                  multiple
                  creatable
                  formControl={formControl}
                />
              </CippFormCondition>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <div>
        <Button
          startIcon={<CippIcons.Add />}
          onClick={() => append({ ruleType: ruleTypeOptions[0] })}
        >
          Add rule
        </Button>
      </div>
    </Stack>
  )
}

export default CippGSAFilteringPolicyForm
