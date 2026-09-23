import { Button, Chip, SvgIcon, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { CippIcons } from '../../utils/icon-registry'
import CippButtonCard from '../CippCards/CippButtonCard'
import { ApiGetCall } from '../../api/ApiCall'

const CippBecRemediationSettings = () => {
  const router = useRouter()
  const defaults = ApiGetCall({
    url: '/api/ExecBECRemediationDefaults?List=true',
    queryKey: 'BecRemediationDefaults',
  })
  const actions = Array.isArray(defaults.data?.Results)
    ? defaults.data.Results
    : []
  const onCount = actions.filter((a) => a.DefaultSelected).length

  return (
    <CippButtonCard
      title="BEC Remediation Defaults"
      cardSx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      CardButton={
        <Button
          variant="contained"
          size="small"
          startIcon={
            <SvgIcon fontSize="small">
              <CippIcons.Cog6ToothIcon />
            </SvgIcon>
          }
          onClick={() => router.push('/cipp/settings/bec-remediation')}
        >
          Configure
        </Button>
      }
    >
      <Typography variant="body2">
        Choose which containment actions are selected by default when
        remediating a compromised user.
      </Typography>
      <Chip
        label={
          defaults.isLoading
            ? 'Loading...'
            : defaults.isError
              ? 'Failed to load'
              : `${onCount} of ${actions.length} actions on by default`
        }
        size="small"
        color={defaults.isError ? 'error' : 'primary'}
        variant="outlined"
        sx={{ mt: 1, fontWeight: 600 }}
      />
    </CippButtonCard>
  )
}

export default CippBecRemediationSettings
