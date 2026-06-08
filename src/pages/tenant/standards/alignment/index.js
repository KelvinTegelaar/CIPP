import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { ApiGetCallWithPagination } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { Delete, Edit } from '@mui/icons-material'
import { EyeIcon, ListBulletIcon, ChartBarIcon, Squares2X2Icon } from '@heroicons/react/24/outline'
import tabOptions from '../tabOptions.json'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Box,
  Chip,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import standardsData from '../../../../data/standards.json'

const complianceColors = {
  compliant: 'success',
  'non-compliant': 'error',
  'accepted deviation': 'info',
  'customer specific': 'info',
  'license missing': 'warning',
  'reporting disabled': 'default',
}

const compliancePriority = {
  compliant: 10,
  'reporting disabled': 20,
  'customer specific': 30,
  'accepted deviation': 40,
  'license missing': 50,
  'non-compliant': 60,
}

const getComplianceStatus = (status) => String(status ?? 'Unknown').trim() || 'Unknown'

const getComplianceColor = (status) =>
  complianceColors[getComplianceStatus(status).toLowerCase()] ?? 'default'

const getCompliancePriority = (status) =>
  compliancePriority[getComplianceStatus(status).toLowerCase()] ?? 0

const isAlignedComplianceStatus = (status) =>
  ['compliant', 'accepted deviation', 'customer specific'].includes(
    getComplianceStatus(status).toLowerCase()
  )

const getPageRows = (page) => {
  if (Array.isArray(page)) return page
  if (Array.isArray(page?.Results)) return page.Results
  if (Array.isArray(page?.Data)) return page.Data
  if (Array.isArray(page?.data)) return page.data
  if (Array.isArray(page?.value)) return page.value
  return []
}

const getStandardInfo = (standardId) => {
  const baseName = standardId?.split('.').slice(0, -1).join('.')
  return (
    standardsData.find((s) => s.name === standardId) ??
    standardsData.find((s) => s.name === baseName)
  )
}

const Page = () => {
  const pageTitle = 'Standard & Drift Alignment'
  const tenant = useSettings().currentTenant
  const [viewMode, setViewMode] = useState('summary')
  const [byStandardTenantFilter, setByStandardTenantFilter] = useState('all')
  const isSummary = viewMode === 'summary'
  const isGranular = viewMode === 'granular'
  const isByStandard = viewMode === 'byStandard'

  const {
    data: byStandardApiData,
    fetchNextPage: fetchNextByStandardPage,
    hasNextPage: byStandardHasNextPage,
    isFetching: byStandardIsFetching,
    isSuccess: byStandardIsSuccess,
  } = ApiGetCallWithPagination({
    url: '/api/ListTenantAlignment',
    data: { tenantFilter: tenant, granular: 'true' },
    queryKey: `listTenantAlignment-byStandard-source-${tenant}`,
    waiting: isByStandard,
  })

  useEffect(() => {
    if (isByStandard && byStandardIsSuccess && byStandardHasNextPage && !byStandardIsFetching) {
      fetchNextByStandardPage()
    }
  }, [
    byStandardApiData?.pages?.length,
    byStandardHasNextPage,
    byStandardIsFetching,
    byStandardIsSuccess,
    fetchNextByStandardPage,
    isByStandard,
  ])

  const byStandardSourceData = useMemo(
    () => byStandardApiData?.pages?.flatMap((page) => getPageRows(page)) ?? [],
    [byStandardApiData]
  )

  const byStandardData = useMemo(() => {
    const groupedStandards = new Map()

    byStandardSourceData.forEach((row) => {
      const standardKey = row.standardId || row.standardName
      if (!standardKey) return

      const standardInfo = getStandardInfo(row.standardId)
      const hasExactMatch = standardsData.find((s) => s.name === row.standardId)
      const standardName = hasExactMatch
        ? (standardInfo?.label ?? row.standardName ?? standardKey)
        : (row.standardName ?? standardInfo?.label ?? standardKey)

      if (!groupedStandards.has(standardKey)) {
        groupedStandards.set(standardKey, {
          standardId: standardKey,
          standardName,
          category: standardInfo?.cat ?? 'Uncategorized',
          standardTypes: new Set(),
          tenants: new Map(),
        })
      }

      const standard = groupedStandards.get(standardKey)
      const standardType = row.standardType ?? row.templateType
      if (standardType) standard.standardTypes.add(standardType)

      const tenantKey = row.tenantFilter ?? row.tenantName ?? row.Tenant ?? 'Unknown'
      const status = getComplianceStatus(row.complianceStatus)
      const tenant = standard.tenants.get(tenantKey) ?? {
        tenantFilter: tenantKey,
        complianceStatus: status,
        rows: [],
      }

      tenant.rows.push(row)
      if (getCompliancePriority(status) > getCompliancePriority(tenant.complianceStatus)) {
        tenant.complianceStatus = status
      }
      standard.tenants.set(tenantKey, tenant)
    })

    return Array.from(groupedStandards.values())
      .map((standard) => {
        const tenants = Array.from(standard.tenants.values())
          .map((tenant) => {
            const templateNames = [
              ...new Set(tenant.rows.map((row) => row.templateName).filter(Boolean)),
            ]
            const latestDataCollection = tenant.rows
              .map((row) => row.latestDataCollection)
              .filter(Boolean)
              .sort((a, b) => new Date(b) - new Date(a))[0]

            return {
              tenantFilter: tenant.tenantFilter,
              complianceStatus: tenant.complianceStatus,
              templateName: templateNames.join(', ') || 'N/A',
              latestDataCollection,
              rowCount: tenant.rows.length,
              rows: tenant.rows,
            }
          })
          .sort((a, b) => a.tenantFilter.localeCompare(b.tenantFilter))

        const counts = tenants.reduce(
          (acc, tenant) => {
            switch (getComplianceStatus(tenant.complianceStatus).toLowerCase()) {
              case 'compliant':
                acc.compliantCount += 1
                break
              case 'non-compliant':
                acc.nonCompliantCount += 1
                break
              case 'accepted deviation':
                acc.acceptedDeviationCount += 1
                break
              case 'customer specific':
                acc.customerSpecificCount += 1
                break
              case 'license missing':
                acc.licenseMissingCount += 1
                break
              case 'reporting disabled':
                acc.reportingDisabledCount += 1
                break
              default:
                acc.otherCount += 1
            }
            return acc
          },
          {
            compliantCount: 0,
            nonCompliantCount: 0,
            acceptedDeviationCount: 0,
            customerSpecificCount: 0,
            licenseMissingCount: 0,
            reportingDisabledCount: 0,
            otherCount: 0,
          }
        )

        const totalTenants = tenants.length
        const alignedCount =
          counts.compliantCount + counts.acceptedDeviationCount + counts.customerSpecificCount
        const compliancePercentage = totalTenants
          ? Math.round((alignedCount / totalTenants) * 100)
          : 0
        const licenseMissingPercentage = totalTenants
          ? Math.round((counts.licenseMissingCount / totalTenants) * 100)
          : 0

        return {
          standardId: standard.standardId,
          standardName: standard.standardName,
          category: standard.category,
          standardType: Array.from(standard.standardTypes).sort().join(', ') || 'N/A',
          totalTenants,
          alignedCount,
          compliancePercentage,
          alignmentScore: compliancePercentage,
          LicenseMissingPercentage: licenseMissingPercentage,
          complianceScore: `${compliancePercentage}%`,
          summaryStatus: compliancePercentage === 100 ? 'Fully Compliant' : 'Needs Attention',
          hasNonCompliant: counts.nonCompliantCount > 0 ? 'Yes' : 'No',
          hasLicenseMissing: counts.licenseMissingCount > 0 ? 'Yes' : 'No',
          hasAcceptedDeviation: counts.acceptedDeviationCount > 0 ? 'Yes' : 'No',
          isFullyCompliant: compliancePercentage === 100 ? 'Yes' : 'No',
          tenants,
          ...counts,
        }
      })
      .sort((a, b) => a.standardName.localeCompare(b.standardName))
  }, [byStandardSourceData])

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

  const byStandardFilterList = [
    {
      filterName: 'Fully Compliant',
      value: [{ id: 'isFullyCompliant', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Has Non-Compliant',
      value: [{ id: 'hasNonCompliant', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'License Missing',
      value: [{ id: 'hasLicenseMissing', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Accepted Deviation',
      value: [{ id: 'hasAcceptedDeviation', value: 'Yes' }],
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

      const statusColor = getComplianceColor(row.complianceStatus)

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

  const byStandardOffCanvas = {
    size: 'md',
    title: 'Standard Tenant Summary',
    contentPadding: 0,
    children: (row) => {
      const standardInfo = getStandardInfo(row.standardId)
      const properties = [
        { label: 'Standard', value: row.standardName },
        { label: 'Category', value: row.category },
        { label: 'Type', value: row.standardType },
        { label: 'Tenants', value: row.totalTenants },
        { label: 'Compliance', value: `${row.alignmentScore}%` },
        { label: 'Licenses Missing', value: `${row.LicenseMissingPercentage}%` },
      ]
      const tenants = row.tenants ?? []
      const compliantTenants = tenants.filter((tenant) =>
        isAlignedComplianceStatus(tenant.complianceStatus)
      )
      const nonCompliantTenants = tenants.filter(
        (tenant) => !isAlignedComplianceStatus(tenant.complianceStatus)
      )
      const filteredTenants =
        byStandardTenantFilter === 'compliant'
          ? compliantTenants
          : byStandardTenantFilter === 'nonCompliant'
            ? nonCompliantTenants
            : tenants

      return (
        <Stack spacing={0}>
          <Stack
            spacing={0}
            divider={<Divider />}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {properties.map(({ label, value }) => (
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
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                  {value ?? 'N/A'}
                </Typography>
              </Box>
            ))}
          </Stack>

          {standardInfo?.helpText && (
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
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
                Description
              </Typography>
              <Box
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  '& p': { mt: 0, mb: 1 },
                  '& p:last-child': { mb: 0 },
                  '& a': { color: 'primary.main' },
                  '& ul, & ol': { pl: 3, my: 1 },
                  '& code': {
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{standardInfo.helpText}</ReactMarkdown>
              </Box>
            </Box>
          )}

          <Stack spacing={1.5} sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Tenant Compliance
              </Typography>
              <ToggleButtonGroup
                value={byStandardTenantFilter}
                exclusive
                size="small"
                onChange={(event, newFilter) => {
                  if (newFilter !== null) setByStandardTenantFilter(newFilter)
                }}
                sx={{
                  alignSelf: { xs: 'flex-start', sm: 'center' },
                  '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.75rem' },
                }}
              >
                <ToggleButton value="all">All ({tenants.length})</ToggleButton>
                <ToggleButton value="compliant">Compliant ({compliantTenants.length})</ToggleButton>
                <ToggleButton value="nonCompliant">
                  Noncompliant ({nonCompliantTenants.length})
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {filteredTenants.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tenants match this filter.
              </Typography>
            )}
            {filteredTenants.map((tenant) => (
              <Box
                key={tenant.tenantFilter}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                      {tenant.tenantFilter}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Template: {tenant.templateName}
                    </Typography>
                  </Box>
                  <Chip
                    variant="outlined"
                    label={tenant.complianceStatus}
                    size="small"
                    color={getComplianceColor(tenant.complianceStatus)}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Last Applied:{' '}
                  {tenant.latestDataCollection
                    ? new Date(tenant.latestDataCollection).toLocaleString()
                    : 'N/A'}
                  {tenant.rowCount > 1 ? ` (${tenant.rowCount} template matches)` : ''}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      )
    },
  }

  const modeToggle = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 1, mt: '4px' }}>
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        size="small"
        onChange={(event, newViewMode) => {
          if (newViewMode !== null) setViewMode(newViewMode)
        }}
        sx={{ '& .MuiToggleButton-root': { py: 0.25, px: 1, fontSize: '0.75rem' } }}
      >
        <ToggleButton value="summary" aria-label="summary view">
          <Tooltip title="Tenant/template summary" placement="top">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <ChartBarIcon style={{ width: 16, height: 16, marginRight: 6 }} />
              Summary
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="granular" aria-label="per standard view">
          <Tooltip title="Tenant rows for each standard" placement="top">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <ListBulletIcon style={{ width: 16, height: 16, marginRight: 6 }} />
              Per Standard
            </Box>
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="byStandard" aria-label="by standard summary view">
          <Tooltip title="Aggregate tenant compliance by standard" placement="top">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Squares2X2Icon style={{ width: 16, height: 16, marginRight: 6 }} />
              By Standard
            </Box>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )

  return (
    <CippTablePage
      key={viewMode}
      title={pageTitle}
      apiUrl={isByStandard ? undefined : '/api/ListTenantAlignment'}
      apiData={isGranular ? { granular: 'true' } : {}}
      data={isByStandard ? byStandardData : undefined}
      isFetching={isByStandard && byStandardIsFetching}
      tenantInTitle={false}
      actions={isGranular ? granularActions : isSummary ? summaryActions : undefined}
      filters={
        isGranular ? granularFilterList : isByStandard ? byStandardFilterList : summaryFilterList
      }
      simpleColumns={
        isGranular
          ? [
              'tenantFilter',
              'complianceStatus',
              'standardName',
              'templateName',
              'standardType',
              'latestDataCollection',
            ]
          : isByStandard
            ? [
                'standardName',
                'category',
                'standardType',
                'totalTenants',
                'tenants',
                'compliancePercentage',
                'LicenseMissingPercentage',
                'alignedCount',
                'compliantCount',
                'nonCompliantCount',
                'licenseMissingCount',
                'acceptedDeviationCount',
              ]
            : [
                'tenantFilter',
                'standardName',
                'standardType',
                'alignmentScore',
                'LicenseMissingPercentage',
                'combinedAlignmentScore',
                'pendingDeviationsCount',
                'deniedDeviationsCount',
              ]
      }
      queryKey={
        isGranular
          ? 'listTenantAlignment-granular'
          : isByStandard
            ? 'listTenantAlignment-byStandard'
            : 'listTenantAlignment'
      }
      offCanvas={isGranular ? granularOffCanvas : isByStandard ? byStandardOffCanvas : undefined}
      offCanvasOnRowClick={isByStandard}
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
