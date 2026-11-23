import { useMemo, useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch } from 'react-hook-form'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippIntuneSettingDetails } from '../../../../components/CippComponents/CippIntuneSettingDetails.jsx'
import { CippIcons } from '../../../../utils/icon-registry'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall'
import { getCippError } from '../../../../utils/get-cipp-error'

const MIN_SEARCH_LENGTH = 3

const Page = () => {
  const tenant = useSettings().currentTenant
  const [search, setSearch] = useState('')

  const formControl = useForm({
    mode: 'onChange',
    defaultValues: { searchTerm: '' },
  })
  const searchTerm = useWatch({
    control: formControl.control,
    name: 'searchTerm',
  })

  const canSearch = (searchTerm?.trim().length ?? 0) >= MIN_SEARCH_LENGTH

  const handleSearch = () => {
    if (canSearch) setSearch(searchTerm.trim())
  }

  const searchCall = ApiGetCall({
    url: '/api/ListIntuneSettingSearch',
    data: { tenantFilter: tenant, search },
    queryKey: `ListIntuneSettingSearch-${tenant}-${search}`,
    waiting: !!search && !!tenant,
  })
  const results = useMemo(
    () =>
      Array.isArray(searchCall.data?.Results) ? searchCall.data.Results : [],
    [searchCall.data]
  )
  const truncated = searchCall.data?.Metadata?.Truncated === true

  const searchCard = (
    <CippButtonCard title="Search Settings">
      <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CippFormComponent
            formControl={formControl}
            name="searchTerm"
            type="textField"
            label="Setting name or ID"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSearch()
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CippIcons.MagnifyingGlassIcon />}
            onClick={handleSearch}
            disabled={!canSearch}
          >
            Search
          </Button>
        </Grid>
        <Grid size={12}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Enter at least {MIN_SEARCH_LENGTH} characters.
          </Typography>
        </Grid>
      </Grid>
    </CippButtonCard>
  )

  const tableFilter = (
    <>
      {searchCard}
      {searchCall.isError && (
        <Alert severity="error">{getCippError(searchCall.error)}</Alert>
      )}
      {truncated && (
        <Alert severity="info">
          Showing the first {results.length} matching settings. Refine your
          search to see the rest.
        </Alert>
      )}
    </>
  )

  const offCanvas = {
    extendedInfoFields: [
      'SettingName',
      'SettingId',
      'Category',
      'PolicyTypes',
      'PolicyCount',
      'DeviceCount',
    ],
    children: (row) => <CippIntuneSettingDetails row={row} tenant={tenant} />,
    size: 'lg',
  }

  return (
    <CippTablePage
      title="Setting Search"
      tableFilter={tableFilter}
      data={results}
      isFetching={searchCall.isFetching}
      refreshFunction={search ? () => searchCall.refetch() : undefined}
      offCanvas={offCanvas}
      offCanvasOnRowClick={true}
      simpleColumns={[
        'SettingName',
        'Category',
        'PolicyTypes',
        'PolicyCount',
        'DeviceCount',
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
