import { useEffect } from 'react'
import { Alert, Divider, Skeleton, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import CippFormComponent from './CippFormComponent'
import { CippFormCondition } from './CippFormCondition'
import { ApiGetCall } from '../../api/ApiCall'

// Option lists for the Edit Site dialog; values match Invoke-ExecSetSiteProperties' whitelist.
const SHARING_CAPABILITY_OPTIONS = [
  { label: 'Disabled — internal only', value: 'Disabled' },
  { label: 'Existing guests only', value: 'ExistingExternalUserSharingOnly' },
  { label: 'New and existing guests (sign-in required)', value: 'ExternalUserSharingOnly' },
  { label: 'Anyone — including anonymous links', value: 'ExternalUserAndGuestSharing' },
]
const LINK_TYPE_OPTIONS = [
  { label: 'Tenant default', value: 'None' },
  { label: 'Specific people (Direct)', value: 'Direct' },
  { label: 'Only people in your organization', value: 'Internal' },
  { label: 'Anyone with the link (Anonymous)', value: 'AnonymousAccess' },
]
const LINK_PERMISSION_OPTIONS = [
  { label: 'Tenant default', value: 'None' },
  { label: 'View', value: 'View' },
  { label: 'Edit', value: 'Edit' },
]
const DOMAIN_MODE_OPTIONS = [
  { label: 'No restriction', value: 'None' },
  { label: 'Allow only specific domains', value: 'AllowList' },
  { label: 'Block specific domains', value: 'BlockList' },
]
const LOCK_STATE_OPTIONS = [
  { label: 'Unlocked', value: 'Unlock' },
  { label: 'Read Only', value: 'ReadOnly' },
  { label: 'No Access (site blocked)', value: 'NoAccess' },
]

// Form body of the Edit Site action. Loads the site's current admin properties and
// prefills the form so submitting without changes is a no-op write of current values.
export const CippEditSitePropertiesForm = ({ formHook, row, tenantFilter }) => {
  const siteRow = Array.isArray(row) ? row[0] : row
  // Group-connected sites only accept sharing level, link defaults, lock state and storage
  // quota; SPO rejects Title, domain restrictions, anonymous-link override and version policy.
  const isGroupSite = siteRow?.rootWebTemplate === 'Group'
  const propsApi = ApiGetCall({
    url: '/api/ListSiteProperties',
    data: {
      tenantFilter: siteRow?.Tenant ?? tenantFilter,
      SiteUrl: siteRow?.webUrl,
    },
    queryKey: `SiteProperties-${siteRow?.webUrl}`,
  })

  useEffect(() => {
    const p = propsApi.data?.Results
    // autoComplete fields hold { label, value } objects; map raw values to their option.
    const toOption = (options, value) =>
      options.find((o) => o.value === value) ?? (value ? { label: value, value } : null)
    if (p && typeof p === 'object' && p.Url) {
      formHook.reset({
        Title: p.Title ?? '',
        SharingCapability: toOption(SHARING_CAPABILITY_OPTIONS, p.SharingCapability),
        DefaultSharingLinkType: toOption(LINK_TYPE_OPTIONS, p.DefaultSharingLinkType),
        DefaultLinkPermission: toOption(LINK_PERMISSION_OPTIONS, p.DefaultLinkPermission),
        SharingDomainRestrictionMode: toOption(
          DOMAIN_MODE_OPTIONS,
          p.SharingDomainRestrictionMode,
        ),
        SharingAllowedDomainList: p.SharingAllowedDomainList ?? '',
        SharingBlockedDomainList: p.SharingBlockedDomainList ?? '',
        OverrideTenantAnonymousLinkExpirationPolicy:
          !!p.OverrideTenantAnonymousLinkExpirationPolicy,
        AnonymousLinkExpirationInDays: p.AnonymousLinkExpirationInDays ?? 0,
        LockState: toOption(LOCK_STATE_OPTIONS, p.LockState),
        StorageMaximumLevel: p.StorageMaximumLevel,
        StorageWarningLevel: p.StorageWarningLevel,
        InheritVersionPolicyFromTenant: !!p.InheritVersionPolicyFromTenant,
        EnableAutoExpirationVersionTrim: !!p.EnableAutoExpirationVersionTrim,
        MajorVersionLimit: p.MajorVersionLimit ?? 0,
        ExpireVersionsAfterDays: p.ExpireVersionsAfterDays ?? 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsApi.isSuccess, propsApi.data])

  if (propsApi.isFetching) {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
        <Skeleton variant="rounded" height={40} />
      </Stack>
    )
  }
  if (propsApi.isError || typeof propsApi.data?.Results === 'string') {
    return (
      <Alert severity="error">
        Failed to load site properties.{' '}
        {typeof propsApi.data?.Results === 'string' ? propsApi.data.Results : ''}
      </Alert>
    )
  }

  return (
    <Stack spacing={1.5}>
      {isGroupSite && (
        <Alert severity="info">
          Group-connected (Team) site: only the sharing level, default link settings, lock state
          and storage limits can be managed here. Rename the site by renaming its M365 group.
        </Alert>
      )}
      {!isGroupSite && (
        <>
          <Typography variant="subtitle2">General</Typography>
          <CippFormComponent
            type="textField"
            name="Title"
            label="Site Name"
            formControl={formHook}
          />
          <Divider />
        </>
      )}
      <Typography variant="subtitle2">External Sharing</Typography>
      <CippFormComponent
        type="autoComplete"
        name="SharingCapability"
        label="Sharing Capability"
        multiple={false}
        creatable={false}
        options={SHARING_CAPABILITY_OPTIONS}
        formControl={formHook}
      />
      <CippFormComponent
        type="autoComplete"
        name="DefaultSharingLinkType"
        label="Default Sharing Link Type"
        multiple={false}
        creatable={false}
        options={LINK_TYPE_OPTIONS}
        formControl={formHook}
      />
      <CippFormComponent
        type="autoComplete"
        name="DefaultLinkPermission"
        label="Default Link Permission"
        multiple={false}
        creatable={false}
        options={LINK_PERMISSION_OPTIONS}
        formControl={formHook}
      />
      {!isGroupSite && (
        <CippFormComponent
          type="autoComplete"
          name="SharingDomainRestrictionMode"
          label="Domain Restriction"
          multiple={false}
          creatable={false}
          options={DOMAIN_MODE_OPTIONS}
          formControl={formHook}
        />
      )}
      <CippFormCondition
        field="SharingDomainRestrictionMode"
        compareType="valueEq"
        compareValue="AllowList"
        formControl={formHook}
      >
        <CippFormComponent
          type="textField"
          name="SharingAllowedDomainList"
          label="Allowed Domains (space separated)"
          formControl={formHook}
        />
      </CippFormCondition>
      <CippFormCondition
        field="SharingDomainRestrictionMode"
        compareType="valueEq"
        compareValue="BlockList"
        formControl={formHook}
      >
        <CippFormComponent
          type="textField"
          name="SharingBlockedDomainList"
          label="Blocked Domains (space separated)"
          formControl={formHook}
        />
      </CippFormCondition>
      {!isGroupSite && (
        <CippFormComponent
          type="switch"
          name="OverrideTenantAnonymousLinkExpirationPolicy"
          label="Override tenant anonymous link expiration"
          formControl={formHook}
        />
      )}
      <CippFormCondition
        field="OverrideTenantAnonymousLinkExpirationPolicy"
        compareType="is"
        compareValue={true}
        formControl={formHook}
      >
        <CippFormComponent
          type="number"
          name="AnonymousLinkExpirationInDays"
          label="Anonymous Link Expiration (days, 0 = never)"
          formControl={formHook}
        />
      </CippFormCondition>

      <Divider />
      <Typography variant="subtitle2">Lock State &amp; Storage</Typography>
      <CippFormComponent
        type="autoComplete"
        name="LockState"
        label="Lock State"
        multiple={false}
        creatable={false}
        options={LOCK_STATE_OPTIONS}
        formControl={formHook}
      />
      <Alert severity="info">
        Storage limits only apply when the tenant uses manual site storage limits. Lock state
        changes can take a few minutes to fully propagate.
      </Alert>
      <CippFormComponent
        type="number"
        name="StorageMaximumLevel"
        label="Storage Limit (MB)"
        formControl={formHook}
      />
      <CippFormComponent
        type="number"
        name="StorageWarningLevel"
        label="Storage Warning Level (MB)"
        formControl={formHook}
      />

      {!isGroupSite && (
        <>
          <Divider />
          <Typography variant="subtitle2">File Version Policy</Typography>
          <CippFormComponent
            type="switch"
            name="InheritVersionPolicyFromTenant"
            label="Inherit version policy from tenant"
            formControl={formHook}
          />
        </>
      )}
      <CippFormCondition
        field="InheritVersionPolicyFromTenant"
        compareType="is"
        compareValue={isGroupSite ? '__never__' : false}
        formControl={formHook}
      >
        <CippFormComponent
          type="switch"
          name="EnableAutoExpirationVersionTrim"
          label="Automatic version trimming"
          formControl={formHook}
        />
        <CippFormCondition
          field="EnableAutoExpirationVersionTrim"
          compareType="is"
          compareValue={false}
          formControl={formHook}
        >
          <CippFormComponent
            type="number"
            name="MajorVersionLimit"
            label="Major Version Limit"
            formControl={formHook}
          />
          <CippFormComponent
            type="number"
            name="ExpireVersionsAfterDays"
            label="Expire Versions After (days, 0 = never)"
            formControl={formHook}
          />
        </CippFormCondition>
      </CippFormCondition>
    </Stack>
  )
}

