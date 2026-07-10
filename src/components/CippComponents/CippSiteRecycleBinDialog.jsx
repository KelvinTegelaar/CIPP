import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { RestoreFromTrash } from '@mui/icons-material'
import { CippDataTable } from '../CippTable/CippDataTable'
import { usePermissions } from '../../hooks/use-permissions'

// Custom-component action dialog: lists a site's recycle bin (first + second stage) and
// restores selected items via ExecRestoreRecycleBinItems.
export const CippSiteRecycleBinDialog = ({
  row,
  tenantFilter,
  drawerVisible,
  setDrawerVisible,
}) => {
  const siteRow = Array.isArray(row) ? row[0] : row
  const siteUrl = siteRow?.webUrl
  const tenant = siteRow?.Tenant ?? tenantFilter
  const { checkPermissions } = usePermissions()
  const canRestore = checkPermissions(['Sharepoint.SiteRecycleBin.ReadWrite'])

  const actions = [
    {
      label: 'Restore Item',
      type: 'POST',
      icon: <RestoreFromTrash />,
      url: '/api/ExecRestoreRecycleBinItems',
      data: {
        Ids: 'Id',
        ItemNames: 'LeafName',
        // Literal values: these keys do not exist on the recycle bin rows, so the
        // action data mapper passes them through as-is.
        SiteUrl: siteUrl,
        tenantFilter: tenant,
      },
      confirmText: 'Restore [LeafName] from the recycle bin?',
      condition: () => canRestore,
      multiPost: false,
    },
  ]

  return (
    <Dialog fullWidth maxWidth="lg" open={!!drawerVisible} onClose={() => setDrawerVisible(false)}>
      <DialogTitle>
        Recycle Bin{siteRow?.displayName ? ` — ${siteRow.displayName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <CippDataTable
          noCard={true}
          title="Deleted Items"
          queryKey={`SiteRecycleBin-${siteUrl}`}
          api={{
            url: '/api/ListSiteRecycleBin',
            data: {
              SiteUrl: siteUrl,
              tenantFilter: tenant,
            },
            dataKey: 'Results',
          }}
          actions={actions}
          simpleColumns={[
            'LeafName',
            'DirName',
            'ItemType',
            'ItemState',
            'Size',
            'DeletedByName',
            'DeletedDate',
          ]}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setDrawerVisible(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
