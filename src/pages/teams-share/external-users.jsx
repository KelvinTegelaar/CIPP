import { useState } from 'react'
import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Layout as DashboardLayout } from '../../layouts/index'
import { CippIcons } from '../../utils/icon-registry'
import { usePermissions } from '../../hooks/use-permissions'
import { useSettings } from '../../hooks/use-settings'
import { useDialog } from '../../hooks/use-dialog'
import { CippTablePage } from '../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../components/CippComponents/CippApiDialog.jsx'

/*
 * Lists SharePoint Online's tenant external users store (live) and classifies every entry:
 * - Entra B2B: backed by a live Entra guest object
 * - Orphaned B2B: the Entra guest was deleted but SharePoint still knows the user
 * - SharePoint-only: legacy email-authenticated guest that never had an Entra object
 *
 * The details panel lists each site the guest is on (SiteAccess) with its site-level guest
 * expiration, and per-site Extend / Remove actions (ExecSPOGuestAccess). Those only touch the
 * chosen site: the Entra guest account and the guest's other sites are unaffected.
 */

const formatExpiry = (value) =>
  value ? new Date(value).toLocaleDateString() : 'No expiry'

// Short label for a site: the last path segment (e.g. CLIENT-GENERAL), or the host for the root site.
const siteName = (url) => {
  try {
    const { hostname, pathname } = new URL(url)
    const last = pathname.split('/').filter(Boolean).pop()
    return last ? decodeURIComponent(last) : hostname
  } catch {
    return url
  }
}

// Per-site access list shown in the row's details panel.
const GuestSiteAccess = ({ row, tenantFilter, canWriteSite, queryKey }) => {
  const extendDialog = useDialog()
  const removeDialog = useDialog()
  const [selected, setSelected] = useState(null)
  const sites = row?.SiteAccess ?? []

  if (sites.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No site memberships found for this guest.
      </Typography>
    )
  }

  // Each button sets the site it belongs to, so the dialog needs no site picker.
  const formatter = (accessAction) => (_row, _action, formData) => ({
    tenantFilter: row.Tenant ?? tenantFilter,
    SiteUrl: selected?.SiteUrl,
    SiteUserId: selected?.SiteUserId,
    DisplayName: row.DisplayName,
    Action: accessAction,
    ...(accessAction === 'Extend' && formData?.Days
      ? { Days: Number(formData.Days) }
      : {}),
  })

  const open = (site, dialog) => {
    setSelected(site)
    dialog.handleOpen()
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Site access
      </Typography>
      <Stack divider={<Divider flexItem />} spacing={1}>
        {sites.map((site) => (
          <Stack
            key={site.SiteUrl}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Tooltip title={site.SiteUrl}>
                <Link
                  href={site.SiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  noWrap
                  sx={{ display: 'block', fontWeight: 600 }}
                >
                  {siteName(site.SiteUrl)}
                </Link>
              </Tooltip>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: 'block' }}
              >
                {site.Expiration
                  ? `Expires ${formatExpiry(site.Expiration)}`
                  : 'No expiry set'}
              </Typography>
            </Box>
            {canWriteSite && (
              <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                <Tooltip title="Extend access on this site">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => open(site, extendDialog)}
                  >
                    <CippIcons.MoreTime fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from this site">
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => open(site, removeDialog)}
                  >
                    <CippIcons.PersonRemove fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        ))}
      </Stack>

      <CippApiDialog
        createDialog={extendDialog}
        title="Extend Site Access"
        row={row}
        relatedQueryKeys={[queryKey]}
        fields={[
          {
            type: 'number',
            name: 'Days',
            label: 'Extend by (days, max 90, default 90)',
          },
        ]}
        api={{
          url: '/api/ExecSPOGuestAccess',
          type: 'POST',
          customDataformatter: formatter('Extend'),
          confirmText: `Extend ${row.DisplayName}'s access to ${selected?.SiteUrl ?? 'this site'}? Access cannot be extended by more than 90 days from todays date.`,
        }}
      />
      <CippApiDialog
        createDialog={removeDialog}
        title="Remove From Site"
        row={row}
        relatedQueryKeys={[queryKey]}
        api={{
          url: '/api/ExecSPOGuestAccess',
          type: 'POST',
          customDataformatter: formatter('Expire'),
          confirmText: `Remove ${row.DisplayName}'s access to ${selected?.SiteUrl ?? 'this site'}? Their Entra guest account and access to other sites are not affected.`,
        }}
      />
    </>
  )
}

const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  // Explicit, tenant-scoped key so the per-site dialogs can refresh this table after a change.
  const queryKey = `SharePoint External Users - ${tenantFilter}`

  const actions = [
    {
      label: 'Remove Guest Access (All Sites + Entra)',
      type: 'POST',
      icon: <CippIcons.NoAccounts />,
      url: '/api/ExecRemoveSPOExternalUser',
      customDataformatter: (row) => {
        const formatRow = (r) => ({
          tenantFilter: r.Tenant ?? tenantFilter,
          EntraUserId: r.EntraUserId,
          LoginName: r.LoginName,
          SiteUrls: Array.isArray(r.Sites) ? r.Sites : [],
          DisplayName: r.DisplayName,
        })
        // When multiple rows are selected, row is an array. Returning an array
        // makes CippApiDialog send one request per row (bulk request mode).
        return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
      },
      confirmText:
        "Fully remove guest access for [DisplayName]? This deletes their Entra guest account (if one exists) AND removes them from every site listed in the Sites column, so nothing is left orphaned. To remove them from a single site only, open the guest's details and use Remove on that site instead. Sharing links they hold can be revoked from the Sharing Report; the inert SharePoint store entry ages out on its own.",
      color: 'error',
      condition: (row) =>
        canWriteSite && (row.InEntra || (row.Sites ?? []).length > 0),
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'DisplayName',
      'AcceptedAs',
      'LoginName',
      'GuestType',
      'InEntra',
      'Source',
      'NextExpiration',
      'WhenCreated',
      'InvitedBy',
    ],
    // CippDataTable passes (row, currentRowIndex); only the row is needed here.
    children: (row) => (
      <GuestSiteAccess
        row={row}
        tenantFilter={tenantFilter}
        canWriteSite={canWriteSite}
        queryKey={queryKey}
      />
    ),
  }

  const filters = [
    {
      filterName: 'SharePoint-only',
      value: [
        { id: 'GuestType', value: 'SharePoint-only (email authenticated)' },
      ],
      type: 'column',
    },
    {
      filterName: 'Orphaned B2B',
      value: [{ id: 'GuestType', value: 'Orphaned B2B (not in Entra)' }],
      type: 'column',
    },
    {
      filterName: 'Entra B2B',
      value: [{ id: 'GuestType', value: 'Entra B2B' }],
      type: 'column',
    },
  ]

  return (
    <CippTablePage
      title="SharePoint External Users"
      apiUrl="/api/ListSharePointExternalUsers"
      apiDataKey="Results"
      queryKey={queryKey}
      actions={actions}
      offCanvas={offCanvas}
      filters={filters}
      simpleColumns={[
        'DisplayName',
        'AcceptedAs',
        'GuestType',
        'InEntra',
        'Source',
        'Sites',
        'NextExpiration',
        'WhenCreated',
        'InvitedBy',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
