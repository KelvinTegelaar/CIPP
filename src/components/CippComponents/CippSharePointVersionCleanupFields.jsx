import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import {
  Alert,
  Box,
  CircularProgress,
  FormHelperText,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { ApiGetCall } from '../../api/ApiCall'

/** Human-readable site version policy for Sync-policy cleanup. */
export const formatVersionPolicy = (props) => {
  if (!props || typeof props !== 'object') return null
  if (props.InheritVersionPolicyFromTenant) {
    const major =
      props.MajorVersionLimit === null || props.MajorVersionLimit === undefined
        ? null
        : Number(props.MajorVersionLimit)
    const days =
      props.ExpireVersionsAfterDays === null || props.ExpireVersionsAfterDays === undefined
        ? null
        : Number(props.ExpireVersionsAfterDays)
    const parts = ['Inherits tenant default']
    if (props.EnableAutoExpirationVersionTrim) {
      parts.push('auto trim')
    } else if (major !== null && !Number.isNaN(major) && major > 0) {
      parts.push(`${major.toLocaleString()} major`)
      if (days !== null && !Number.isNaN(days) && days > 0) {
        parts.push(`expire after ${days.toLocaleString()} days`)
      }
    }
    return parts.join(' · ')
  }

  const major =
    props.MajorVersionLimit === null || props.MajorVersionLimit === undefined
      ? null
      : Number(props.MajorVersionLimit)
  const days =
    props.ExpireVersionsAfterDays === null || props.ExpireVersionsAfterDays === undefined
      ? null
      : Number(props.ExpireVersionsAfterDays)

  if (props.EnableAutoExpirationVersionTrim) {
    const parts = ['Auto trim (Microsoft managed)']
    if (major !== null && !Number.isNaN(major) && major > 0) {
      parts.push(`${major.toLocaleString()} major`)
    }
    if (days !== null && !Number.isNaN(days) && days > 0) {
      parts.push(`${days.toLocaleString()} days`)
    }
    return parts.join(' · ')
  }

  if (major !== null && !Number.isNaN(major)) {
    if (major <= 0) return 'Unlimited / not set'
    const label = `${major.toLocaleString()} major versions`
    if (days !== null && !Number.isNaN(days) && days > 0) {
      return `${label} · expire after ${days.toLocaleString()} days`
    }
    return label
  }
  return null
}

const optionValue = (value) => {
  if (value && typeof value === 'object' && value.value !== undefined) return String(value.value)
  if (value === null || value === undefined) return null
  return String(value)
}

const DAYS_MARKS = [
  { value: 30, label: '30' },
  { value: 90, label: '90' },
  { value: 180, label: '180' },
  { value: 365, label: '365' },
]

const VERSION_MARKS = [
  { value: 1, label: '1' },
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
]

const VersionCleanupSlider = ({
  formHook,
  name,
  label,
  min,
  max,
  step = 1,
  marks,
  valueLabelFormat,
  defaultValue,
  rules,
}) => (
  <Controller
    name={name}
    control={formHook.control}
    defaultValue={defaultValue}
    rules={rules}
    render={({ field, fieldState }) => {
      const numeric = Number(field.value)
      const safeValue = Number.isFinite(numeric)
        ? Math.min(max, Math.max(min, numeric))
        : defaultValue
      return (
        <Box sx={{ px: 1, pt: 0.5, pb: 1 }}>
          <Stack
            direction="row"
            alignItems="baseline"
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, flexShrink: 0 }}>
              {valueLabelFormat ? valueLabelFormat(safeValue) : safeValue}
            </Typography>
          </Stack>
          <Slider
            value={safeValue}
            min={min}
            max={max}
            step={step}
            marks={marks}
            valueLabelDisplay="auto"
            valueLabelFormat={valueLabelFormat}
            onChange={(_e, next) => field.onChange(next)}
            onBlur={field.onBlur}
            name={field.name}
            aria-label={label}
          />
          {fieldState.error?.message ? (
            <FormHelperText error>{fieldState.error.message}</FormHelperText>
          ) : null}
        </Box>
      )
    }}
  />
)

VersionCleanupSlider.propTypes = {
  formHook: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  marks: PropTypes.array,
  valueLabelFormat: PropTypes.func,
  defaultValue: PropTypes.number.isRequired,
  rules: PropTypes.object,
}

/**
 * Shared version-cleanup mode fields for Storage Report cleanup and site capacity dialog.
 * When Sync policy is selected and siteUrl/tenantFilter are provided, shows the current
 * site version policy so the admin is not flying blind.
 */
export const CippSharePointVersionCleanupFields = ({
  formHook,
  tenantFilter,
  siteUrl,
}) => {
  const mode = optionValue(useWatch({ control: formHook.control, name: 'BatchDeleteMode' }))
  const showPolicy = mode === '2'
  const canLoadPolicy = showPolicy && !!tenantFilter && !!siteUrl
  const majorLimit = Number(
    useWatch({ control: formHook.control, name: 'MajorVersionLimit', defaultValue: 50 })
  )
  const majorWithMinor = Number(
    useWatch({
      control: formHook.control,
      name: 'MajorWithMinorVersionsLimit',
      defaultValue: 0,
    })
  )
  const minorSliderMax = Number.isFinite(majorLimit) && majorLimit > 0 ? majorLimit : 100

  useEffect(() => {
    if (!Number.isFinite(majorWithMinor) || !Number.isFinite(minorSliderMax)) return
    if (majorWithMinor > minorSliderMax) {
      formHook.setValue('MajorWithMinorVersionsLimit', minorSliderMax, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, [formHook, majorWithMinor, minorSliderMax])

  const siteProps = ApiGetCall({
    url: '/api/ListSiteProperties',
    data: { tenantFilter, SiteUrl: siteUrl },
    queryKey: `VersionCleanupPolicy-${tenantFilter}-${siteUrl}`,
    waiting: canLoadPolicy,
  })

  const props =
    siteProps.data && typeof siteProps.data === 'object' && !Array.isArray(siteProps.data)
      ? siteProps.data
      : null
  const policyLabel = formatVersionPolicy(props)
  const policyError =
    typeof siteProps.data === 'string'
      ? siteProps.data
      : siteProps.isError
        ? 'Could not load site version policy.'
        : null

  return (
    <>
      <CippFormComponent
        type="radio"
        name="BatchDeleteMode"
        label="Cleanup Mode"
        formControl={formHook}
        options={[
          {
            label: 'Older than X days — remove versions older than a set number of days',
            value: '0',
          },
          {
            label: 'More than X versions — keep only the newest N major versions',
            value: '1',
          },
          {
            label: 'Sync policy — apply the site version policy to existing versions',
            value: '2',
          },
        ]}
      />
      <CippFormCondition
        field="BatchDeleteMode"
        compareType="is"
        compareValue="2"
        formControl={formHook}
      >
        <Alert severity="info" sx={{ py: 0.75 }}>
          {!canLoadPolicy ? (
            <Typography variant="body2">
              Sync policy trims existing versions to this site&apos;s current version limits.
              Select a single site to preview those limits here.
            </Typography>
          ) : siteProps.isFetching && !props ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2">Loading this site&apos;s version policy…</Typography>
            </Stack>
          ) : policyError ? (
            <Typography variant="body2">{policyError}</Typography>
          ) : (
            <Stack spacing={0.25}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Current site policy
              </Typography>
              <Typography variant="body2">
                {policyLabel || 'No version policy details returned for this site.'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This job will trim existing version history to match that policy. It does not change
                the policy itself — use the SPOVersionControl standard (or Edit Site) for that.
              </Typography>
            </Stack>
          )}
        </Alert>
      </CippFormCondition>
      <CippFormCondition
        field="BatchDeleteMode"
        compareType="is"
        compareValue="0"
        formControl={formHook}
      >
        <VersionCleanupSlider
          formHook={formHook}
          name="DeleteOlderThanDays"
          label="Delete versions older than"
          min={30}
          max={365}
          step={1}
          marks={DAYS_MARKS}
          defaultValue={90}
          valueLabelFormat={(v) => `${v} days`}
          rules={{
            required: 'Choose how many days',
            min: { value: 30, message: 'SharePoint requires at least 30 days' },
            max: { value: 365, message: 'Use Sync policy or Count limits for longer retention' },
          }}
        />
      </CippFormCondition>
      <CippFormCondition
        field="BatchDeleteMode"
        compareType="is"
        compareValue="1"
        formControl={formHook}
      >
        <VersionCleanupSlider
          formHook={formHook}
          name="MajorVersionLimit"
          label="Keep at most this many major versions"
          min={1}
          max={100}
          step={1}
          marks={VERSION_MARKS}
          defaultValue={50}
          valueLabelFormat={(v) => `${v}`}
          rules={{
            required: 'Choose a version limit',
            min: { value: 1, message: 'Keep at least 1 major version' },
            max: { value: 100, message: 'Maximum for this control is 100' },
          }}
        />
        <VersionCleanupSlider
          formHook={formHook}
          name="MajorWithMinorVersionsLimit"
          label="Major versions that keep their minor versions"
          min={0}
          max={minorSliderMax}
          step={1}
          marks={[
            { value: 0, label: '0' },
            ...(minorSliderMax >= 10 ? [{ value: 10, label: '10' }] : []),
            ...(minorSliderMax >= 25 ? [{ value: 25, label: '25' }] : []),
            ...(minorSliderMax >= 50 ? [{ value: 50, label: '50' }] : []),
            ...(minorSliderMax > 0
              ? [{ value: minorSliderMax, label: String(minorSliderMax) }]
              : []),
          ]}
          defaultValue={0}
          valueLabelFormat={(v) => `${v}`}
          rules={{
            required: 'Choose how many majors keep minors',
            min: { value: 0, message: 'Cannot be negative' },
            validate: (value) => {
              const major = Number(formHook.getValues('MajorVersionLimit'))
              const minor = Number(value)
              if (!Number.isFinite(minor)) return 'Choose how many majors keep minors'
              if (Number.isFinite(major) && minor > major) {
                return 'Cannot exceed the major version limit'
              }
              return true
            },
          }}
        />
      </CippFormCondition>
    </>
  )
}

CippSharePointVersionCleanupFields.propTypes = {
  formHook: PropTypes.object.isRequired,
  tenantFilter: PropTypes.string,
  siteUrl: PropTypes.string,
}

export default CippSharePointVersionCleanupFields
