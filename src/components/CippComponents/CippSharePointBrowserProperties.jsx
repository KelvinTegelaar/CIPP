import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Card, CardHeader, Typography } from '@mui/material'
import { CippPropertyList } from './CippPropertyList'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { ApiPostCall } from '../../api/ApiCall'

const isSiteLike = (item) =>
  item && (item.type === 'site' || (item.canOpen && item.type !== 'recycleFolder'))

const formatBytes = (bytes) => {
  const num = Number(bytes)
  if (bytes === null || bytes === undefined || bytes === '' || Number.isNaN(num)) return null
  if (num < 1024) return `${num} B`
  const gb = num / (1024 * 1024 * 1024)
  if (gb >= 0.01) return `${gb.toLocaleString(undefined, { maximumFractionDigits: 2 })} GB`
  const mb = num / (1024 * 1024)
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
}

const formatVersionPolicy = (props) => {
  if (!props || typeof props !== 'object') return null
  if (props.InheritVersionPolicyFromTenant) {
    return 'Tenant default'
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
    const parts = ['Auto trim']
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

  return '—'
}

/**
 * Left-hand property panel for the selected SharePoint site or library.
 * List columns cover type / name / files / size — this pane keeps IDs, URL, and site version policy.
 */
export const CippSharePointBrowserProperties = ({
  item,
  tenantFilter,
  isFetching = false,
  emptyMessage = 'Select an item to view details.',
}) => {
  const siteUrl = isSiteLike(item) ? item.webUrl : null
  const siteId = isSiteLike(item) ? item.id : null
  const sitePropsApi = ApiPostCall({})

  useEffect(() => {
    if (!tenantFilter || (!siteUrl && !siteId)) return
    sitePropsApi.mutate({
      url: '/api/ExecSiteBrowserActions',
      data: {
        Action: 'GetSiteProperties',
        tenantFilter,
        SiteUrl: siteUrl,
        SiteId: siteId,
      },
    })
    // refetch when the selected site changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantFilter, siteUrl, siteId])

  const rawSiteProps = sitePropsApi.data?.data?.Results
  const normalizedSiteUrl = siteUrl ? siteUrl.replace(/\/+$/, '') : null
  const siteAdminProps =
    typeof rawSiteProps === 'object' &&
    rawSiteProps !== null &&
    !Array.isArray(rawSiteProps) &&
    (!normalizedSiteUrl ||
      !rawSiteProps.Url ||
      String(rawSiteProps.Url).replace(/\/+$/, '') === normalizedSiteUrl)
      ? rawSiteProps
      : null
  const versionsLabel = formatVersionPolicy(siteAdminProps)
  const versionsFetching = Boolean(
    (siteUrl || siteId) && (sitePropsApi.isPending || (!siteAdminProps && !sitePropsApi.isError))
  )

  const propertyItems = (() => {
    if (!item) return []

    if (item.type === 'recycleFolder') {
      return [
        { label: 'Type', value: 'Folder (recycle path)' },
        {
          label: 'Path',
          value: item.dirName ? <CippCopyToClipBoard text={item.dirName} type="chip" /> : '—',
        },
      ]
    }

    if (item.type === 'recycleItem') {
      return [
        { label: 'Type', value: item.siteType || '—' },
        { label: 'State', value: item.itemState || '—' },
        {
          label: 'Size',
          value: formatBytes(item.storageUsedInBytes) || '—',
        },
        { label: 'Deleted by', value: item.deletedByName || '—' },
        {
          label: 'Deleted',
          value: item.createdDateTime
            ? new Date(item.createdDateTime).toLocaleString()
            : '—',
        },
        {
          label: 'Path',
          value: item.dirName ? <CippCopyToClipBoard text={item.dirName} type="chip" /> : '—',
        },
        {
          label: 'Item ID',
          value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
        },
      ]
    }

    if (isSiteLike(item)) {
      return [
        {
          label: 'Description',
          value: item.description?.trim() ? item.description : '—',
        },
        {
          label: 'Versions',
          value: versionsFetching ? '' : versionsLabel || '—',
        },
        {
          label: 'Site ID',
          value: item.siteId ? <CippCopyToClipBoard text={item.siteId} type="chip" /> : '—',
        },
        {
          label: 'Graph ID',
          value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
        },
        {
          label: 'Web ID',
          value: item.webId ? <CippCopyToClipBoard text={item.webId} type="chip" /> : '—',
        },
        {
          label: 'URL',
          value: item.webUrl ? <CippCopyToClipBoard text={item.webUrl} type="chip" /> : '—',
        },
      ]
    }

    return [
      { label: 'Template', value: item.template || '—' },
      {
        label: 'List ID',
        value: item.id ? <CippCopyToClipBoard text={item.id} type="chip" /> : '—',
      },
      {
        label: 'Site ID',
        value: item.siteId ? <CippCopyToClipBoard text={item.siteId} type="chip" /> : '—',
      },
      {
        label: 'URL',
        value: item.webUrl ? <CippCopyToClipBoard text={item.webUrl} type="chip" /> : '—',
      },
    ]
  })()

  const subheader = (() => {
    if (!item) return 'Nothing selected'
    if (item.type === 'recycleFolder') return 'Recycle folder'
    if (item.type === 'recycleItem') return 'Deleted item'
    if (item.type === 'site' || (item.canOpen && item.type !== 'recycleFolder')) return 'Site'
    return 'Library'
  })()

  return (
    <Card sx={{ height: '100%', minHeight: 360 }}>
      <CardHeader
        title={item?.displayName ?? item?.name ?? 'Properties'}
        subheader={subheader}
        titleTypographyProps={{ variant: 'h6', noWrap: true }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      {!item && !isFetching ? (
        <Typography color="text.secondary" sx={{ px: 3, pb: 2 }}>
          {emptyMessage}
        </Typography>
      ) : (
        <CippPropertyList
          isFetching={
            (isFetching && !item) ||
            (versionsFetching && item?.type !== 'recycleItem' && item?.type !== 'recycleFolder')
          }
          propertyItems={
            propertyItems.length
              ? propertyItems
              : [
                  { label: 'Description', value: '' },
                  { label: 'Versions', value: '' },
                  { label: 'Site ID', value: '' },
                  { label: 'URL', value: '' },
                ]
          }
          copyItems={false}
        />
      )}
    </Card>
  )
}

CippSharePointBrowserProperties.propTypes = {
  item: PropTypes.object,
  tenantFilter: PropTypes.string,
  isFetching: PropTypes.bool,
  emptyMessage: PropTypes.string,
}
