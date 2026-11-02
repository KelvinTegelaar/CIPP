import PropTypes from 'prop-types'
import { Button, Link, ListItemText, Menu, MenuItem, SvgIcon } from '@mui/material'
import { usePopover } from '../hooks/use-popover'
import { CippIcons, getIconByName } from '../utils/icon-registry'

export const BulkActionsMenu = (props) => {
  const { buttonName, sx, row, actions = [], ...other } = props
  const popover = usePopover()

  return (
    <>
      <Button
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        startIcon={
          <SvgIcon fontSize="small">
            <CippIcons.ChevronDownIcon />
          </SvgIcon>
        }
        variant="outlined"
        sx={{
          flexShrink: 0,
          whiteSpace: 'nowrap',
          ...sx,
        }}
        {...other}
      >
        {buttonName}
      </Button>
      <Menu
        anchorEl={popover.anchorRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        onClose={popover.handleClose}
        open={popover.open}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        slotProps={{
          list: {
            dense: true,
            sx: { p: 1 },
          }
        }}
      >
        {actions.map((action, index) => {
          const icon = getIconByName(action.icon, { sx: { mr: 1 } })

          if (action.link) {
            return (
              <MenuItem
                key={index}
                onClick={popover.handleClose}
                component={Link}
                href={action.link}
                target="_blank"
                rel="noreferrer"
              >
                {icon}
                <ListItemText primary={action.label} />
              </MenuItem>
            )
          } else {
            return (
              <MenuItem
                key={index}
                onClick={() => {
                  if (action.onClick) {
                    action.onClick()
                  }
                  popover.handleClose()
                }}
              >
                {icon}
                <ListItemText primary={action.label} />
              </MenuItem>
            )
          }
        })}
      </Menu>
    </>
  );
}

BulkActionsMenu.propTypes = {
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
  selectedCount: PropTypes.number,
}
