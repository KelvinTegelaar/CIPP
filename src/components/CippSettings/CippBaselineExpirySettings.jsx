import { useEffect, useState } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'

const CippBaselineExpirySettings = () => {
  const policy = ApiGetCall({
    url: '/api/ListBaselineExpiryPolicy',
    queryKey: 'BaselineExpiryPolicy',
  })
  const save = ApiPostCall({ relatedQueryKeys: 'BaselineExpiryPolicy' })
  const [days, setDays] = useState({ defaultDays: '0', maxDays: '0' })

  useEffect(() => {
    if (policy.data) {
      setDays({
        defaultDays: String(policy.data.defaultDays ?? 0),
        maxDays: String(policy.data.maxDays ?? 0),
      })
    }
  }, [policy.data])

  const busy = save.isPending || policy.isLoading
  const dayField = (name, label) => (
    <TextField
      size="small"
      type="number"
      label={label}
      value={days[name]}
      onChange={(event) => setDays({ ...days, [name]: event.target.value })}
      disabled={busy}
      sx={{ width: 140 }}
      slotProps={{ htmlInput: { min: 0, max: 3650 } }}
    />
  )

  return (
    <CippButtonCard
      title="Baseline Deviation & Override Expiry"
      cardSx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      CardButton={
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {dayField('defaultDays', 'Default days')}
          {dayField('maxDays', 'Maximum days')}
          <Button
            variant="contained"
            size="small"
            disabled={busy}
            sx={{ mt: 0.5 }}
            onClick={() =>
              save.mutate({
                url: '/api/ExecBaselineExpiryPolicy',
                data: {
                  defaultDays: Number(days.defaultDays),
                  maxDays: Number(days.maxDays),
                },
              })
            }
          >
            Save
          </Button>
        </Box>
      }
    >
      <Typography variant="body2">
        Accepting a baseline deviation or creating a tenant override pre-fills
        its expiry this many days ahead. With a maximum set, every acceptance
        and override must expire within that many days, and one saved without an
        expiry gets the default. Use 0 for no default or no maximum.
      </Typography>
      <CippApiResults apiObject={save} />
    </CippButtonCard>
  )
}

export default CippBaselineExpirySettings
