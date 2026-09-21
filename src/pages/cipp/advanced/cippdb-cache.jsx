import { Layout as DashboardLayout } from '../../../layouts/index'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ApiPostCall } from '../../../api/ApiCall'
import { CippPropertyListCard } from '../../../components/CippCards/CippPropertyListCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { useDialog } from '../../../hooks/use-dialog'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  Check,
  DeleteSweep,
  FilterList,
  Sync,
  WarningAmber,
} from '@mui/icons-material'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { useSettings } from '../../../hooks/use-settings'
import { useForm, useWatch } from 'react-hook-form'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { Grid } from '@mui/system'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippQueueTracker } from '../../../components/CippTable/CippQueueTracker'
import cacheTypes from '../../../data/CIPPDBCacheTypes.json'
import {
  CACHE_CATEGORY_LABELS,
  CACHE_CATEGORY_OPTIONS,
  getCacheTypeCategory,
} from '../../../utils/cippdb-cache-categories'

const apiUrl = '/api/ExecCIPPDBCacheAdmin'
const syncApiUrl = '/api/ExecCIPPDBCache'
const pageTitle = 'CIPPDB Cache'
const META_COLUMNS = ['CIPPPartitionKey', 'CIPPRowKey', 'CIPPETag']
// Browsable, but written as a side effect of another collector rather than by a
// Set-CIPPDBCache<Type> of their own, so the sync endpoint has nothing to call for them.
const NON_SYNCABLE_TYPES = ['OneDriveSiteListing', 'SharePointSiteListing']

const unwrapResults = (result) => {
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.Results)) return result.Results
  return []
}

const deriveSimpleColumns = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return []
  const keys = new Set()
  rows.slice(0, 50).forEach((row) => {
    if (!row || typeof row !== 'object') return
    Object.keys(row).forEach((key) => {
      if (!META_COLUMNS.includes(key)) keys.add(key)
    })
  })
  return [...keys]
}

const Page = () => {
  const formControl = useForm({ mode: 'onChange' })
  const emptyDialog = useDialog()
  const syncDialog = useDialog()
  const [selectedType, setSelectedType] = useState(null)
  const [tableData, setTableData] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState(null)
  const [syncQueueId, setSyncQueueId] = useState(null)
  const loadGeneration = useRef(0)

  const typeFilter = useWatch({
    control: formControl.control,
    name: 'typeFilter',
  })
  // The header tenant picker is the only tenant source on this page. A second selector here
  // could disagree with it, and both reach the API as one case-insensitive query key, which the
  // service joins into a single "tenantA,tenantB" value instead of picking one.
  const tenantValue = useSettings().currentTenant ?? null

  const fetchCacheData = ApiPostCall({
    queryKey: 'CIPPDBCacheAdminList',
  })

  const rowAction = ApiPostCall({
    queryKey: 'CIPPDBCacheAdminRemove',
    onResult: () => {
      handleLoad()
    },
  })

  const applyListResult = (generation, response) => {
    if (generation !== loadGeneration.current) return
    setTableData(unwrapResults(response?.data ?? response))
  }

  const handleLoad = () => {
    if (!selectedType || !tenantValue) return
    const generation = ++loadGeneration.current
    fetchCacheData.mutate(
      {
        url: apiUrl,
        data: {
          Action: 'List',
          TenantFilter: tenantValue,
          Type: selectedType,
        },
      },
      {
        onSuccess: (response) => applyListResult(generation, response),
      }
    )
  }

  // Switching tenant in the header would otherwise leave the previous tenant's rows on screen
  // under the new tenant's name, so drop them and fetch the new tenant's set.
  useEffect(() => {
    loadGeneration.current += 1
    setTableData([])
    handleLoad()
  }, [tenantValue])

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setTableData([])
    if (!tenantValue) return
    const generation = ++loadGeneration.current
    fetchCacheData.mutate(
      {
        url: apiUrl,
        data: {
          Action: 'List',
          TenantFilter: tenantValue,
          Type: type,
        },
      },
      {
        onSuccess: (response) => applyListResult(generation, response),
      }
    )
  }

  const simpleColumns = useMemo(
    () => deriveSimpleColumns(tableData),
    [tableData]
  )

  const selectedTypeMeta = cacheTypes.find(
    (entry) => entry.type === selectedType
  )

  const actionItems = cacheTypes
    .filter((entry) => {
      if (
        categoryFilter !== 'All' &&
        getCacheTypeCategory(entry.type) !== categoryFilter
      ) {
        return false
      }
      if (!typeFilter) return true
      const needle = String(typeFilter).toLowerCase()
      return (
        entry.type.toLowerCase().includes(needle) ||
        entry.friendlyName?.toLowerCase().includes(needle) ||
        entry.description?.toLowerCase().includes(needle)
      )
    })
    .map((entry) => ({
      label: `${entry.friendlyName} (${entry.type})`,
      customFunction: () => handleTypeSelect(entry.type),
      noConfirm: true,
    }))

  const propertyItems = [
    {
      label: '',
      value: (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', my: 1, width: '100%' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CippFormComponent
              type="textField"
              name="typeFilter"
              formControl={formControl}
              placeholder="Search cache types"
              hiddenLabel
              disableVariables
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ margin: '0 !important', alignSelf: 'center' }}
                    >
                      <SvgIcon fontSize="small" color="action">
                        <MagnifyingGlassIcon />
                      </SvgIcon>
                    </InputAdornment>
                  ),
                  sx: {
                    '& .MuiInputAdornment-root': {
                      marginTop: '0 !important',
                      marginBottom: '0 !important',
                      alignSelf: 'center',
                    },
                  },
                },
              }}
            />
          </Box>
          <Tooltip title="Filter by category">
            <IconButton
              size="small"
              color={categoryFilter === 'All' ? 'default' : 'primary'}
              onClick={(event) => setCategoryMenuAnchor(event.currentTarget)}
              aria-label="Filter cache categories"
            >
              <FilterList fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={categoryMenuAnchor}
            open={Boolean(categoryMenuAnchor)}
            onClose={() => setCategoryMenuAnchor(null)}
            slotProps={{ paper: { sx: { maxHeight: 360 } } }}
          >
            {CACHE_CATEGORY_OPTIONS.map((category) => (
              <MenuItem
                key={category}
                selected={categoryFilter === category}
                onClick={() => {
                  setCategoryFilter(category)
                  setCategoryMenuAnchor(null)
                }}
              >
                {categoryFilter === category ? (
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Check fontSize="small" />
                  </ListItemIcon>
                ) : (
                  <ListItemIcon sx={{ minWidth: 32 }} />
                )}
                <ListItemText primary={CACHE_CATEGORY_LABELS[category]} />
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      ),
    },
  ]

  const isSyncable =
    Boolean(selectedType) && !NON_SYNCABLE_TYPES.includes(selectedType)

  const syncConfirmText =
    tenantValue === 'AllTenants' ? (
      <Typography variant="body1">
        Re-collect <strong>{selectedType}</strong> from Microsoft for{' '}
        <strong>every tenant</strong> and write it back to the cache? This
        queues one job per tenant and runs in the background.
      </Typography>
    ) : (
      <Typography variant="body1">
        Re-collect <strong>{selectedType}</strong> from Microsoft for{' '}
        <strong>{tenantValue}</strong> and write it back to the cache? This runs
        in the background; the grid refreshes when the queue finishes.
      </Typography>
    )

  const emptyConfirmText =
    tenantValue === 'AllTenants' ? (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <WarningAmber color="warning" />
        <Typography variant="body1">
          Empty <strong>{selectedType}</strong> for <strong>AllTenants</strong>?
          This deletes every row of that cache type across every tenant
          partition, including count metadata. Data returns only after the next
          cache sync. This cannot be undone.
        </Typography>
      </Stack>
    ) : (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <WarningAmber color="warning" />
        <Typography variant="body1">
          Empty <strong>{selectedType}</strong> for{' '}
          <strong>{tenantValue}</strong>? This deletes all rows for that cache
          type on the tenant, including count metadata. Data returns only after
          the next cache sync. This cannot be undone.
        </Typography>
      </Stack>
    )

  return (
    <Container maxWidth={false} sx={{ width: '100%' }}>
      <CippHead title={pageTitle} noTenant={true} />
      <Typography variant="h4" gutterBottom>
        {pageTitle}
      </Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        SuperAdmin tool for browsing and clearing CIPPDB reporting cache
        collections. Deletes are permanent until the next nightly or manual
        cache sync. Prefer this over Table Maintenance when working with
        CippReportingDB.
      </Alert>
      <Grid sx={{ flexGrow: 1, display: 'flex' }} container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <CippPropertyListCard
            title="Cache Types"
            propertyItems={propertyItems}
            actionItems={actionItems}
            cardSx={{ maxHeight: 'calc(100vh - 170px)', overflow: 'auto' }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Tenant
              </Typography>
              <Typography variant="subtitle1">
                {tenantValue ?? 'Select a tenant in the header'}
              </Typography>
            </Box>

            {selectedType && (
              <Box sx={{ width: '100%' }}>
                <CippApiResults apiObject={rowAction} />
                <CippDataTable
                  title={
                    selectedTypeMeta
                      ? `${selectedTypeMeta.friendlyName} (${selectedType})`
                      : selectedType
                  }
                  data={tableData}
                  simpleColumns={simpleColumns}
                  refreshFunction={handleLoad}
                  isFetching={fetchCacheData.isPending}
                  cardButton={
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center' }}
                    >
                      <CippQueueTracker
                        queueId={syncQueueId}
                        queryKey="CIPPDBCacheAdminList"
                        title={`${selectedType} Cache Sync`}
                        onQueueComplete={handleLoad}
                      />
                      <Tooltip
                        title={
                          isSyncable
                            ? ''
                            : `${selectedType} is populated by another collector and cannot be synced on its own`
                        }
                      >
                        <span>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={
                              !tenantValue ||
                              !isSyncable ||
                              fetchCacheData.isPending
                            }
                            onClick={syncDialog.handleOpen}
                            startIcon={
                              <SvgIcon fontSize="small">
                                <Sync />
                              </SvgIcon>
                            }
                          >
                            Sync Cache
                          </Button>
                        </span>
                      </Tooltip>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={!tenantValue || fetchCacheData.isPending}
                        onClick={emptyDialog.handleOpen}
                        startIcon={
                          <SvgIcon fontSize="small">
                            <DeleteSweep />
                          </SvgIcon>
                        }
                      >
                        Empty Cache
                      </Button>
                    </Stack>
                  }
                  actions={[
                    {
                      label: 'Delete',
                      type: 'POST',
                      icon: (
                        <SvgIcon fontSize="small">
                          <TrashIcon />
                        </SvgIcon>
                      ),
                      url: apiUrl,
                      customFunction: (row) => {
                        const rows = Array.isArray(row) ? row : [row]
                        rowAction.mutate({
                          url: apiUrl,
                          data: {
                            Action: 'Remove',
                            Type: selectedType,
                            TenantFilter: tenantValue,
                            Rows: rows.map((r) => ({
                              CIPPPartitionKey: r.CIPPPartitionKey,
                              CIPPRowKey: r.CIPPRowKey,
                              CIPPETag: r.CIPPETag,
                            })),
                          },
                        })
                      },
                      confirmText:
                        'Delete the selected cache record(s)? This cannot be undone until the cache is synced again.',
                      multiPost: true,
                    },
                  ]}
                />
              </Box>
            )}

            {!selectedType && (
              <Alert severity="info">
                Select a cache type to browse its rows for a tenant.
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>

      <CippApiDialog
        title="Sync Cache"
        createDialog={syncDialog}
        fields={[]}
        api={{
          url: syncApiUrl,
          confirmText: syncConfirmText,
          type: 'GET',
          data: {
            Name: selectedType,
            // No TenantFilter here on purpose: CippApiDialog already sends the header tenant as
            // tenantFilter, and adding a second casing of the same key makes the service receive
            // both values joined by a comma.
            // Mailboxes collects permissions, calendar permissions and rules by default. Those
            // are separate cache types on this page, so keep a Mailboxes sync to mailbox rows.
            ...(selectedType === 'Mailboxes' ? { Types: 'None' } : {}),
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result.Metadata.QueueId)
            }
          },
        }}
      />

      <CippApiDialog
        title="Empty Cache"
        createDialog={emptyDialog}
        fields={[]}
        api={{
          url: apiUrl,
          confirmText: emptyConfirmText,
          type: 'POST',
          dataFunction: () => ({
            Action: 'Empty',
            Type: selectedType,
            TenantFilter: tenantValue,
          }),
          onSuccess: () => {
            // Invalidate any in-flight List so it cannot repopulate the grid after Empty.
            loadGeneration.current += 1
            setTableData([])
            handleLoad()
          },
        }}
      />
    </Container>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
