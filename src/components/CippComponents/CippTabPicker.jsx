import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { KeyboardArrowDown } from '@mui/icons-material'
import { CippBottomSheet } from './CippBottomSheet'
import { CippTabNavigationSection } from './CippTabNavigationSection'
import { getIconByName } from '../../utils/icon-registry'
import { useTabNavigation } from '../../layouts/tab-navigation-context'

/**
 * The mobile replacement for a tabbed layout's tab bar: a collapsed trigger that opens the tab
 * list as a bottom sheet.
 *
 * Navigation deliberately lives in the content flow rather than in the page FAB — a FAB is for a
 * screen's primary action, and putting destinations there also made them unreachable whenever
 * something else owned the corner (a card list in select mode draws no FAB at all).
 *
 * Two presentations, one behaviour:
 *   block     the default, and what every page gets — a full-width row in the slot the desktop
 *             tab bar occupies. Same control in the same place on every tabbed page.
 *   compact   a chip beside a heading. Only HeaderedTabbedLayout, whose title row has an empty
 *             right half below md, so navigation there costs no vertical space at all.
 */
export const CippTabPicker = (props) => {
  const { variant = 'block', sx } = props

  const [open, setOpen] = useState(false)
  const tabNav = useTabNavigation()
  const tabs = tabNav?.tabs ?? []
  // One destination is not navigation. Two pages (View Group, View Device) have a single tab and
  // used to get a FAB whose sheet offered the page you were already on.
  if (!tabNav?.enabled || tabs.length < 2) return null

  const current = tabs.find((tab) => tab.path === tabNav.currentPath)
  const label = current?.label ?? 'Views'
  const isCompact = variant === 'compact'

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        sx={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          textAlign: 'left',
          gap: 0.75,
          borderRadius: 1,
          ...(isCompact
            ? {
                flexShrink: 0,
                // Long labels ("Policies and Settings Deployed" is 30 characters) must not push
                // the heading beside them off the row.
                maxWidth: '50%',
                height: 40,
                px: 1.25,
                bgcolor: 'action.hover',
              }
            : {
                // Full-width tap target, heading clothes: the chevron is the affordance.
                width: '100%',
                minHeight: 44,
                justifyContent: 'flex-start',
              }),
          ...sx,
        }}
      >
        {/* No leading icon in the compact chip: it shares a row with a heading that can be a
            tenant or user name, and the ~28px it costs comes straight out of that heading. */}
        {!isCompact &&
          getIconByName(current?.icon, {
            fontSize: 'small',
            sx: { flexShrink: 0, color: 'text.secondary' },
          })}
        <Typography
          variant={isCompact ? 'body2' : 'h6'}
          noWrap
          sx={{ minWidth: 0, flex: isCompact ? 1 : '0 1 auto', fontWeight: isCompact ? 500 : undefined }}
        >
          {label}
        </Typography>
        {/* Not an aria-label: overriding the name would leave the visible text out of it, and
            a voice-control user saying "Manage Drift" could no longer activate this. The
            hidden suffix extends the name instead of replacing it. */}
        <Box component="span" sx={visuallyHidden}>
          switch view
        </Box>
        {/* Compact rides the control's right edge; the heading form keeps the chevron
            beside the text, where a title's disclosure affordance belongs. */}
        <KeyboardArrowDown
          sx={{ flexShrink: 0, ml: isCompact ? 'auto' : 0, opacity: 0.7, fontSize: isCompact ? 18 : 20 }}
        />
      </ButtonBase>
      <CippBottomSheet open={open} onClose={() => setOpen(false)} title="Views">
        <CippTabNavigationSection title={null} onNavigate={() => setOpen(false)} />
      </CippBottomSheet>
    </>
  )
}
