import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'

/**
 * Filter SharePoint browser row actions by optional per-item condition.
 */
export function filterSharePointBrowserRowActions(actions, item) {
  return (actions ?? []).filter((action) => {
    if (typeof action.condition === 'function') return action.condition(item)
    return true
  })
}

const ActionMenuItems = ({ actions, item, onPick }) =>
  actions.map((action) => (
    <MenuItem
      key={action.label}
      onClick={() => {
        onPick?.()
        if (!action.href) {
          action.onClick?.(item)
        }
      }}
      component={action.href ? 'a' : 'li'}
      href={action.href ? action.href(item) : undefined}
      target={action.href ? '_blank' : undefined}
      rel={action.href ? 'noopener noreferrer' : undefined}
    >
      {action.icon ? <ListItemIcon sx={{ minWidth: 36 }}>{action.icon}</ListItemIcon> : null}
      <ListItemText>{action.label}</ListItemText>
    </MenuItem>
  ))

ActionMenuItems.propTypes = {
  actions: PropTypes.array.isRequired,
  item: PropTypes.object.isRequired,
  onPick: PropTypes.func,
}

/**
 * Row ⋮ menu for the SharePoint site browser FolderView.
 */
export const CippSharePointBrowserRowActions = ({ item, actions = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const available = filterSharePointBrowserRowActions(actions, item)

  if (!available.length) return null

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for ${item.displayName ?? item.name ?? 'item'}`}
        data-no-row-click="true"
        onClick={(event) => {
          event.stopPropagation()
          setAnchorEl(event.currentTarget)
        }}
      >
        <CippIcons.MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <ActionMenuItems
          actions={available}
          item={item}
          onPick={() => setAnchorEl(null)}
        />
      </Menu>
    </>
  )
}

CippSharePointBrowserRowActions.propTypes = {
  item: PropTypes.object.isRequired,
  actions: PropTypes.array,
}

/**
 * Cursor-positioned context menu — same action list as the row ⋮ menu.
 * Mirrors CippDataTable right-click behavior for the SharePoint explorer.
 */
export const CippSharePointBrowserContextMenu = ({
  open = false,
  position = null,
  item = null,
  actions = [],
  onClose,
}) => {
  const available = item ? filterSharePointBrowserRowActions(actions, item) : []
  const menuOpen = Boolean(open && position && item && available.length > 0)

  return (
    <Menu
      open={menuOpen}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        position ? { top: position.mouseY, left: position.mouseX } : undefined
      }
      slotProps={{
        paper: { sx: { minWidth: 200 } },
      }}
    >
      {item && available.length ? (
        <ActionMenuItems actions={available} item={item} onPick={onClose} />
      ) : null}
    </Menu>
  )
}

CippSharePointBrowserContextMenu.propTypes = {
  open: PropTypes.bool,
  position: PropTypes.shape({
    mouseX: PropTypes.number,
    mouseY: PropTypes.number,
  }),
  item: PropTypes.object,
  actions: PropTypes.array,
  onClose: PropTypes.func,
}
