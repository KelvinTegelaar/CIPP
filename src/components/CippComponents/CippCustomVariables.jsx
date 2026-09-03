import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { useForm, useWatch } from 'react-hook-form'
import {
  CardContent,
  Button,
  SvgIcon,
  Alert,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippApiResults } from './CippApiResults'
import { CippApiDialog } from './CippApiDialog'
import { CippOffCanvas } from './CippOffCanvas'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'

// One definition of the type selector, shared by every dialog that edits a variable so the three
// stay in step.
const VARIABLE_TYPE_FIELD = {
  type: 'autoComplete',
  name: 'VariableType',
  label: 'Type',
  helperText:
    'Integer, boolean and JSON variables are written into templates as raw JSON values, so a numeric setting receives 300 rather than "300". String is the original behaviour and stays the default.',
  multiple: false,
  creatable: false,
  defaultValue: { label: 'String', value: 'string' },
  options: [
    { label: 'String', value: 'string' },
    { label: 'Integer', value: 'integer' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'JSON', value: 'json' },
  ],
}

// Every place a variable name is defined, so an operator adding it somewhere new can see what the
// other tenants already use - and spot a name that has drifted into two different types.
const CippVariableUsage = ({ usage }) => {
  // PowerShell serializes a single-element array as a bare object, so normalize before iterating.
  const asArray = (value) =>
    Array.isArray(value) ? value : value ? [value] : []

  if (!usage) {
    return (
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>This variable is not defined anywhere else yet.
              </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} useFlexGap sx={{
        flexWrap: "wrap"
      }}>
        <Chip size="small" label={`Type: ${usage.SuggestedType}`} />
        <Chip
          size="small"
          label={`${usage.TenantCount} tenant${usage.TenantCount === 1 ? '' : 's'}`}
        />
        {usage.HasGlobal && (
          <Chip size="small" color="info" label="Defined globally" />
        )}
      </Stack>

      {!usage.TypesConsistent && (
        <Alert severity="warning">
          This name is typed differently in different places (
          {asArray(usage.Types).join(', ')}). The same variable will substitute
          differently depending on which tenant a template deploys to.
        </Alert>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Scope</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {asArray(usage.Definitions).map((definition) => (
            <TableRow key={`${definition.TenantId}-${definition.Scope}`}>
              <TableCell>{definition.TenantName}</TableCell>
              <TableCell sx={{ wordBreak: 'break-all' }}>
                {definition.Value}
              </TableCell>
              <TableCell>{definition.VariableType}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}

const CippCustomVariables = ({ id }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [usageVariable, setUsageVariable] = useState(null)

  const isTenantView = id !== 'AllTenants'

  // Every definition of every variable name, across all tenants. A variable name is the thing an
  // operator manages - the same %wallpaperpath% deployed in many places - but it is stored one row
  // per tenant, so this is what makes that shape visible.
  const usageQuery = ApiGetCall({
    url: '/api/ExecCippReplacemap?Action=Usage',
    queryKey: 'CustomVariables-Usage',
  })

  const usageByName = useMemo(() => {
    const map = new Map()
    ;(usageQuery.data?.Results || []).forEach((entry) => {
      if (entry?.Name) map.set(entry.Name.toLowerCase(), entry)
    })
    return map
  }, [usageQuery.data])

  // The names already defined at this scope. Deliberately requested without includeGlobal - an
  // inherited global is not a clash, overriding it is the supported thing to do. The query key is
  // distinct from the table's so the two cannot collide, and still matches the CustomVariables*
  // wildcard used for invalidation.
  const ownNamesQuery = ApiGetCall({
    url: `/api/ExecCippReplacemap?Action=List&tenantId=${id}`,
    queryKey: `CustomVariables-Names-${id}`,
  })

  const ownVariableNames = useMemo(() => {
    const results = ownNamesQuery.data?.Results
    return new Set(
      (Array.isArray(results) ? results : []).map((row) =>
        String(row?.RowKey ?? '').toLowerCase()
      )
    )
  }, [ownNamesQuery.data])

  // Names already defined at this scope are left out of the picker: choosing one could only
  // overwrite what is already there. The field stays creatable, so the validator is still the
  // backstop for a name typed in by hand.
  const variableNameOptions = useMemo(
    () =>
      Array.from(usageByName.values())
        .filter(
          (entry) => !ownVariableNames.has(String(entry.Name).toLowerCase())
        )
        .map((entry) => ({
          label: entry.Name,
          value: entry.Name,
        })),
    [usageByName, ownVariableNames]
  )

  // Drives the add dialog from here so the type can follow the name as it is chosen.
  const addFormHook = useForm({ mode: 'onChange' })
  const newVariableName = useWatch({
    control: addFormHook.control,
    name: 'RowKey',
  })
  const enteredName =
    newVariableName && typeof newVariableName === 'object'
      ? String(newVariableName.value ?? '')
      : newVariableName
  const existingUsage = enteredName
    ? usageByName.get(String(enteredName).toLowerCase())
    : null
  const alreadyDefinedHere = Boolean(
    enteredName && ownVariableNames.has(String(enteredName).toLowerCase())
  )

  useEffect(() => {
    // The name picker hands back {label, value}. RowKey has always been a plain string on the wire,
    // and CippAutoComplete renders a plain string correctly, so normalise here rather than change
    // the payload shape.
    if (
      newVariableName &&
      typeof newVariableName === 'object' &&
      'value' in newVariableName
    ) {
      // shouldValidate because setValue skips validation by default, and the name is the field
      // the duplicate check runs on.
      addFormHook.setValue('RowKey', String(newVariableName.value), {
        shouldValidate: true,
      })
    }
  }, [newVariableName])

  useEffect(() => {
    if (!openAddDialog || !existingUsage?.SuggestedType) return
    // Defaulted, not forced: the operator can still pick a different type before saving. Keeping the
    // same name typed the same way everywhere is what makes a variable safe to reuse in a template.
    addFormHook.setValue('VariableType', {
      label: existingUsage.SuggestedType,
      value: existingUsage.SuggestedType,
    })
  }, [openAddDialog, existingUsage?.Name, existingUsage?.SuggestedType])

  // Simple cache invalidation using React Query wildcard support
  const allRelatedKeys = ['CustomVariables*']

  const updateCustomVariablesApi = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: allRelatedKeys,
  })

  const reservedVariables = [
    'tenantid',
    'tenantname',
    'tenantfilter',
    'partnertenantid',
    'samappid',
    'cippuserschema',
    'cippurl',
    'defaultdomain',
    'serial',
    'systemroot',
    'systemdrive',
    'temp',
    'userprofile',
    'username',
    'userdomain',
    'windir',
    'programfiles',
    'programfiles(x86)',
    'programdata',
  ]

  const validateVariableName = (rawValue) => {
    // The name picker can hand this back as {label, value} before it is normalised.
    const value =
      rawValue && typeof rawValue === 'object'
        ? String(rawValue.value ?? '')
        : rawValue
    if (!value) {
      return 'A variable name is required.'
    }
    if (reservedVariables.includes(value.toLowerCase())) {
      return 'The variable name is reserved and cannot be used.'
    } else if (
      !value.includes(' ') &&
      !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(value)
    ) {
      return true
    } else {
      return 'The variable name must not contain spaces or special characters.'
    }
  }

  // Add only. AddEdit is an upsert, so without this a name that already exists here would silently
  // overwrite the existing variable instead of creating one.
  const validateNewVariableName = (rawValue) => {
    const baseResult = validateVariableName(rawValue)
    if (baseResult !== true) return baseResult

    const value =
      rawValue && typeof rawValue === 'object'
        ? String(rawValue.value ?? '')
        : rawValue
    if (ownVariableNames.has(String(value).toLowerCase())) {
      return isTenantView
        ? 'This tenant already has a variable with this name. Edit that one instead, or pick another name.'
        : 'A global variable with this name already exists. Edit that one instead, or pick another name.'
    }
    return true
  }

  const actions = [
    {
      label: 'Edit',
      icon: (
        <SvgIcon>
          <CippIcons.PencilIcon />
        </SvgIcon>
      ),
      confirmText: "Update the custom variable '[RowKey]'?",
      hideBulk: true,
      setDefaultValues: true,
      condition: (row) => row.Scope !== 'Global' || id === 'AllTenants',
      fields: [
        {
          type: 'textField',
          name: 'RowKey',
          label: 'Variable Name',
          placeholder: 'Enter the key for the custom variable.',
          required: true,
          disableVariables: true,
          validators: { validate: validateVariableName },
        },
        {
          type: 'textField',
          name: 'Value',
          label: 'Value',
          placeholder: 'Enter the value for the custom variable.',
          required: true,
        },
        VARIABLE_TYPE_FIELD,
        {
          type: 'textField',
          name: 'Description',
          label: 'Description',
          placeholder: 'Enter a description for the custom variable.',
          required: false,
          disableVariables: true,
        },
      ],
      type: 'POST',
      url: '/api/ExecCippReplacemap',
      data: {
        Action: '!AddEdit',
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
    },
    {
      label: 'Override for this tenant',
      icon: (
        <SvgIcon>
          <CippIcons.DocumentDuplicateIcon />
        </SvgIcon>
      ),
      hideBulk: true,
      setDefaultValues: true,
      // The row being acted on is the global variable itself, so the name never has to be typed and
      // the type is inherited rather than guessed.
      condition: (row) => isTenantView && row.Scope === 'Global',
      confirmText: "Give '[RowKey]' a value that applies only to this tenant?",
      fields: [
        {
          type: 'textField',
          name: 'RowKey',
          label: 'Variable Name',
          disabled: true,
          disableVariables: true,
        },
        {
          type: 'textField',
          name: 'Value',
          label: 'Value for this tenant',
          placeholder: 'Enter the value that should apply to this tenant.',
          required: true,
        },
        VARIABLE_TYPE_FIELD,
        {
          type: 'textField',
          name: 'Description',
          label: 'Description',
          required: false,
          disableVariables: true,
        },
      ],
      type: 'POST',
      url: '/api/ExecCippReplacemap',
      data: {
        Action: '!AddEdit',
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
    },
    {
      label: 'Revert to global',
      icon: (
        <SvgIcon>
          <CippIcons.ArrowUturnLeftIcon />
        </SvgIcon>
      ),
      hideBulk: true,
      // Named for the outcome. It is the same delete call, but on a row that shadows a global one
      // the result is that the global value applies again rather than the variable disappearing.
      condition: (row) => row.Scope === 'Overridden',
      confirmText:
        "Remove this tenant's own value for '[RowKey]'? The global value will apply again.",
      type: 'POST',
      url: '/api/ExecCippReplacemap',
      data: {
        Action: 'Delete',
        RowKey: 'RowKey',
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
      multiPost: false,
    },
    {
      label: 'View usage',
      icon: (
        <SvgIcon>
          <CippIcons.GlobeAltIcon />
        </SvgIcon>
      ),
      noConfirm: true,
      hideBulk: true,
      customFunction: (row) => setUsageVariable(row?.RowKey ?? null),
    },
    {
      label: 'Delete',
      icon: <CippIcons.Delete />,
      confirmText: 'Are you sure you want to delete [RowKey]?',
      // An overridden row gets 'Revert to global' instead, which says what actually happens.
      condition: (row) =>
        (row.Scope !== 'Global' || id === 'AllTenants') &&
        row.Scope !== 'Overridden',
      type: 'POST',
      url: '/api/ExecCippReplacemap',
      data: {
        Action: 'Delete',
        RowKey: 'RowKey',
        tenantId: id,
      },
      relatedQueryKeys: allRelatedKeys,
      multiPost: false,
    },
  ]

  const handleAddVariable = () => {
    setOpenAddDialog(true)
  }

  return (
    <CardContent>
      <Alert severity="info" sx={{ mb: 2 }}>
        {id === 'AllTenants'
          ? "Global variables are key-value pairs that can be used to store additional information for All Tenants. These are applied to templates in standards using the format %variablename%. If a tenant has a custom variable with the same name, the tenant's variable will take precedence."
          : 'Custom variables are key-value pairs that can be used to store additional information about a tenant. These are applied to templates in standards using the format %variablename%.'}
      </Alert>
      <CippDataTable
        queryKey={`CustomVariables-${id}`}
        title={id === 'AllTenants' ? 'Global Variables' : 'Custom Variables'}
        actions={actions}
        api={{
          url: isTenantView
            ? `/api/ExecCippReplacemap?Action=List&tenantId=${id}&includeGlobal=true`
            : `/api/ExecCippReplacemap?Action=List&tenantId=${id}`,
          dataKey: 'Results',
        }}
        simpleColumns={
          isTenantView
            ? ['RowKey', 'Value', 'Scope', 'VariableType', 'Description']
            : ['RowKey', 'Value', 'VariableType', 'Description']
        }
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddVariable}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.PlusIcon />
              </SvgIcon>
            }
          >
            Add Variable
          </Button>
        }
      />

      <CippOffCanvas
        visible={Boolean(usageVariable)}
        onClose={() => setUsageVariable(null)}
        title={usageVariable ? `Usage of %${usageVariable}%` : 'Usage'}
        size="md"
      >
        <CippVariableUsage
          usage={usageByName.get(String(usageVariable ?? '').toLowerCase())}
        />
      </CippOffCanvas>

      <CippApiResults apiObject={updateCustomVariablesApi} />
      <CippApiDialog
        createDialog={{
          open: openAddDialog,
          handleClose: () => setOpenAddDialog(false),
        }}
        title="Add Variable"
        formHook={addFormHook}
        allowResubmit={true}
        fields={[
          {
            type: 'autoComplete',
            name: 'RowKey',
            label: 'Variable Name',
            placeholder:
              'Pick a variable that already exists, or type a new name.',
            required: true,
            multiple: false,
            creatable: true,
            disableVariables: true,
            options: variableNameOptions,
            validators: { validate: validateNewVariableName },
          },
          // Rendered as a field so it appears in the dialog next to the name it refers to, rather
          // than behind it on the page.
          // Only the cross-scope case gets an alert. A clash on this scope is already reported by
          // the name field's own validator, which also disables Save - saying it twice just makes
          // the dialog noisy.
          ...(existingUsage && !alreadyDefinedHere
            ? [
                {
                  type: 'alert',
                  name: 'existingUsageNotice',
                  severity: 'info',
                  label: `${existingUsage.Variable} already exists in ${existingUsage.TenantCount} tenant${
                    existingUsage.TenantCount === 1 ? '' : 's'
                  }${existingUsage.HasGlobal ? ' and globally' : ''}. The type has been set to ${
                    existingUsage.SuggestedType
                  } to match.`,
                },
              ]
            : []),
          {
            type: 'textField',
            name: 'Value',
            label: 'Value',
            placeholder: 'Enter the value for the custom variable.',
            required: true,
          },
          VARIABLE_TYPE_FIELD,
          {
            type: 'textField',
            name: 'Description',
            label: 'Description',
            placeholder: 'Enter a description for the custom variable.',
            required: false,
            disableVariables: true,
          },
        ]}
        api={{
          type: 'POST',
          url: '/api/ExecCippReplacemap',
          data: { Action: 'AddEdit', tenantId: id },
          relatedQueryKeys: allRelatedKeys,
        }}
      />
    </CardContent>
  )
}

export default CippCustomVariables
