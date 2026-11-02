import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@mui/material'
import { CippIcons, getIconByName } from '../../utils/icon-registry'
import { useTabNavigation } from '../../layouts/tab-navigation-context'

/**
 * The tab bar as sheet rows. Rendered inside whichever bottom sheet owns the mobile
 * bottom-right corner, so a page never shows two competing navigation affordances.
 */
export const CippTabNavigationSection = ({ title = 'Views', onNavigate }) => {
  const tabNav = useTabNavigation()

  if (!tabNav?.enabled || !tabNav.tabs?.length) return null

  return (
    <List
      sx={{ py: 0 }}
      // Skipped when the sheet's own title already names this section — otherwise a
      // views-only sheet reads "Views" twice.
      subheader={
        title ? (
          <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
            {title}
          </ListSubheader>
        ) : null
      }
    >
      {tabNav.tabs.map((tab) => {
        const selected = tab.path === tabNav.currentPath
        return (
          <ListItemButton
            key={tab.path}
            selected={selected}
            sx={{ minHeight: 48 }}
            onClick={() => {
              onNavigate?.()
              // Already here — the sheet closing is the whole interaction.
              if (!selected) tabNav.onNavigate?.(tab.path)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getIconByName(tab.icon, { fontSize: 'small' })}
            </ListItemIcon>
            <ListItemText primary={tab.label} />
            {selected && <CippIcons.Check fontSize="small" color="primary" />}
          </ListItemButton>
        )
      })}
    </List>
  )
}
