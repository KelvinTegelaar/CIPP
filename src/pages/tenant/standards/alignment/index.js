import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { Delete, Edit } from '@mui/icons-material'
import { EyeIcon, ListBulletIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import tabOptions from '../tabOptions.json'
import { useState } from 'react'
import { Box, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material'
import standardsData from '../../../../data/standards.json'

const Page = () => {
  const pageTitle = 'Standard & Drift Alignment'
  const [granular, setGranular] = useState(false)

  const summaryFilterList = [
    {
      filterName: 'Drift Templates',
      value: [{ id: 'standardType', value: 'drift' }],
      type: 'column',
    },
    {
      filterName: 'Classic Templates',
      value: [{ id: 'standardType', value: 'classic' }],
      type: 'column',
    },
  ]

  const granularFilterList = [
    {
      filterName: 'Non-Compliant',
      value: [{ id: 'complianceStatus', value: 'Non-Compliant' }],
      type: 'column',
    },
    {
      filterName: 'Compliant',
      value: [{ id: 'complianceStatus', value: 'Compliant' }],
      type: 'column',
    },
    {
      filterName: 'Accepted Deviation',
      value: [{ id: 'complianceStatus', value: 'Accepted Deviation' }],
      type: 'column',
    },
    {
      filterName: 'Customer Specific',
      value: [{ id: 'complianceStatus', value: 'Customer Specific' }],
      type: 'column',
    },
    {
      filterName: 'License Missing',
      value: [{ id: 'complianceStatus', value: 'License Missing' }],
      type: 'column',
    },
  ]

  const summaryActions = [
    {
      label: 'View Tenant Report',
      link: '/tenant/manage/applied-standards/?tenantFilter=[tenantFilter]&templateId=[standardId]',
      icon: <EyeIcon />,
      color: 'info',
      target: '_self',
    },
    {
      label: 'Edit Template',
      link: '/tenant/standards/templates/template?id=[standardId]&type=[standardType]',
      icon: <Edit />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Manage Drift',
      link: '/tenant/manage/drift?templateId=[standardId]&tenantFilter=[tenantFilter]',
      icon: <EyeIcon />,
      color: 'info',
      target: '_self',
      condition: (row) => row.standardType === 'drift',
    },
    {
      label: 'Remove Drift Customization',
      type: 'POST',
      url: '/api/ExecUpdateDriftDeviation',
      icon: <Delete />,
      data: {
        RemoveDriftCustomization: 'true',
        tenantFilter: 'tenantFilter',
      },
      confirmText:
        'Are you sure you want to remove all drift customizations? This resets the Drift Standard to the default template, and will generate alerts for the drifted items.',
      multiPost: false,
      condition: (row) => row.standardType === 'drift',
    },
  ]

  const granularActions = [
    {
      label: 'View Tenant Report',
      link: '/tenant/manage/applied-standards/?tenantFilter=[tenantFilter]&templateId=[templateId]',
      icon: <EyeIcon />,
      color: 'info',
      target: '_self',
    },
    {
      label: 'Edit Template',
      link: '/tenant/standards/templates/template?id=[templateId]&type=[templateType]',
      icon: <Edit />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Manage Drift',
      link: '/tenant/manage/drift?templateId=[templateId]&tenantFilter=[tenantFilter]',
      icon: <EyeIcon />,
      color: 'info',
      target: '_self',
      condition: (row) => row.templateType === 'drift',
    },
  ]

  const parseValue = (value) => {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }

  const normalizeObj = (val) => {
    if (Array.isArray(val)) return val.map(normalizeObj)
    if (val !== null && typeof val === 'object') {
      return Object.fromEntries(
        Object.keys(val)
          .sort()
          .map((k) => [k, normalizeObj(val[k])])
      )
    }
    return val
  }

  const compareValues = (expected, current) => {
    if (!expected || !current) return null
    try {
      const expectedObj = normalizeObj(
        typeof expected === 'object' ? expected : JSON.parse(expected)
      )
      const currentObj = normalizeObj(typeof current === 'object' ? current : JSON.parse(current))
      if (JSON.stringify(expectedObj) === JSON.stringify(currentObj)) return null
      const differences = {}
      const allKeys = new Set([...Object.keys(expectedObj), ...Object.keys(currentObj)])
      allKeys.forEach((key) => {
        const e = normalizeObj(expectedObj[key])
        const c = normalizeObj(currentObj[key])
        if (JSON.stringify(e) !== JSON.stringify(c)) {
          differences[key] = { expected: expectedObj[key], current: currentObj[key] }
        }
      })
      return Object.keys(differences).length > 0 ? differences : null
    } catch {
      return null
    }
  }

  const granularOffCanvas = {
    size: 'md',
    title: 'Standard Details',
    contentPadding: 0,
    children: (row) => {
      const expectedParsed = parseValue(row.expectedValue)
      const currentParsed = parseValue(row.currentValue)
      const diffs = compareValues(expectedParsed, currentParsed)
      const baseName = row.standardId?.split('.').slice(0, -1).join('.')
      const prettyName =
        standardsData.find((s) => s.name === row.standardId)?.label ??
        standardsData.find((s) => s.name === baseName)?.label ??
        row.standardName

      const complianceColors = {
        compliant: 'success',
        'non-compliant': 'error',
        'accepted deviation': 'info',
        'customer specific': 'info',
        'license missing': 'warning',
        'reporting disabled': 'default',
      }
      const statusColor =
        complianceColors[String(row.complianceStatus ?? '').toLowerCase()] ?? 'default'

      const properties = [
        { label: 'Standard', value: prettyName },
        { label: 'Status', value: row.complianceStatus, color: statusColor },
        { label: 'Template', value: row.templateName },
        {
          label: 'Type',
          value: row.standardType === 'drift' ? 'Drift Standard' : 'Classic Standard',
        },
        {
          label: 'Last Applied',
          value: row.latestDataCollection
            ? new Date(row.latestDataCollection).toLocaleString()
            : 'N/A',
        },
      ]

      return (
        <Stack spacing={0}>
          {/* Property list */}
          <Stack
            spacing={0}
            divider={<Divider />}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {properties.map(({ label, value, color }) => (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                  {label}
                </Typography>
                {color ? (
                  <Chip variant="outlined" label={value ?? 'N/A'} size="small" color={color} />
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {value ?? 'N/A'}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>

          {/* Diff / value content */}
          {(expectedParsed || currentParsed) && (
            <Stack spacing={2} sx={{ p: 2 }}>
              {diffs ? (
                <>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Property Differences
                  </Typography>
                  {Object.entries(diffs).map(([key, { expected, current }]) => (
                    <Box key={key}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}
                      >
                        {key}
                      </Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            Expected
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'success.lighter',
                              borderRadius: '12px',
                              border: '2px solid',
                              borderColor: 'success.main',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: 'success.dark',
                              }}
                            >
                              {JSON.stringify(expected, null, 2)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: 'text.secondary',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                              display: 'block',
                              mb: 0.5,
                            }}
                          >
                            Current
                          </Typography>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: 'error.lighter',
                              borderRadius: '12px',
                              border: '2px solid',
                              borderColor: 'error.main',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: 'error.dark',
                              }}
                            >
                              {JSON.stringify(current, null, 2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </>
              ) : (
                <>
                  {expectedParsed !== null && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        Expected
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'success.lighter',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: 'success.main',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: 'success.dark',
                          }}
                        >
                          {typeof expectedParsed === 'object'
                            ? JSON.stringify(expectedParsed, null, 2)
                            : String(expectedParsed)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {currentParsed !== null && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        Current
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: row.compliant ? 'success.lighter' : 'error.lighter',
                          borderRadius: '12px',
                          border: '2px solid',
                          borderColor: row.compliant ? 'success.main' : 'error.main',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.8125rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: row.compliant ? 'success.dark' : 'error.dark',
                          }}
                        >
                          {typeof currentParsed === 'object'
                            ? JSON.stringify(currentParsed, null, 2)
                            : String(currentParsed)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          )}
        </Stack>
      )
    },
  }

  const modeToggle = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1, mt: '4px' }}>
      <Tooltip title={`Switch to ${granular ? 'Summary' : 'Per Standard'} view`} placement="top">
        <Chip
          icon={
            granular ? (
              <ListBulletIcon style={{ width: 16, height: 16 }} />
            ) : (
              <ChartBarIcon style={{ width: 16, height: 16 }} />
            )
          }
          label={granular ? 'Per Standard' : 'Summary'}
          onClick={() => setGranular((v) => !v)}
          color="primary"
          variant="filled"
          size="small"
          clickable
        />
      </Tooltip>
    </Box>
  )

  return (
    <CippTablePage
      key={granular ? 'granular' : 'summary'}
      title={pageTitle}
      apiUrl="/api/ListTenantAlignment"
      apiData={granular ? { granular: 'true' } : {}}
      tenantInTitle={false}
      actions={granular ? granularActions : summaryActions}
      filters={granular ? granularFilterList : summaryFilterList}
      simpleColumns={
        granular
          ? [
              'tenantFilter',
              'complianceStatus',
              'standardName',
              'templateName',
              'standardType',
              'latestDataCollection',
            ]
          : [
              'tenantFilter',
              'standardName',
              'standardType',
              'alignmentScore',
              'LicenseMissingPercentage',
              'combinedAlignmentScore',
              'currentDeviationsCount',
            ]
      }
      queryKey={granular ? 'listTenantAlignment-granular' : 'listTenantAlignment'}
      offCanvas={granular ? granularOffCanvas : undefined}
      cardButton={modeToggle}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
