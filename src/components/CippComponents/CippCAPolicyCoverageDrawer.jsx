import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippOffCanvas } from './CippOffCanvas'
import { CippDataTable } from '../CippTable/CippDataTable'
import { PermissionButton } from '../../utils/permissions'
import {
  formatCaCoverageStatus,
  getCaCoverageReasonParts,
  getCaCoverageReasonTypeMeta,
} from '../../utils/format-ca-coverage-reason'

const COVERAGE_FILTERS = [
  {
    filterName: 'Excluded',
    value: [{ id: 'status', value: 'excluded' }],
    type: 'column',
  },
  {
    filterName: 'Covered',
    value: [{ id: 'status', value: 'covered' }],
    type: 'column',
  },
]

const GUID_PATTERN = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i

const isGraphGroup = (item) =>
  !item?.['@odata.type'] || item['@odata.type'] === '#microsoft.graph.group'

const collectNestResolveGroupIds = (row) => {
  const reasons = [...(row?.includeReasons || []), ...(row?.excludeReasons || [])]
  const ids = []
  for (const reason of reasons) {
    if (
      (reason?.type === 'includeGroups' || reason?.type === 'excludeGroups') &&
      reason?.transitive &&
      GUID_PATTERN.test(reason?.id)
    ) {
      ids.push(reason.id)
    }
    if (
      (reason?.type === 'includeRoles' || reason?.type === 'excludeRoles') &&
      GUID_PATTERN.test(reason?.viaGroupId)
    ) {
      ids.push(reason.viaGroupId)
    }
  }
  return [...new Set(ids)]
}

const resolveViaNestedGroups = (memberOfValue, nestedUnderByAssignedId) => {
  const directGroups = (Array.isArray(memberOfValue) ? memberOfValue : []).filter(isGraphGroup)
  const directById = new Map(directGroups.map((group) => [group.id, group]))
  const viaByAssignedId = {}

  for (const [assignedId, nestedGroups] of Object.entries(nestedUnderByAssignedId || {})) {
    const via = []
    for (const nested of Array.isArray(nestedGroups) ? nestedGroups : []) {
      if (!isGraphGroup(nested) || !directById.has(nested.id)) continue
      const direct = directById.get(nested.id)
      via.push({
        id: nested.id,
        name: direct.displayName || nested.displayName || nested.id,
      })
    }
    viaByAssignedId[assignedId] = via
  }

  return viaByAssignedId
}

const enrichReasonsWithNestPath = (reasons, viaByAssignedId) =>
  (Array.isArray(reasons) ? reasons : []).map((reason) => {
    const isGroupReason =
      (reason?.type === 'includeGroups' || reason?.type === 'excludeGroups') &&
      reason?.transitive &&
      reason?.id
    const isRoleViaGroup =
      (reason?.type === 'includeRoles' || reason?.type === 'excludeRoles') && reason?.viaGroupId

    const lookupId = isGroupReason ? reason.id : isRoleViaGroup ? reason.viaGroupId : null
    if (!lookupId) return reason

    const viaNestedGroups = viaByAssignedId?.[lookupId]
    if (!viaNestedGroups?.length) return reason
    return { ...reason, viaNestedGroups }
  })

const reasonIcon = (reason) => {
  const type = reason?.type || ''
  if (type.includes('Roles')) return CippIcons.AdminPanelSettings
  if (type.includes('Groups')) return CippIcons.Groups
  if (type.includes('Guests') || reason?.value?.includes('GuestsOrExternalUsers')) {
    return CippIcons.Badge
  }
  if (type.includes('Users')) return CippIcons.Person
  return CippIcons.Shield
}

const cippEntityHref = (part, tenantFilter) => {
  if (!part?.id || !tenantFilter || !GUID_PATTERN.test(part.id)) return null
  const tenant = encodeURIComponent(tenantFilter)
  if (part.type === 'group') {
    return `/identity/administration/groups/group?groupId=${encodeURIComponent(
      part.id
    )}&tenantFilter=${tenant}`
  }
  if (part.type === 'role') {
    return `/identity/administration/roles?tenantFilter=${tenant}`
  }
  return null
}

const ReasonSentence = ({ reason, tenantFilter, tone }) => {
  const parts = getCaCoverageReasonParts(reason)

  return (
    <Typography
      component="div"
      variant="body2"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 0.5,
        rowGap: 0.75,
      }}
    >
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <Box component="span" key={`text-${index}`}>
              {part.value}
            </Box>
          )
        }

        const href = cippEntityHref(part, tenantFilter)
        if (href) {
          return (
            <Chip
              key={`${part.type}-${part.id || part.name}-${index}`}
              component={NextLink}
              href={href}
              clickable
              size="small"
              variant="outlined"
              color={tone === 'warning' ? 'warning' : 'primary'}
              label={part.name}
              sx={{ textDecoration: 'none' }}
            />
          )
        }

        return (
          <Chip
            key={`${part.type}-${part.name}-${index}`}
            size="small"
            variant="outlined"
            label={part.name}
          />
        )
      })}
    </Typography>
  )
}

const ReasonList = ({
  title,
  reasons,
  tone = 'success',
  tenantFilter,
  nestPathLoading = false,
}) => {
  const items = Array.isArray(reasons) ? reasons : []
  const accent = tone === 'warning' ? 'warning.main' : 'success.main'
  const Icon = tone === 'warning' ? CippIcons.PersonOff : CippIcons.Check

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              tone === 'warning'
                ? theme.palette.warning.main + '22'
                : theme.palette.success.main + '22',
            color: accent,
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {nestPathLoading && <CircularProgress size={14} />}
        <Chip
          size="small"
          variant="outlined"
          color={tone === 'warning' ? 'warning' : 'success'}
          label={items.length}
        />
      </Stack>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 1.5 }}>
          None
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ p: 1.5 }}>
          {items.map((reason) => {
            const ReasonIcon = reasonIcon(reason)
            const typeMeta = getCaCoverageReasonTypeMeta(reason)
            return (
              <Stack
                key={reason.value || reason.label}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderLeft: 3,
                  borderLeftColor: accent,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    mt: 0.15,
                    color: 'text.secondary',
                    display: 'flex',
                  }}
                >
                  <ReasonIcon fontSize="small" />
                </Box>
                <Stack spacing={0.75} sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                    <Tooltip title={typeMeta.tooltip} arrow placement="top-start">
                      <Chip
                        size="small"
                        variant="outlined"
                        color={tone === 'warning' ? 'warning' : 'success'}
                        label={typeMeta.chip}
                        sx={{ cursor: 'help' }}
                      />
                    </Tooltip>
                    {(reason?.transitive || (reason?.viaNestedGroups?.length ?? 0) > 0) && (
                      <Tooltip
                        title="Member through a child group, not a direct member of the assigned group."
                        arrow
                      >
                        <Chip
                          size="small"
                          color={tone === 'warning' ? 'warning' : 'info'}
                          variant="filled"
                          label="Nested"
                          sx={{ cursor: 'help' }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                  <ReasonSentence
                    reason={reason}
                    tenantFilter={tenantFilter}
                    tone={tone}
                  />
                </Stack>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}

const CoverageWhyOffCanvas = ({ row, tenantFilter }) => {
  const nestedAssignedIds = useMemo(() => collectNestResolveGroupIds(row), [row])
  const nestedKey = nestedAssignedIds.join(',')
  const nestBulk = ApiPostCall({ urlFromData: true })
  const nestFetchedKey = useRef(null)

  useEffect(() => {
    if (!row?.id || !tenantFilter || nestedAssignedIds.length === 0) {
      nestFetchedKey.current = null
      return
    }
    const key = `${tenantFilter}:${row.id}:${nestedKey}`
    if (nestFetchedKey.current === key) return
    nestFetchedKey.current = key

    nestBulk.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        tenantFilter,
        Requests: [
          {
            id: 'memberOf',
            method: 'GET',
            url: `/users/${row.id}/memberOf/microsoft.graph.group?$select=id,displayName`,
          },
          ...nestedAssignedIds.map((groupId) => ({
            id: `nestedUnder-${groupId}`,
            method: 'GET',
            url: `/groups/${groupId}/transitiveMembers/microsoft.graph.group?$select=id,displayName`,
          })),
        ],
      },
    })
    // nestBulk.mutate is stable; intentionally omit the mutation object from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when nest inputs change
  }, [row?.id, tenantFilter, nestedKey])

  const viaByAssignedId = useMemo(() => {
    if (!row?.id || nestedAssignedIds.length === 0) return {}
    if (nestBulk.isPending) return {}
    const expectedKey = `${tenantFilter}:${row.id}:${nestedKey}`
    if (nestFetchedKey.current !== expectedKey) return {}

    const bulkRows = Array.isArray(nestBulk?.data?.data) ? nestBulk.data.data : []
    if (bulkRows.length === 0) return {}

    const memberOfRow = bulkRows.find((item) => item.id === 'memberOf')
    const memberOfValue =
      memberOfRow?.body?.value ||
      (Array.isArray(memberOfRow?.body) ? memberOfRow.body : []) ||
      []

    const nestedUnderByAssignedId = {}
    for (const groupId of nestedAssignedIds) {
      const rowResult = bulkRows.find((item) => item.id === `nestedUnder-${groupId}`)
      nestedUnderByAssignedId[groupId] =
        rowResult?.body?.value ||
        (Array.isArray(rowResult?.body) ? rowResult.body : []) ||
        []
    }

    return resolveViaNestedGroups(memberOfValue, nestedUnderByAssignedId)
  }, [nestBulk?.data, nestBulk.isPending, nestedAssignedIds, nestedKey, row?.id, tenantFilter])

  const includeReasons = useMemo(
    () => enrichReasonsWithNestPath(row?.includeReasons, viaByAssignedId),
    [row?.includeReasons, viaByAssignedId]
  )
  const excludeReasons = useMemo(
    () => enrichReasonsWithNestPath(row?.excludeReasons, viaByAssignedId),
    [row?.excludeReasons, viaByAssignedId]
  )

  const nestPathLoading = nestedAssignedIds.length > 0 && nestBulk.isPending

  if (!row) return null
  const isExcluded = row.status === 'excluded'
  const StatusIcon = isExcluded ? CippIcons.PersonOff : CippIcons.Check

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              isExcluded
                ? theme.palette.warning.main + '22'
                : theme.palette.success.main + '22',
            color: isExcluded ? 'warning.main' : 'success.main',
            flexShrink: 0,
          }}
        >
          <CippIcons.Person />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.25, wordBreak: 'break-word' }}>
            {row.displayName || row.userPrincipalName || row.id}
          </Typography>
          {row.userPrincipalName && row.displayName && (
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {row.userPrincipalName}
            </Typography>
          )}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {row.status && (
              <Chip
                size="small"
                color={isExcluded ? 'warning' : 'success'}
                variant="outlined"
                icon={<StatusIcon />}
                label={formatCaCoverageStatus(row.status)}
              />
            )}
            {row.userType && (
              <Chip size="small" variant="outlined" label={row.userType} />
            )}
          </Stack>
        </Box>
      </Stack>

      {isExcluded && (row.includeReasons?.length ?? 0) > 0 && (
        <Alert severity="warning" variant="outlined">
          This identity matches include rules, but an exclusion wins. Net result is excluded.
        </Alert>
      )}

      {nestedAssignedIds.length > 0 && nestBulk.isError && (
        <Alert severity="info" variant="outlined">
          Could not resolve which nested group this membership goes through. The Nested badge still
          means membership is not direct.
        </Alert>
      )}

      <ReasonList
        title="Included via"
        reasons={includeReasons}
        tone="success"
        tenantFilter={tenantFilter}
        nestPathLoading={nestPathLoading && includeReasons.some((r) => r.transitive)}
      />
      <ReasonList
        title="Excluded via"
        reasons={excludeReasons}
        tone="warning"
        tenantFilter={tenantFilter}
        nestPathLoading={nestPathLoading && excludeReasons.some((r) => r.transitive)}
      />
    </Stack>
  )
}

/**
 * Drawer showing who a CA policy's identity assignment touches and why.
 * Opens from the CA policies list action.
 */
export const CippCAPolicyCoverageDrawer = ({
  policyId,
  policyName,
  tenantFilter,
  visible: controlledVisible,
  onClose: controlledOnClose,
  showButton = false,
  buttonText = 'View identity coverage',
  requiredPermissions = ['Tenant.ConditionalAccess.Read'],
  PermissionButtonComponent = PermissionButton,
  ...buttonProps
}) => {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = typeof controlledVisible === 'boolean'
  const drawerVisible = isControlled ? controlledVisible : internalVisible

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalVisible(false)
    }
  }

  const handleOpen = () => {
    if (!isControlled) {
      setInternalVisible(true)
    }
  }

  const coverage = ApiGetCall({
    url: '/api/ListCAPolicyCoverage',
    data: { tenantFilter, GUID: policyId },
    queryKey: `CAPolicyCoverage-${tenantFilter}-${policyId}`,
    waiting: Boolean(drawerVisible && policyId && tenantFilter),
  })

  const results = coverage.data?.Results
  const identities = Array.isArray(results?.identities) ? results.identities : []
  const summary = results?.summary
  const isLoading = coverage.isFetching && !results
  const title = policyName
    ? `Identity coverage - ${policyName}`
    : results?.displayName
      ? `Identity coverage - ${results.displayName}`
      : 'Identity coverage'

  const identityActions = useMemo(
    () => [
      {
        label: 'View User',
        link: `/identity/administration/users/user?userId=[id]&tenantFilter=${encodeURIComponent(
          tenantFilter || ''
        )}`,
        pinned: true,
        multiPost: false,
        hideBulk: true,
        icon: <CippIcons.EyeIcon />,
        color: 'success',
      },
      {
        label: 'View in Entra',
        link: `https://entra.microsoft.com/${encodeURIComponent(
          tenantFilter || ''
        )}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/[id]`,
        external: true,
        multiPost: false,
        hideBulk: true,
        icon: <CippIcons.Launch />,
        color: 'info',
      },
    ],
    [tenantFilter]
  )

  return (
    <>
      {showButton && (
        <PermissionButtonComponent
          requiredPermissions={requiredPermissions}
          onClick={handleOpen}
          startIcon={<CippIcons.People />}
          {...buttonProps}
        >
          {buttonText}
        </PermissionButtonComponent>
      )}
      <CippOffCanvas title={title} visible={drawerVisible} onClose={handleClose} size="xl">
        <Box sx={{ mb: 2 }}>
          {coverage.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load identity coverage.
            </Alert>
          )}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 4 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Resolving identity coverage…
              </Typography>
            </Box>
          )}
          {results && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {results.includesAllUsers && (
                <Chip size="small" color="info" variant="outlined" label="Includes all users" />
              )}
              <Tooltip
                title="Identities that appear in at least one concrete include or exclude on this policy (users, groups, roles, or guests). All users is noted separately and does not list every directory user here."
                arrow
              >
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Touched: ${summary?.touchedCount ?? identities.length}`}
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
              <Tooltip
                title="Touched identities that match an include path and are not hit by any exclusion. Net result: this policy's assignment covers them."
                arrow
              >
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label={`Covered: ${summary?.coveredCount ?? 0}`}
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
              <Tooltip
                title="Touched identities hit by an exclusion (even if they also match an include). Exclude wins, so they are not covered by this policy's assignment."
                arrow
              >
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`Excluded: ${summary?.excludedCount ?? 0}`}
                  sx={{ cursor: 'help' }}
                />
              </Tooltip>
              {(summary?.unresolvedCount ?? 0) > 0 && (
                <Chip
                  size="small"
                  color="error"
                  variant="outlined"
                  label={`Unresolved: ${summary.unresolvedCount}`}
                />
              )}
            </Stack>
          )}
          {results?.includesAllUsers &&
            !results?.hasExclusions &&
            identities.length === 0 &&
            !coverage.isFetching && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This policy includes all users and has no exclusions. Individual rows appear only
                when identities are also touched by a concrete assignment (users, groups, roles, or
                guests).
              </Typography>
            )}
          {!coverage.isFetching &&
            results &&
            identities.length === 0 &&
            !(results.includesAllUsers && !results.hasExclusions) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No identities were touched by a concrete include or exclude on this policy.
              </Alert>
            )}
          {(results?.unresolved?.length ?? 0) > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {results.unresolved.length} assignment reference(s) could not be resolved (deleted
              users, groups, or roles).
            </Alert>
          )}
          {!isLoading && (
            <CippDataTable
              title="Identity coverage"
              hideTitle={true}
              noCard={true}
              simple={false}
              isFetching={coverage.isFetching}
              data={identities}
              filters={COVERAGE_FILTERS}
              actions={identityActions}
              simpleColumns={[
                'displayName',
                'userPrincipalName',
                'userType',
                'status',
                'includeReasons',
                'excludeReasons',
              ]}
              exportEnabled={true}
              maxHeightOffset="200px"
              offCanvasOnRowClick={true}
              offCanvas={{
                title: 'Why this identity',
                size: 'md',
                children: (row) => (
                  <CoverageWhyOffCanvas row={row} tenantFilter={tenantFilter} />
                ),
              }}
            />
          )}
        </Box>
      </CippOffCanvas>
    </>
  )
}

export default CippCAPolicyCoverageDrawer
