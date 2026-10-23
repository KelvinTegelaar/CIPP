import { Chip, Tooltip } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'

// Header status for an enterprise app: whether its service principal can sign in.
export const CippEnterpriseAppStatusChip = ({ accountEnabled }) => {
  if (typeof accountEnabled !== 'boolean') return null
  return (
    <Tooltip
      title={
        accountEnabled
          ? 'Users can sign in to this app and it can obtain tokens in this tenant.'
          : 'Sign-ins and token issuance for this app are blocked in this tenant. Its permissions stay in place.'
      }
    >
      <Chip
        size="small"
        icon={accountEnabled ? <CippIcons.CheckCircle /> : <CippIcons.Block />}
        label={accountEnabled ? 'Enabled' : 'Disabled'}
        color={accountEnabled ? 'success' : 'error'}
        variant={accountEnabled ? 'outlined' : 'filled'}
      />
    </Tooltip>
  )
}

export default CippEnterpriseAppStatusChip
