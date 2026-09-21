import { useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { useSheetHandoff } from '../../hooks/use-sheet-handoff'
import {
  Divider,
  Fab,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuList,
  Stack,
} from '@mui/material'
import { CippBottomSheet } from './CippBottomSheet'
import {
  useActionCornerClaim,
  useTabNavigation,
} from '../../layouts/tab-navigation-context'

// The mobile page-actions pattern: one FAB in the bottom-right corner opening a bottom
// sheet of actions. CippSpeedDial cedes this corner below md, so the FAB is the only
// fixed control there. With restackButtons (default), children laid out for a desktop
// CardHeader are restacked vertically at full width; purpose-built sheet content (list
// rows) should pass restackButtons={false}.
//
// Actions only — a tabbed layout's destinations live in CippTabPicker, in the content
// flow. This FAB does claim the corner so a headered layout hands its page actions here
// rather than adding a second FAB of its own.
export const CippPageActionsFab = (props) => {
  const {
    title,
    // One glyph for every page-actions FAB. A "+" only ever told the truth on pages whose
    // sheet creates things — on a report page the single action is a sync. MoreVert is the
    // row kebab, so the FAB takes the horizontal variant.
    icon = <CippIcons.MoreHoriz />,
    ariaLabel = 'Page actions',
    restackButtons = true,
    sheetProps,
    // The tabbed layout's own fallback FAB must not claim the corner it is filling —
    // claiming would flip isActionCornerClaimed, unmount it, release, and loop.
    claimActionCorner = true,
    children,
  } = props

  const [open, setOpen] = useState(false)
  const sheet = useSheetHandoff(() => setOpen(false))
  const tabNav = useTabNavigation()
  // A tabbed layout may own page-level actions too (HeaderedTabbedLayout's ActionsMenu);
  // they belong in this sheet rather than in a cramped header menu.
  const layoutActions = (tabNav?.enabled && tabNav.actions) || []
  useActionCornerClaim(claimActionCorner)

  // With both kinds of content the sections label themselves, so a sheet title would only
  // repeat one of them; a single-purpose sheet takes the heading instead of a subheader.
  const sectioned = Boolean(children) && layoutActions.length > 0
  const resolvedTitle = title ?? (sectioned ? undefined : 'Actions')

  return (
    <>
      <Fab
        color="primary"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 'calc(env(safe-area-inset-bottom) + 20px)',
          zIndex: (theme) => theme.zIndex.speedDial,
        }}
      >
        {icon}
      </Fab>
      <CippBottomSheet
        open={open}
        onClose={sheet.cancel}
        onExited={sheet.handleExited}
        title={resolvedTitle}
        {...sheetProps}
        // A cardButton child owns its own drawer/dialog (CippAddUserDrawer renders both the
        // trigger and the CippOffCanvas). Unmounting the sheet would take that overlay with
        // it the instant it opened, so the children stay mounted.
        ModalProps={{ keepMounted: true, ...sheetProps?.ModalProps }}
      >
        <Stack
          spacing={restackButtons ? 1 : 0}
          sx={{
            p: restackButtons ? 2 : 0,
            ...(restackButtons && {
              '& > * ': { width: '100%' },
              // A cardButton is as often a Stack as a Box (autopilot's three import
              // buttons are a `direction="row"` Stack). Matching only Box left those in a
              // row while the rule below stretched each button to 100% — three full-width
              // buttons side by side, running off the sheet.
              '& .MuiBox-root, & .MuiStack-root': {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 1,
              },
              // Stack's `spacing` compiles to margin-left between children, which survives
              // the flip to a column and would indent every row after the first.
              '& .MuiStack-root > *': { marginLeft: 0, marginTop: 0 },
              '& .MuiButton-root': {
                width: '100%',
                justifyContent: 'flex-start',
                minHeight: 44,
              },
              // Text buttons default to the primary accent, which on the sheet's paper
              // reads as orange-on-grey and doesn't match the ListItemButton rows below
              // them. Contained and outlined buttons keep their colour — those are
              // deliberate calls to action, not list rows.
              '& .MuiButton-text': { color: 'text.primary' },
            }),
          }}
          onClick={(event) => {
            // A tap on any action has done its job — close the sheet so the drawer/dialog
            // it opened isn't stacked under it (the sheet sits at modal + 1, so it would be
            // ON TOP). menuitem covers MenuItem children; role=button covers ListItemButton,
            // which renders as a div.
            if (event.target?.closest?.("button, a, [role='menuitem'], [role='button']")) {
              setOpen(false)
            }
          }}
        >
          {/* Pages hand this sheet MenuItem children, which need a MenuList ancestor in
              MUI v9. display: contents keeps them laid out as direct Stack items. */}
          <MenuList disablePadding sx={{ display: 'contents' }}>
            {children}
          </MenuList>
        </Stack>
        {layoutActions.length > 0 && (
          <>
            {sectioned ? <Divider sx={{ my: 0.5 }} /> : null}
            <List
              sx={{ py: 0 }}
              subheader={
                sectioned ? (
                  <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>
                    Actions
                  </ListSubheader>
                ) : null
              }
            >
              {layoutActions.map((action, index) => (
                <ListItemButton
                  key={action.label ?? index}
                  disabled={action.disabled}
                  sx={{ minHeight: 48, color: action.color }}
                  onClick={() => sheet.run(action.onClick)}
                >
                  {action.icon && (
                    <ListItemIcon sx={{ minWidth: 40, color: action.color }}>
                      {action.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText primary={action.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </CippBottomSheet>
    </>
  )
}
