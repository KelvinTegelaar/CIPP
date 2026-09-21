import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { CippSharePointFolderView } from './CippSharePointFolderView'

/**
 * Flat recycle-bin picker: same FolderView list chrome as the site browser.
 * Used when restoring a folder so the user can choose which items under that path to restore.
 */
export const CippSharePointRecycleFolderRestoreDialog = ({
  open = false,
  onClose,
  folderLabel = 'Folder',
  items = [],
  onConfirm,
  isPending = false,
  error = null,
}) => {
  const [checkedIds, setCheckedIds] = useState([])

  const itemKey = useMemo(() => items.map((item) => item.id).join('|'), [items])

  useEffect(() => {
    if (!open) return
    setCheckedIds(items.map((item) => item.id).filter(Boolean))
  }, [open, itemKey])

  const selectedItems = useMemo(() => {
    if (!checkedIds.length) return []
    const idSet = new Set(checkedIds)
    return items.filter((item) => idSet.has(item.id))
  }, [items, checkedIds])

  const handleClose = () => {
    if (isPending) return
    onClose?.()
  }

  const handleConfirm = () => {
    if (!selectedItems.length || isPending) return
    onConfirm?.(selectedItems)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Restore from recycle bin</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 1.5
          }}>
          Select one or more deleted items under this folder to restore. Everything matching this
          path in the loaded recycle bin is listed (API cap applies).
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {typeof error === 'string' ? error : error?.message ?? 'Restore failed.'}
          </Alert>
        ) : null}
        <CippSharePointFolderView
          mode="recycle"
          recycleView="list"
          items={items}
          path={[{ id: 'restore-folder', displayName: folderLabel }]}
          showBreadcrumbs
          checkedIds={checkedIds}
          onCheckedChange={setCheckedIds}
          rowActions={[]}
          emptyMessage="No deleted items under this folder."
          infoMessage={
            items.length
              ? `${items.length} item${items.length === 1 ? '' : 's'} in this folder.`
              : null
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<CippIcons.RestoreFromTrash />}
          onClick={handleConfirm}
          disabled={isPending || selectedItems.length === 0}
        >
          Restore
          {selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CippSharePointRecycleFolderRestoreDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  folderLabel: PropTypes.string,
  items: PropTypes.array,
  onConfirm: PropTypes.func,
  isPending: PropTypes.bool,
  error: PropTypes.any,
}
