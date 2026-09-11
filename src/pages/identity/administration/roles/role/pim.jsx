import { useMemo, useState } from 'react'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { usePermissions } from '../../../../../hooks/use-permissions'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import tabOptions from './tabOptions.json'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import {
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import { CippPropertyList } from '../../../../../components/CippComponents/CippPropertyList'
import { getCippFormatting } from '../../../../../utils/get-cipp-formatting'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import CippInfoTooltip from '../../../../../components/CippComponents/CippInfoTooltip'
import { CippOffCanvas } from '../../../../../components/CippComponents/CippOffCanvas'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { useCippRoleAssignmentActions } from '../../../../../components/CippComponents/CippRoleAssignmentActions'
import {
  POLICY_BELOW_FLOOR_TOOLTIP,
  PRIVILEGED_ROLE_TOOLTIP,
  formatPimDuration,
  getRoleRow,
} from './roleShared'

const ASSIGNMENT_BUCKETS = [
  {
    key: 'Permanent',
    label: 'Permanent',
    description: 'Active with no end date',
    match: (row) => row?.AssignmentType === 'Permanent',
    countKey: 'PermanentCount',
    icon: CippIcons.LockPerson,
  },
  {
    key: 'Eligible',
    label: 'Eligible',
    description: 'Can activate through PIM',
    match: (row) => row?.AssignmentType === 'Eligible',
    countKey: 'EligibleCount',
    icon: CippIcons.HourglassBottom,
  },
  {
    key: 'Active',
    label: 'Active (time-bound)',
    description: 'Active with an end date',
    match: (row) =>
      row?.AssignmentType === 'Active' ||
      row?.AssignmentType === 'ActivatedFromEligible',
    countKey: 'ActiveCount',
    icon: CippIcons.MoreTime,
  },
]

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { checkPermissions } = usePermissions()
  const canWriteRole = checkPermissions(['Identity.Role.ReadWrite'])
  const { roleTemplateId } = router.query
  const tenantFilter =
    router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  const needsTenant = !tenantFilter || tenantFilter === 'AllTenants'
  const [assignmentDrawer, setAssignmentDrawer] = useState(null)

  const roleRequest = ApiGetCall({
    url: '/api/ListPIMRoles',
    data: {
      roleTemplateId,
      tenantFilter,
    },
    queryKey: `ListPIMRoles-${tenantFilter}-${roleTemplateId}`,
    waiting: !!roleTemplateId && !needsTenant,
  })

  const roleData = getRoleRow(roleRequest.data)
  const settings = roleData?.PolicySettings ?? {}
  const floorIssues = Array.isArray(roleData?.FloorIssues)
    ? roleData.FloorIssues
    : []
  const assignments = roleData?.Assignments ?? []

  const assignmentActions = useCippRoleAssignmentActions({
    relatedQueryKeys: [
      `ListPIMRoles-${tenantFilter}-${roleTemplateId}`,
      'ListPIMRoles*',
      'ListRoleAssignments*',
    ],
  })

  const viewSignInsAction = {
    label: 'View sign-ins',
    link: `/identity/administration/users/user?userId=[PrincipalId]&tenantFilter=${tenantFilter}`,
    icon: <CippIcons.Login />,
    color: 'info',
    condition: (row) => row?.PrincipalType === 'User' && !!row?.PrincipalId,
  }

  const drawerBucket = ASSIGNMENT_BUCKETS.find(
    (bucket) => bucket.key === assignmentDrawer
  )
  const drawerRows = useMemo(() => {
    if (!drawerBucket) return []
    return assignments.filter(drawerBucket.match)
  }, [assignments, drawerBucket])

  const title = !roleTemplateId
    ? 'No Role Selected'
    : needsTenant
      ? 'Select a Tenant'
      : roleRequest.isError
        ? 'Role'
        : roleRequest.isSuccess
          ? roleData?.RoleDisplayName ?? 'Role'
          : 'Loading...'

  const subtitle = roleRequest.isSuccess && roleData
    ? [
        {
          icon: <CippIcons.Fingerprint />,
          text: (
            <CippCopyToClipBoard type="chip" text={roleData.RoleDefinitionId} />
          ),
        },
        roleData.IsPrivilegedRole
          ? {
              icon: <CippIcons.Warning />,
              text: (
                <Tooltip title={PRIVILEGED_ROLE_TOOLTIP} arrow>
                  <Chip size="small" color="warning" label="Privileged" />
                </Tooltip>
              ),
            }
          : null,
        roleData.PolicyBelowFloor
          ? {
              icon: <CippIcons.GppBad />,
              text: (
                <Tooltip title={POLICY_BELOW_FLOOR_TOOLTIP} arrow>
                  <Chip size="small" color="error" label="Policy below floor" />
                </Tooltip>
              ),
            }
          : null,
      ].filter(Boolean)
    : []

  const roleActions = [
    {
      label: 'Create template from role settings',
      type: 'POST',
      icon: <CippIcons.PostAdd />,
      url: '/api/AddPIMRoleSettingsTemplate',
      data: {
        captureRoleId: 'RoleDefinitionId',
        captureRoleName: 'RoleDisplayName',
        tenantFilter: 'Tenant',
      },
      fields: [
        {
          type: 'textField',
          name: 'templateName',
          label: 'Template Name',
          required: true,
          validators: { required: 'A template name is required' },
        },
        {
          type: 'textField',
          name: 'description',
          label: 'Description (optional)',
        },
      ],
      confirmText:
        "Create a PIM role settings template from the current PIM settings of [RoleDisplayName]? Anything below CIPP's secure floor is raised to it, and every raised value is listed in the results.",
      relatedQueryKeys: ['ListPIMRoleSettingsTemplates*'],
      condition: (row) =>
        canWriteRole && !!row?.PIMCapable && !!row?.PolicySummary,
    },
  ]

  const activationRequiresLabel = (() => {
    switch (settings.activationRequires) {
      case 'MFA':
        return 'Multi-factor authentication'
      case 'AuthenticationContext':
        return settings.authenticationContextClaimValue
          ? `Authentication context (${settings.authenticationContextClaimValue})`
          : 'Authentication context'
      default:
        return 'None'
    }
  })()

  const activationItems = [
    {
      label: 'Maximum activation duration',
      value: formatPimDuration(settings.activationMaxDuration),
    },
    {
      label: 'Activation requires',
      value: activationRequiresLabel,
    },
    {
      label: 'Justification on activation',
      value: getCippFormatting(
        settings.activationRequiresJustification,
        'activationRequiresJustification'
      ),
    },
    {
      label: 'Ticket on activation',
      value: getCippFormatting(
        settings.activationRequiresTicket,
        'activationRequiresTicket'
      ),
    },
    {
      label: 'Approval on activation',
      value: getCippFormatting(
        settings.activationRequiresApproval,
        'activationRequiresApproval'
      ),
    },
    ...(settings.activationRequiresApproval && settings.approvers
      ? [{ label: 'Approvers', value: settings.approvers }]
      : []),
  ]

  const assignmentPolicyItems = [
    {
      label: 'Maximum eligible assignment',
      value: formatPimDuration(settings.eligibilityMaxDuration),
    },
    {
      label: 'Maximum active assignment',
      value: formatPimDuration(settings.activeAssignmentMaxDuration),
    },
    {
      label: 'Justification when creating active assignment',
      value: getCippFormatting(
        settings.activeAssignmentRequiresJustification,
        'activeAssignmentRequiresJustification'
      ),
    },
    {
      label: 'MFA when creating active assignment',
      value: getCippFormatting(
        settings.activeAssignmentRequiresMfa,
        'activeAssignmentRequiresMfa'
      ),
    },
    ...(settings.notificationRecipients
      ? [
          {
            label: 'Notification recipients',
            value: settings.notificationRecipients,
          },
        ]
      : []),
    {
      label: 'Meets secure floor',
      value: (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography variant="inherit">
            {roleData?.PolicyBelowFloor == null
              ? 'N/A'
              : getCippFormatting(
                  !roleData.PolicyBelowFloor,
                  'MeetsSecureFloor'
                )}
          </Typography>
          <CippInfoTooltip title={POLICY_BELOW_FLOOR_TOOLTIP} />
        </Stack>
      ),
    },
  ]

  // CippPropertyList double layout splits one array; keep Activation and Assignments
  // as two side-by-side cards so the grouping stays obvious.
  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      backUrl="/identity/administration/roles"
      titleControl={
        roleTemplateId && !needsTenant ? (
          <CippEntitySwitcher
            title={title}
            currentId={roleTemplateId}
            queryParamKey="roleTemplateId"
            entityName="role"
            api={{
              url: '/api/ListPIMRoles',
              data: { tenantFilter },
              queryKey: `ListPIMRoles-switcher-${tenantFilter}`,
            }}
            getOptions={(data) =>
              Array.isArray(data) ? data : (data?.Results ?? [])
            }
            getId={(row) => row.RoleDefinitionId}
            getPrimary={(row) => row.RoleDisplayName}
            getSecondary={(row) => row.RoleDefinitionId}
            sortByPrimary
          />
        ) : undefined
      }
      actions={roleActions}
      actionsData={roleData}
      queryKeys={[`ListPIMRoles-${tenantFilter}-${roleTemplateId}`]}
      subtitle={subtitle}
      isFetching={!!roleTemplateId && !needsTenant && roleRequest.isLoading}
    >
      <CippHead title={title ? `${title} - PIM` : 'Role PIM'} />
      {!roleTemplateId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No role selected. Open this page from the Roles &amp; PIM list.
        </Alert>
      )}
      {roleTemplateId && needsTenant && (
        <Alert severity="info" sx={{ m: 2 }}>
          Select a single tenant to view PIM settings. All Tenants is not
          supported on this page.
        </Alert>
      )}
      {roleTemplateId && !needsTenant && roleRequest.isLoading && (
        <CippFormSkeleton layout={[2, 1, 2, 2]} />
      )}
      {roleTemplateId && !needsTenant && roleRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load role details.
        </Alert>
      )}
      {roleTemplateId &&
        !needsTenant &&
        roleRequest.isSuccess &&
        !roleData && (
          <Alert severity="warning" sx={{ m: 2 }}>
            No role was found for this id in the selected tenant.
          </Alert>
        )}
      {roleRequest.isSuccess && roleData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Stack spacing={2}>
            {!roleData.PIMCapable && (
              <Alert severity="warning">
                This tenant is not PIM capable for this role (typically no Entra
                ID P2). Assignments are permanent directory role memberships;
                eligibility, activation limits and policy settings are not
                available.
              </Alert>
            )}
            {roleData.PIMCapable && roleData.PolicyBelowFloor && (
              <Alert severity="warning">
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography variant="subtitle2">
                      Policy below secure floor
                    </Typography>
                    <CippInfoTooltip title={POLICY_BELOW_FLOOR_TOOLTIP} />
                  </Stack>
                  {floorIssues.length > 0 ? (
                    <List dense disablePadding>
                      {floorIssues.map((issue) => (
                        <ListItem key={issue} disableGutters sx={{ py: 0 }}>
                          <ListItemText primary={issue} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">
                      The live PIM settings for this role fall below CIPP&apos;s
                      secure floor.
                    </Typography>
                  )}
                </Stack>
              </Alert>
            )}

            <Grid container spacing={2}>
              {ASSIGNMENT_BUCKETS.map((bucket) => {
                const BucketIcon = bucket.icon
                return (
                  <Grid key={bucket.key} size={{ xs: 12, md: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        transition: 'border-color 0.15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <CardActionArea
                        onClick={() => setAssignmentDrawer(bucket.key)}
                        sx={{ height: '100%' }}
                        aria-label={`View ${bucket.label.toLowerCase()} assignments`}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: 'flex-start' }}
                          >
                            <BucketIcon
                              color="action"
                              sx={{ fontSize: 28, mt: 0.5 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="overline"
                                color="text.secondary"
                              >
                                {bucket.label}
                              </Typography>
                              <Typography variant="h4">
                                {roleData[bucket.countKey] ?? 0}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {bucket.description}
                              </Typography>
                            </Box>
                            <SvgIcon
                              color="action"
                              fontSize="small"
                              sx={{ mt: 0.75 }}
                            >
                              <CippIcons.ChevronRightIcon />
                            </SvgIcon>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>

            {roleData.PIMCapable ? (
              <Card>
                <CardHeader
                  title="PIM policy"
                  subheader={roleData.PolicySummary || 'No PIM policy'}
                  action={
                    <Button
                      size="small"
                      href="/identity/administration/roles/templates"
                    >
                      PIM Templates
                    </Button>
                  }
                />
                <Divider />
                <Grid container>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ px: 1, pt: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ px: { xs: 2, md: 3 }, pt: 1 }}
                      >
                        Activation
                      </Typography>
                      <CippPropertyList
                        propertyItems={activationItems}
                        showDivider
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ px: 1, pt: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ px: { xs: 2, md: 3 }, pt: 1 }}
                      >
                        Assignments
                      </Typography>
                      <CippPropertyList
                        propertyItems={assignmentPolicyItems}
                        showDivider
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ) : null}
          </Stack>

          <CippOffCanvas
            title={`${drawerBucket?.label ?? 'Assignments'} — ${roleData.RoleDisplayName ?? 'Role'}`}
            visible={Boolean(assignmentDrawer)}
            onClose={() => setAssignmentDrawer(null)}
            size="xl"
          >
            <CippDataTable
              title={drawerBucket?.label ?? 'Assignments'}
              data={drawerRows}
              actions={[...assignmentActions, viewSignInsAction]}
              simpleColumns={[
                'PrincipalDisplayName',
                'PrincipalUserPrincipalName',
                'PrincipalType',
                'AssignmentType',
                'MemberType',
                'Scope',
                'EndDateTime',
              ]}
            />
          </CippOffCanvas>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
