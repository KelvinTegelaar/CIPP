import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { Box, Skeleton, Typography } from '@mui/material'

// Drill-in panel: the list omits allowedUsersAndGroups / acquireUsersAndGroups / elementDetails,
// so fetch the per-package detail (delegated GET /packages/{id}) when a row is opened.
const PackageDetailPanel = ({ row }) => {
  const currentTenant = useSettings().currentTenant
  const detail = ApiGetCall({
    url: '/api/ListAgent365PackageDetail',
    data: { id: row?.id, tenantFilter: currentTenant },
    queryKey: `Agent365PackageDetail-${currentTenant}-${row?.id}`,
    waiting: !!row?.id,
  })

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Package detail (allowed / acquired users &amp; groups, elements)
      </Typography>
      {detail.isFetching && <Skeleton variant="rounded" height={220} />}
      {detail.isSuccess && <CippJsonView object={detail.data} defaultOpen={true} />}
    </Box>
  )
}

const Page = () => {
  const simpleColumns = [
    'displayName',
    'type',
    'publisher',
    'version',
    'supportedHosts',
    'elementTypes',
    'availableTo',
    'deployedTo',
    'isBlocked',
    'lastModifiedDateTime',
  ]

  const offCanvas = {
    extendedInfoFields: [
      'id',
      'displayName',
      'type',
      'publisher',
      'version',
      'platform',
      'supportedHosts',
      'elementTypes',
      'availableTo',
      'deployedTo',
      'isBlocked',
      'manifestId',
      'manifestVersion',
      'appId',
      'assetId',
      'shortDescription',
      'lastModifiedDateTime',
    ],
    children: (row) => <PackageDetailPanel row={row} />,
  }

  return (
    <CippTablePage
      title="Agent365 Packages"
      apiUrl="/api/ListAgent365Packages"
      simpleColumns={simpleColumns}
      offCanvas={offCanvas}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
