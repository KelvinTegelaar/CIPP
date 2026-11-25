import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { Controller, useForm, useFormState, useWatch } from 'react-hook-form'
import { CippIcons } from '../../utils/icon-registry'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippApiResults } from './CippApiResults'
import { CippQueueTracker } from '../CippTable/CippQueueTracker'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { usePermissions } from '../../hooks/use-permissions'

const FILE_ACTIONS = ['Allowed', 'Audit', 'Warn', 'Block', 'BlockAndRemediate']
const NETWORK_ACTIONS = ['Allowed', 'Audit', 'Warn', 'Block']

export const DEFENDER_INDICATOR_TYPES = {
  FileSha256: {
    label: 'File (SHA-256 hash)',
    actions: FILE_ACTIONS,
    example: 'a 64 character SHA-256 hash',
  },
  FileSha1: {
    label: 'File (SHA-1 hash)',
    actions: FILE_ACTIONS,
    example: 'a 40 character SHA-1 hash',
  },
  FileMd5: {
    label: 'File (MD5 hash)',
    actions: FILE_ACTIONS,
    example: 'a 32 character MD5 hash',
  },
  CertificateThumbprint: {
    label: 'Certificate (SHA-1 thumbprint)',
    actions: ['Allowed', 'BlockAndRemediate'],
    example: 'the 40 character SHA-1 thumbprint of the signing certificate',
  },
  IpAddress: {
    label: 'IP address',
    actions: NETWORK_ACTIONS,
    example:
      'a single public IPv4 address, or an IPv6 address written in full as eight groups of four digits',
  },
  Url: {
    label: 'URL',
    actions: NETWORK_ACTIONS,
    example: 'a full URL starting with http:// or https://',
  },
  DomainName: {
    label: 'Domain',
    actions: NETWORK_ACTIONS,
    example: 'a domain name such as example.com, without http:// or a path',
  },
}

const ACTION_LABELS = {
  Allowed: 'Allow',
  Audit: 'Audit: allow it and raise an alert in Defender',
  Warn: 'Warn: show a warning the user can bypass',
  Block: 'Block',
  BlockAndRemediate: 'Block and remediate: block it and quarantine the file',
}

const ALLOW_EFFECTS = {
  file: 'Microsoft Defender Antivirus will trust this file and will not detect or block it on any device in the selected tenants, even if it is malicious.',
  certificate:
    'Microsoft Defender Antivirus will trust every file signed with this certificate and will not detect or block those files on any device in the selected tenants.',
  network:
    'Devices in the selected tenants will be able to reach this address even where Defender would otherwise block it or show a warning. An Allow indicator takes precedence over Block and Warn indicators for the same address.',
}

const allowEffect = (type) =>
  type === 'CertificateThumbprint'
    ? ALLOW_EFFECTS.certificate
    : type?.startsWith('File')
      ? ALLOW_EFFECTS.file
      : ALLOW_EFFECTS.network

const actionLabel = (type, action) =>
  type === 'CertificateThumbprint' && action === 'BlockAndRemediate'
    ? 'Block'
    : ACTION_LABELS[action]

const splitValues = (text) => [
  ...new Set(
    (text ?? '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  ),
]

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

const defaultValues = {
  tenantFilter: [],
  IndicatorType: '',
  Values: '',
  Action: '',
  Title: '',
  Description: '',
  ExpirationTime: null,
  Severity: null,
  acknowledgeAllow: false,
}

export const CippAddDefenderIndicatorDrawer = ({ queryKey }) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [queueId, setQueueId] = useState(null)
  const { checkPermissions } = usePermissions()
  const canReadQueue = checkPermissions(['CIPP.Core.Read'])
  const formControl = useForm({ mode: 'onChange', defaultValues })
  const { isValid } = useFormState({ control: formControl.control })

  const tenants = useWatch({
    control: formControl.control,
    name: 'tenantFilter',
  })
  const indicatorType = useWatch({
    control: formControl.control,
    name: 'IndicatorType',
  })
  const action = useWatch({ control: formControl.control, name: 'Action' })
  const valuesText = useWatch({ control: formControl.control, name: 'Values' })
  const acknowledged = useWatch({
    control: formControl.control,
    name: 'acknowledgeAllow',
  })

  const tenantList = ApiGetCall({
    url: '/api/ListTenants?AllTenantSelector=true',
    queryKey: 'ListTenants-FormAllTenantSelector',
  })
  const addIndicator = ApiPostCall({
    relatedQueryKeys: ['ListDefenderIndicators*'],
    onResult: (result) => {
      if (result?.Metadata?.QueueId) setQueueId(result.Metadata.QueueId)
    },
  })
  const submittedQueueId = addIndicator.data?.data?.Metadata?.QueueId

  const typeInfo = DEFENDER_INDICATOR_TYPES[indicatorType]
  const selectedTenants = (tenants ?? []).map(
    (tenant) => tenant?.value ?? tenant
  )
  const allTenants = selectedTenants.includes('AllTenants')
  const tenantCount = allTenants
    ? (tenantList.data ?? []).filter(
        (tenant) => tenant.customerId !== 'AllTenants'
      ).length
    : new Set(selectedTenants).size
  const valueCount = splitValues(valuesText).length
  const isAllow = action === 'Allowed'

  useEffect(() => {
    formControl.setValue('acknowledgeAllow', false)
  }, [tenants, valuesText, indicatorType, action, formControl])

  useEffect(() => {
    if (action && !typeInfo?.actions.includes(action)) {
      formControl.setValue('Action', '', { shouldValidate: true })
    }
  }, [indicatorType, action, typeInfo, formControl])

  const handleSubmit = formControl.handleSubmit((values) => {
    if (isAllow && values.acknowledgeAllow !== true) return
    addIndicator.mutate({
      url: '/api/AddDefenderIndicator',
      data: {
        tenantFilter: allTenants ? 'AllTenants' : [...new Set(selectedTenants)],
        IndicatorType: values.IndicatorType,
        Values: splitValues(values.Values),
        Action: values.Action,
        Title: values.Title,
        Description: values.Description || undefined,
        ExpirationTime:
          values.ExpirationTime != null
            ? new Date(values.ExpirationTime * 1000).toISOString()
            : undefined,
        Severity: values.Severity?.value ?? undefined,
        acknowledgeAllow: isAllow && values.acknowledgeAllow === true,
      },
    })
  })

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    formControl.reset(defaultValues)
    addIndicator.reset()
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {queueId && canReadQueue && (
          <CippQueueTracker
            queueId={queueId}
            queryKey={queryKey}
            title="Add Defender indicators"
          />
        )}
        <Button
          onClick={() => setDrawerVisible(true)}
          startIcon={<CippIcons.PlaylistAdd />}
        >
          Add Indicator
        </Button>
      </Stack>

      <CippOffCanvas
        title="Add Defender Indicator"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={addIndicator} />
            {submittedQueueId && (
              <Typography variant="body2">
                Queue ID {submittedQueueId}
              </Typography>
            )}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-start',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  addIndicator.isPending ||
                  !isValid ||
                  (isAllow && acknowledged !== true)
                }
              >
                {addIndicator.isPending ? 'Adding...' : 'Add Indicator'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              formControl={formControl}
              label="Select Tenants"
              name="tenantFilter"
              type="multiple"
              preselectedEnabled={true}
              allTenants={true}
              validators={{ required: 'Select at least one tenant' }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: '100%' }} />

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="radio"
              label="Indicator type"
              name="IndicatorType"
              formControl={formControl}
              options={Object.entries(DEFENDER_INDICATOR_TYPES).map(
                ([value, info]) => ({
                  label: info.label,
                  value,
                })
              )}
              validators={{ required: 'Choose an indicator type' }}
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="radio"
              label="Action"
              name="Action"
              formControl={formControl}
              helperText={
                typeInfo
                  ? undefined
                  : 'Choose an indicator type to see the actions Defender supports for it.'
              }
              options={(typeInfo?.actions ?? []).map((value) => ({
                label: actionLabel(indicatorType, value),
                value,
              }))}
              validators={{ required: 'Choose an action' }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Values"
              name="Values"
              formControl={formControl}
              multiline
              rows={6}
              disableVariables
              validators={{
                required: 'Enter at least one value',
                validate: (text) =>
                  splitValues(text).length <= 500 ||
                  'Enter at most 500 values at a time',
              }}
              helperText={
                typeInfo
                  ? `One value per line, up to 500. Each value is ${typeInfo.example}.`
                  : 'One value per line, up to 500.'
              }
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Title"
              name="Title"
              formControl={formControl}
              disableVariables
              validators={{ required: 'Enter a title' }}
              helperText="Shown as the indicator's title in Defender and in alerts."
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Description (optional)"
              name="Description"
              formControl={formControl}
              disableVariables
              helperText="Saved in Defender after your name, for example a ticket number."
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="datePicker"
              label="Expires (optional)"
              name="ExpirationTime"
              formControl={formControl}
              validators={{
                validate: (timestamp) =>
                  timestamp == null ||
                  (Number.isFinite(timestamp) &&
                    timestamp * 1000 > Date.now()) ||
                  'Choose a future expiration date',
              }}
              helperText="Leave empty to keep the indicator until it is removed."
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Alert severity (optional)"
              name="Severity"
              formControl={formControl}
              multiple={false}
              creatable={false}
              options={['Informational', 'Low', 'Medium', 'High'].map(
                (value) => ({
                  label: value,
                  value,
                })
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Audit always raises an alert in Defender. If a value already
              exists in a tenant with the same action, Defender updates it. If
              it exists with a different action, or only for some device groups,
              CIPP skips it in that tenant and leaves it unchanged; to change
              its action, remove it from the Indicators page and add it again.
              Network indicators can take up to 48 hours to reach devices, and
              file indicators about 15 to 30 minutes.
            </Typography>
          </Grid>

          {isAllow && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                <Typography variant="body2">
                  {allowEffect(indicatorType)}
                </Typography>
                <Controller
                  name="acknowledgeAllow"
                  control={formControl.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value === true}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                        />
                      }
                      label={`I understand that Defender will trust ${plural(
                        valueCount,
                        'value'
                      )} in ${plural(tenantCount, 'tenant')}.`}
                    />
                  )}
                />
              </Alert>
            </Grid>
          )}
        </Grid>
      </CippOffCanvas>
    </>
  )
}

export default CippAddDefenderIndicatorDrawer
