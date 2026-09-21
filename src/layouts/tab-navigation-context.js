import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react'
import { useIsMobileLayout } from '../hooks/use-breakpoint'

/**
 * Lets a tabbed layout publish its tab list — and, on the headered variant, its page actions.
 *
 * Below md the scrollable tab row costs a band of vertical space and still hides tabs off the
 * right edge, so navigation collapses to a picker in the content flow (CippTabPicker). That
 * picker is always drawn by the layout, so there is nothing to negotiate over it.
 *
 * The FAB corner is different: it fits exactly one FAB, and about a quarter of tabbed pages
 * already grow one from a table's `cardButton`. A headered layout therefore hands its actions
 * to that FAB rather than adding a second one — hence the claim registry below.
 */
export const TabNavigationContext = createContext(null)

export const useTabNavigation = () => useContext(TabNavigationContext)

/**
 * Claims the bottom-right corner while `active`. A claimant takes responsibility for making
 * the layout's actions reachable — or for deliberately withholding them, as the card list does
 * while its select-mode bulk bar owns the bottom of the screen.
 */
export const useActionCornerClaim = (active) => {
  const context = useContext(TabNavigationContext)
  const claimId = useId()
  const claim = context?.claim
  const release = context?.release

  useEffect(() => {
    if (!active || !claim || !release) return undefined
    claim(claimId)
    return () => release(claimId)
  }, [active, claim, release, claimId])
}

/**
 * True when the mobile tab picker already names this page. The picker trigger wears the
 * current tab's label in heading clothes directly above the page header, so a page whose own
 * title is the same string would print it twice in a row. The page keeps its title on
 * desktop, where the tab bar looks like navigation rather than a heading.
 */
export const useTitleClaimedByTabPicker = (title) => {
  const context = useContext(TabNavigationContext)
  const isMobile = useIsMobileLayout()
  // Mirrors CippTabPicker's own render conditions: below two destinations it draws nothing,
  // so there is no trigger to claim the title.
  if (!isMobile || !context?.enabled || (context.tabs?.length ?? 0) < 2 || !title) return false
  const current = context.tabs.find((tab) => tab.path === context.currentPath)
  return current?.label?.trim().toLowerCase() === String(title).trim().toLowerCase()
}

/**
 * Builds the context value for a tabbed layout. `tabs` are the already-filtered options
 * ({label, path, icon}); `onNavigate` receives a path.
 */
export const useTabNavigationValue = ({
  tabs,
  currentPath,
  onNavigate,
  actions = [],
  enabled,
  // HeaderedTabbedLayout wraps its children in a Container; TabbedLayout does not. Content
  // that renders its own Container (CippFormPage) reads this so the two don't double up.
  providesGutters = false,
}) => {
  const [claims, setClaims] = useState([])

  // An aliased route (pages/index.js re-exports the dashboard, so it renders at "/") matches
  // no tab path — which left the picker labelled "Views" with nothing checked. The page an
  // alias re-exports is one of these tabs, and in practice the first: treat it as current.
  const resolvedPath = tabs?.some((tab) => tab.path === currentPath)
    ? currentPath
    : (tabs?.[0]?.path ?? currentPath)

  const claim = useCallback((id) => {
    setClaims((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const release = useCallback((id) => {
    setClaims((prev) => prev.filter((claimId) => claimId !== id))
  }, [])

  return useMemo(
    () => ({
      enabled,
      tabs,
      currentPath: resolvedPath,
      onNavigate,
      actions,
      providesGutters,
      claim,
      release,
      isActionCornerClaimed: claims.length > 0,
    }),
    [
      enabled,
      tabs,
      resolvedPath,
      onNavigate,
      actions,
      providesGutters,
      claim,
      release,
      claims.length,
    ]
  )
}
