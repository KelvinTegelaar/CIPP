import React, { useState, useEffect, useMemo } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Stack,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
} from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useFormState, useWatch } from 'react-hook-form'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { CippApiResults } from './CippApiResults'
import { useSettings } from '../../hooks/use-settings'
import { ApiPostCall } from '../../api/ApiCall'
import { isMultiTenant } from '../../utils/tenant-selection'
import { useTenantLabel } from '../../hooks/use-tenant-label'

const parseJson = (value) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
const asArray = (value) =>
  value == null ? [] : Array.isArray(value) ? value : [value]
const policyItems = (value) =>
  asArray(parseJson(parseJson(value))?.policies).map((p) => ({
    key: p.Identity,
    label: p.Name || p.Identity,
  }))
// A failed capture is stored as a plain message string and has no name to pick by.
const intuneItems = (value) =>
  asArray(parseJson(value)).map((t) => ({
    key: t?.DisplayName ? `${t.Type ?? ''}|${t.DisplayName}` : null,
    label: t?.DisplayName,
    sub: t?.Type,
  }))
const rowItems = (value) =>
  asArray(parseJson(value)).map((r) => ({
    key: r.RowKey,
    label: r.Name || r.RowKey,
    sub: r.Description,
  }))

// Item keys must match the filter in New-CIPPRestoreTask
const RESTORE_CATEGORIES = [
  {
    name: 'users',
    label: 'Users',
    read: (value) =>
      asArray(parseJson(value)).map((u) => ({
        key: u.id,
        label: u.displayName || u.userPrincipalName,
        sub: u.userPrincipalName,
      })),
  },
  {
    name: 'groups',
    label: 'Groups',
    read: (value) =>
      asArray(parseJson(value)).map((g) => ({
        key: g.id,
        label: g.displayName,
        sub: g.mail,
      })),
  },
  {
    name: 'ca',
    label: 'Conditional Access Policies',
    read: (value) =>
      asArray(parseJson(value)).map((t) => {
        const name = parseJson(t)?.displayName
        return { key: name, label: name }
      }),
  },
  {
    name: 'intuneconfig',
    label: 'Intune Configuration Policies',
    read: intuneItems,
  },
  {
    name: 'intunecompliance',
    label: 'Intune Compliance Policies',
    read: intuneItems,
  },
  {
    name: 'intuneprotection',
    label: 'Intune Protection Policies',
    read: intuneItems,
  },
  { name: 'antispam', label: 'Anti-Spam Policies', read: policyItems },
  { name: 'antiphishing', label: 'Anti-Phishing Policies', read: policyItems },
  {
    name: 'teamsvoice',
    label: 'Teams Phone Number Assignments',
    read: (value) =>
      asArray(parseJson(value)).map((n) => ({
        key: n.telephoneNumber,
        label: n.telephoneNumber,
        sub:
          n.assignmentStatus === 'voiceApplicationAssigned'
            ? 'Resource account'
            : 'User',
      })),
  },
  { name: 'CippWebhookAlerts', label: 'Webhook Alerts', read: rowItems },
  { name: 'CippScriptedAlerts', label: 'Scripted Alerts', read: rowItems },
  { name: 'CippCustomVariables', label: 'Custom Variables', read: rowItems },
]

const MAX_SHOWN_ITEMS = 200

const RestoreItemPicker = ({ label, items, selected, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const term = search.trim().toLowerCase()
  const shown = term
    ? items.filter((i) =>
        `${i.label ?? ''} ${i.sub ?? ''}`.toLowerCase().includes(term)
      )
    : items
  const allSelected = selected.size === items.length
  const setKeys = (keys, on) => {
    const next = new Set(selected)
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)))
    onChange(next)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          sx={{ flex: 1, mr: 0 }}
          control={
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onChange={() =>
                setKeys(
                  items.map((i) => i.key),
                  !allSelected
                )
              }
            />
          }
          label={<Typography variant="body2">{label}</Typography>}
        />
        <Chip
          size="small"
          variant="outlined"
          color={selected.size === 0 ? 'warning' : 'default'}
          label={
            allSelected
              ? `All ${items.length}`
              : selected.size === 0
                ? 'None, skipped'
                : `${selected.size} of ${items.length}`
          }
        />
        <IconButton
          size="small"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Choose ${label}`}
        >
          {open ? (
            <CippIcons.ExpandLess fontSize="small" />
          ) : (
            <CippIcons.ExpandMore fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={open} unmountOnExit>
        <Stack spacing={1} sx={{ pl: 4, pr: 1, pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              size="small"
              fullWidth
              placeholder={`Search ${label.toLowerCase()}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CippIcons.Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              size="small"
              onClick={() =>
                setKeys(
                  shown.map((i) => i.key),
                  true
                )
              }
            >
              {term ? 'Select matches' : 'All'}
            </Button>
            <Button
              size="small"
              onClick={() =>
                setKeys(
                  shown.map((i) => i.key),
                  false
                )
              }
            >
              {term ? 'Clear matches' : 'None'}
            </Button>
          </Stack>
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            {shown.slice(0, MAX_SHOWN_ITEMS).map((item) => (
              <Box
                key={item.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 0.5,
                  minWidth: 0,
                }}
              >
                <Checkbox
                  size="small"
                  sx={{ p: 0.5 }}
                  checked={selected.has(item.key)}
                  onChange={() => setKeys([item.key], !selected.has(item.key))}
                  inputProps={{ 'aria-label': item.label }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap title={item.label}>
                    {item.label}
                  </Typography>
                  {item.sub && (
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ color: 'text.secondary', display: 'block' }}
                    >
                      {item.sub}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
            {shown.length === 0 && (
              <Typography
                variant="body2"
                sx={{ p: 1, color: 'text.secondary' }}
              >
                Nothing matches your search.
              </Typography>
            )}
          </Box>
          {shown.length > MAX_SHOWN_ITEMS && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Showing the first {MAX_SHOWN_ITEMS} of {shown.length}. Search to
              find the rest.
            </Typography>
          )}
        </Stack>
      </Collapse>
    </Box>
  )
}

export const CippRestoreBackupDrawer = ({
  buttonText = 'Restore Backup',
  backupName = null,
  backupData = null,
  requiredPermissions = [],
  PermissionButton = Button,
  ...props
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const userSettingsDefaults = useSettings()
  const tenantFilter = userSettingsDefaults.currentTenant || ''
  const tenantLabel = useTenantLabel(tenantFilter)

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      tenantFilter: tenantFilter,
      users: true,
      groups: true,
      ca: true,
      intuneconfig: true,
      intunecompliance: true,
      intuneprotection: true,
      antispam: true,
      antiphishing: true,
      teamsvoice: true,
      CippWebhookAlerts: true,
      CippScriptedAlerts: true,
      CippCustomVariables: true,
      CippStandards: true,
      overwrite: false,
      webhook: false,
      email: false,
      psa: false,
      backup: backupName ? { value: backupName, label: backupName } : null,
    },
  })

  const restoreBackup = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`BackupTasks-${tenantFilter}`],
  })

  const { isValid, isDirty } = useFormState({ control: formControl.control })

  // If in AllTenants context, use the tenant from the backup data
  const restoreTenant =
    isMultiTenant(tenantFilter) && backupData?.tenantSource
      ? backupData.tenantSource
      : tenantFilter
  const watched = useWatch({ control: formControl.control })
  const selectedBackupName = watched.backup?.value || watched.backup

  // Fetched only when items are picked, and as a POST so the full backup is not held in the server's response cache.
  const backupContent = ApiPostCall({})
  const contentUrl = selectedBackupName
    ? `/api/ExecListBackup?BackupName=${encodeURIComponent(selectedBackupName)}&Type=Scheduled`
    : null
  const isCurrentContent =
    !!contentUrl && backupContent.variables?.url === contentUrl
  const loadContent = () =>
    backupContent.mutate({
      url: contentUrl,
      data: { tenantFilter: restoreTenant },
    })

  const content = useMemo(() => {
    if (!isCurrentContent || !backupContent.isSuccess) return null
    const rows = backupContent.data?.data
    const row = Array.isArray(rows) ? rows[0] : null
    if (!row) return null
    return row.Backup ? parseJson(row.Backup) : row
  }, [isCurrentContent, backupContent.isSuccess, backupContent.data])
  // A missing backup or a blob the server could not read still returns 200.
  const contentFailed =
    isCurrentContent &&
    (backupContent.isError || (backupContent.isSuccess && !content))

  // Only items with a key can be picked; same-key entries restore together, so list them once.
  const itemsByCategory = useMemo(() => {
    const result = {}
    for (const cat of RESTORE_CATEGORIES) {
      const seen = new Set()
      result[cat.name] = content
        ? cat
            .read(content[cat.name])
            .filter((i) => i.key && !seen.has(i.key) && seen.add(i.key))
        : []
    }
    return result
  }, [content])

  // Selection made for another backup does not apply; every category starts fully selected.
  const [selection, setSelection] = useState({ source: null, sets: {} })
  const allSelected = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(itemsByCategory).map(([name, items]) => [
          name,
          new Set(items.map((i) => i.key)),
        ])
      ),
    [itemsByCategory]
  )
  const selectedFor = (name) =>
    (selection.source === content && selection.sets[name]) || allSelected[name]
  const setSelectedFor = (name, keys) =>
    setSelection((prev) => ({
      source: content,
      sets: { ...(prev.source === content ? prev.sets : {}), [name]: keys },
    }))

  useEffect(() => {
    if (restoreBackup.isSuccess) {
      formControl.reset({
        tenantFilter: tenantFilter,
        users: true,
        groups: true,
        ca: true,
        intuneconfig: true,
        intunecompliance: true,
        intuneprotection: true,
        antispam: true,
        antiphishing: true,
        teamsvoice: true,
        CippWebhookAlerts: true,
        CippScriptedAlerts: true,
        CippCustomVariables: true,
        CippStandards: true,
        overwrite: false,
        webhook: false,
        email: false,
        psa: false,
        backup: backupName ? { value: backupName, label: backupName } : null,
      })
    }
  }, [restoreBackup.isSuccess])

  const handleSubmit = () => {
    formControl.trigger()
    if (!isValid) {
      return
    }
    const values = formControl.getValues()
    const startDate = new Date()
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45

    const tenantFilterValue = restoreTenant

    // A partly selected category sends its item keys; one with nothing selected is skipped.
    const items = {}
    const skipped = {}
    for (const cat of RESTORE_CATEGORIES) {
      const all = itemsByCategory[cat.name]
      if (!values[cat.name] || all.length === 0) continue
      const keys = selectedFor(cat.name)
      if (keys.size === 0) skipped[cat.name] = false
      else if (keys.size < all.length) items[cat.name] = [...keys]
    }

    const shippedValues = {
      TenantFilter: tenantFilterValue,
      Name: `CIPP Restore ${tenantFilterValue}`,
      Command: { value: `New-CIPPRestore` },
      Parameters: {
        Type: 'Scheduled',
        RestoreValues: {
          backup: values.backup?.value || values.backup,
          users: values.users,
          groups: values.groups,
          ca: values.ca,
          intuneconfig: values.intuneconfig,
          intunecompliance: values.intunecompliance,
          intuneprotection: values.intuneprotection,
          antispam: values.antispam,
          antiphishing: values.antiphishing,
          teamsvoice: values.teamsvoice,
          CippWebhookAlerts: values.CippWebhookAlerts,
          CippScriptedAlerts: values.CippScriptedAlerts,
          CippCustomVariables: values.CippCustomVariables,
          ...skipped,
          overwrite: values.overwrite,
          ...(Object.keys(items).length > 0 && { items }),
        },
      },
      ScheduledTime: unixTime,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
      DisallowDuplicateName: true,
    }

    restoreBackup.mutate({
      url: '/api/AddScheduledItem',
      data: shippedValues,
    })
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    setSelection({ source: null, sets: {} })
    backupContent.reset()
    formControl.reset({
      tenantFilter: tenantFilter,
      users: true,
      groups: true,
      ca: true,
      intuneconfig: true,
      intunecompliance: true,
      intuneprotection: true,
      antispam: true,
      antiphishing: true,
      teamsvoice: true,
      CippWebhookAlerts: true,
      CippScriptedAlerts: true,
      CippCustomVariables: true,
      CippStandards: true,
      overwrite: false,
      webhook: false,
      email: false,
      psa: false,
      backup: backupName ? { value: backupName, label: backupName } : null,
    })
  }

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={() => setDrawerVisible(true)}
        startIcon={<CippIcons.SettingsBackupRestore />}
        {...props}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Restore Configuration Backup"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={restoreBackup} />
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
                onClick={formControl.handleSubmit(handleSubmit)}
                disabled={
                  restoreBackup.isPending || !isValid || backupContent.isPending
                }
              >
                {restoreBackup.isPending
                  ? 'Creating Restore Task...'
                  : restoreBackup.isSuccess
                    ? 'Create Another Restore Task'
                    : 'Restore Backup'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </Stack>
        }
      >
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Use this form to restore a backup for a tenant. Please select the
            backup and restore options.
          </Typography>

          <Grid container spacing={2}>
            {/* Backup Selector */}
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label={`Backups for ${tenantLabel}`}
                name="backup"
                multiple={false}
                api={{
                  url: '/api/ExecListBackup',
                  queryKey: `BackupList-${tenantFilter}-autocomplete`,
                  labelField: (option) => {
                    const match = option.BackupName.match(
                      /.*_(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})/
                    )
                    const dateTime = match
                      ? `${match[1]} @ ${match[2]}:${match[3]}`
                      : option.BackupName
                    const tenantDisplay = isMultiTenant(tenantFilter)
                      ? ` (${option.TenantFilter})`
                      : ''
                    return `${dateTime}${tenantDisplay}`
                  },
                  valueField: 'BackupName',
                  data: {
                    Type: 'Scheduled',
                    NameOnly: true,
                    tenantFilter: tenantFilter,
                  },
                }}
                formControl={formControl}
                required={true}
                validators={{
                  validate: (value) => !!value || 'Please select a backup',
                }}
              />
            </Grid>

            {/* Restore Settings */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Restore Settings</Typography>
            </Grid>

            {/* Identity */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">Identity</Typography>
              <CippFormComponent
                type="switch"
                label="User List"
                name="users"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Groups"
                name="groups"
                formControl={formControl}
              />
            </Grid>

            {/* Conditional Access */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">Conditional Access</Typography>
              <CippFormComponent
                type="switch"
                label="Conditional Access Configuration"
                name="ca"
                formControl={formControl}
              />
            </Grid>

            {/* Intune */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">Intune</Typography>
              <CippFormComponent
                type="switch"
                label="Intune Configuration Policies"
                name="intuneconfig"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Intune Compliance Policies"
                name="intunecompliance"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Intune Protection Policies"
                name="intuneprotection"
                formControl={formControl}
              />
            </Grid>

            {/* Email Security */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">Email Security</Typography>
              <CippFormComponent
                type="switch"
                label="Anti-Spam Policies"
                name="antispam"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Anti-Phishing Policies"
                name="antiphishing"
                formControl={formControl}
              />
            </Grid>

            {/* Teams */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">Teams</Typography>
              <CippFormComponent
                type="switch"
                label="Teams Phone Number Assignments"
                name="teamsvoice"
                formControl={formControl}
              />
            </Grid>

            {/* CIPP */}
            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle1">CIPP</Typography>
              <CippFormComponent
                type="switch"
                label="Webhook Alerts Configuration"
                name="CippWebhookAlerts"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Scripted Alerts Configuration"
                name="CippScriptedAlerts"
                formControl={formControl}
              />
              <CippFormComponent
                type="switch"
                label="Custom Variables"
                name="CippCustomVariables"
                formControl={formControl}
              />
            </Grid>

            {/* Individual items */}
            {selectedBackupName && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Choose Items</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  Everything in the selected categories is restored by default.
                  To restore only some items, choose them from the backup.
                </Typography>
                {isCurrentContent && backupContent.isPending ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <CircularProgress size={16} />
                    <Typography variant="body2">
                      Loading backup contents&hellip;
                    </Typography>
                  </Stack>
                ) : !content ? (
                  <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
                    {contentFailed && (
                      <Alert severity="error">
                        The backup contents could not be loaded, so items cannot
                        be chosen. The restore will include everything in the
                        selected categories.
                      </Alert>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={loadContent}
                    >
                      Choose individual items
                    </Button>
                  </Stack>
                ) : (
                  RESTORE_CATEGORIES.filter(
                    (cat) =>
                      watched[cat.name] && itemsByCategory[cat.name].length > 0
                  ).map((cat) => (
                    <RestoreItemPicker
                      key={cat.name}
                      label={cat.label}
                      items={itemsByCategory[cat.name]}
                      selected={selectedFor(cat.name)}
                      onChange={(keys) => setSelectedFor(cat.name, keys)}
                    />
                  ))
                )}
              </Grid>
            )}

            {/* Overwrite Existing Entries */}
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Overwrite existing entries"
                name="overwrite"
                formControl={formControl}
              />
              <CippFormCondition
                formControl={formControl}
                field="overwrite"
                compareType="is"
                compareValue={true}
              >
                <Grid size={{ xs: 12 }}>
                  <Alert severity="warning">
                    <strong>Warning:</strong> Overwriting existing entries will
                    remove the current settings and replace them with the backup
                    settings. If you have selected to restore users, all
                    properties will be overwritten with the backup settings. To
                    prevent and skip already existing entries, deselect the
                    setting from the list above, or disable overwrite.
                  </Alert>
                </Grid>
              </CippFormCondition>
            </Grid>

            {/* Send Results To */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1">
                Send Restore results to:
              </Typography>
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Webhook"
                name="webhook"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="E-mail"
                name="email"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="PSA"
                name="psa"
                formControl={formControl}
              />
            </Grid>
          </Grid>
        </Box>
      </CippOffCanvas>
    </>
  )
}
