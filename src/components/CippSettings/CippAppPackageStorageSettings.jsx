import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import CippButtonCard from '../CippCards/CippButtonCard'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'
import { CippAppPackageStorageUsage } from '../CippComponents/CippAppPackageStorageUsage'

const CippAppPackageStorageSettings = () => {
  const settings = ApiGetCall({
    url: '/api/ListAppPackageStorage',
    queryKey: 'ListAppPackageStorage',
  })
  const change = ApiPostCall({ relatedQueryKeys: 'ListAppPackageStorage' })
  const [connectionString, setConnectionString] = useState('')
  const current = settings.data?.[0]
  const busy = change.isPending || settings.isLoading

  const post = (data) =>
    change.mutate(
      { url: '/api/ExecAppPackageStorageConfig', data },
      { onSuccess: () => setConnectionString('') }
    )

  return (
    <CippButtonCard
      title="App Package Storage"
      cardSx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      CardButton={
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <TextField
            size="small"
            type="password"
            label="Storage account connection string"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            disabled={busy}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={busy || !connectionString.trim()}
            onClick={() => post({ ConnectionString: connectionString })}
            sx={{ mt: 0.5 }}
          >
            Connect
          </Button>
          {current?.AccountName && (
            <Button
              variant="outlined"
              size="small"
              disabled={busy}
              onClick={() => post({ Remove: true })}
              sx={{ mt: 0.5 }}
            >
              Disconnect
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ mb: 1 }}>
        <CippAppPackageStorageUsage />
      </Box>
      <Typography variant="body2">
        To store as many as you need, connect your own Azure storage account:
        paste a connection string from Access keys on the storage account in the
        Azure portal. New uploads go to the storage selected here, and packages
        already uploaded keep working from where they are. A storage account
        can't be disconnected while application templates use packages stored in
        it.
      </Typography>
      <CippApiResults apiObject={change} />
    </CippButtonCard>
  )
}

export default CippAppPackageStorageSettings
