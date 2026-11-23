import PropTypes from 'prop-types'
import { useMemo } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { CippDataTable } from '../CippTable/CippDataTable'
import { getCippError } from '../../utils/get-cipp-error'

// Matches the per-request policy limit in ListIntuneSettingDevices.
export const MAX_SETTING_DEVICE_POLICIES = 50

export const buildSettingDeviceRequests = (tenant, policies = []) => {
  const pairs = [
    ...new Set(
      policies.map(({ URLName, PolicyId }) => `${URLName}:${PolicyId}`)
    ),
  ]
  const requests = []
  for (let i = 0; i < pairs.length; i += MAX_SETTING_DEVICE_POLICIES) {
    requests.push({
      tenantFilter: tenant,
      Policies: pairs.slice(i, i + MAX_SETTING_DEVICE_POLICIES).join(','),
    })
  }
  return requests
}

// ApiGetCall's bulkRequest turns a tenant's failed request into this shape instead of failing the batch.
const bulkFailureText = (result) =>
  result?.Results?.[0]?.state === 'error' ? result.Results[0].resultText : null

export const mergeSettingDevices = (results = [], policies = []) => {
  const names = new Map(
    policies.map((policy) => [policy.PolicyId, policy.PolicyName])
  )

  const devices = []
  const warnings = []
  for (const result of results) {
    const failure = bulkFailureText(result)
    if (failure) {
      warnings.push(failure)
      continue
    }
    for (const row of result?.Results ?? []) {
      devices.push({
        ...row,
        PolicyName: names.get(row.PolicyId) ?? row.PolicyId,
      })
    }
    warnings.push(...(result?.Metadata?.Warnings ?? []))
  }
  return { devices, warnings }
}

// Placeholders ConvertTo-CIPPIntunePolicySetting emits instead of the real value.
export const MASKED_SETTING_VALUES = ['(encrypted)', '(secret)', '(hidden)']

const MAX_VALUE_LENGTH = 40

export const getSettingAlignment = (policies = []) => {
  const counts = new Map()
  let maskedCount = 0
  for (const { Value } of policies) {
    const value = String(Value ?? '')
    if (MASKED_SETTING_VALUES.includes(value)) {
      maskedCount++
      continue
    }
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  const values = [...counts.entries()]
    .map(([Value, count]) => ({ Value, count }))
    .sort((a, b) => b.count - a.count)

  return {
    status: values.length > 1 ? 'conflict' : 'aligned',
    maskedCount,
    values,
  }
}

const shortValue = (value) => {
  if (value.length <= MAX_VALUE_LENGTH) return `'${value}'`
  const head = value.slice(0, MAX_VALUE_LENGTH + 1)
  const wordEnd = head.lastIndexOf(' ')
  const cut =
    wordEnd > MAX_VALUE_LENGTH / 2
      ? head.slice(0, wordEnd)
      : head.slice(0, MAX_VALUE_LENGTH)
  return `'${cut.trimEnd()}…'`
}

const describeValues = (values) =>
  values
    .map(({ Value, count }, index) => {
      const verb = count === 1 ? 'sets' : 'set'
      const noun = index > 0 ? '' : count === 1 ? ' policy' : ' policies'
      return `${count}${noun} ${verb} ${shortValue(Value)}`
    })
    .join(', ')

const SettingAlignmentAlert = ({ alignment }) => {
  const { maskedCount, values } = alignment

  return (
    <Alert severity="warning" variant="outlined">
      <AlertTitle>This setting isn't aligned</AlertTitle>
      <Stack spacing={0.5}>
        <Typography variant="body2">{describeValues(values)}.</Typography>
        <Typography variant="body2">
          These policies can conflict on the same devices.
        </Typography>
        {maskedCount > 0 && (
          <Typography variant="body2">
            {`${maskedCount} encrypted, secret or hidden ${
              maskedCount === 1 ? 'value was' : 'values were'
            } not compared.`}
          </Typography>
        )}
      </Stack>
    </Alert>
  )
}

SettingAlignmentAlert.propTypes = {
  alignment: PropTypes.object.isRequired,
}

export const CippIntuneSettingDetails = ({ row, tenant }) => {
  const policies = useMemo(
    () => (Array.isArray(row?.Policies) ? row.Policies : []),
    [row]
  )
  const alignment = useMemo(() => getSettingAlignment(policies), [policies])
  const requests = useMemo(
    () => buildSettingDeviceRequests(tenant, policies),
    [tenant, policies]
  )

  const devicesCall = ApiGetCall({
    url: '/api/ListIntuneSettingDevices',
    queryKey: `ListIntuneSettingDevices-${tenant}-${row?.SettingId}-${requests
      .map((request) => request.Policies)
      .join(';')}`,
    data: requests,
    bulkRequest: true,
    waiting: requests.length > 0,
    retry: 1,
    refetchOnWindowFocus: false,
    toast: false,
  })

  const { devices, warnings } = useMemo(
    () => mergeSettingDevices(devicesCall.data ?? [], policies),
    [devicesCall.data, policies]
  )

  const policyColumns = ['PolicyName', 'PolicyTypeName', 'Value', 'DeviceCount']
  const deviceColumns = [
    'DeviceName',
    'Status',
    'LastReported',
    'UserPrincipalName',
    'PolicyName',
  ]

  let devicesBody
  if (requests.length === 0) {
    devicesBody = (
      <Alert severity="info" variant="outlined">
        No policies to load device status for.
      </Alert>
    )
  } else if (
    devicesCall.isLoading ||
    (devicesCall.isFetching && !devicesCall.isSuccess)
  ) {
    devicesBody = <Skeleton variant="rounded" height={120} />
  } else if (devicesCall.isError) {
    devicesBody = (
      <Alert severity="warning" variant="outlined">
        {getCippError(devicesCall.error) || 'Could not load device status.'}
      </Alert>
    )
  } else {
    devicesBody = (
      <Stack spacing={1}>
        {warnings.map((warning) => (
          <Alert key={warning} severity="warning" variant="outlined">
            {warning}
          </Alert>
        ))}
        <CippDataTable
          title="Devices"
          hideTitle
          noCard
          data={devices}
          simpleColumns={deviceColumns}
          isFetching={devicesCall.isFetching}
          refreshFunction={() => devicesCall.refetch()}
        />
      </Stack>
    )
  }

  return (
    <>
      {alignment.status !== 'aligned' && (
        <Box sx={{ my: 2 }}>
          <SettingAlignmentAlert alignment={alignment} />
        </Box>
      )}
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Policies
        </Typography>
        <CippDataTable
          title="Policies"
          hideTitle
          noCard
          data={policies}
          simpleColumns={policyColumns}
        />
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Devices
        </Typography>
        {devicesBody}
      </Box>
    </>
  )
}

CippIntuneSettingDetails.propTypes = {
  row: PropTypes.object,
  tenant: PropTypes.string,
}
