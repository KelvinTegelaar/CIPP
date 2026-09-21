import { useMediaQuery } from "@mui/material";
import { useSettings } from "./use-settings";

// Shared breakpoint hooks so the two mobile thresholds sit next to each other.

// Chrome pivots where the side nav gives way to the drawer (layouts/index.js). Everything that
// has to agree with the nav reads this: content gutter, top-nav hamburger, page toolbars.
export const useIsMobileLayout = () => useMediaQuery((theme) => theme.breakpoints.down("lg"));

// Tables pivot narrower: a table still reads fine at 1100, cards that wide are mostly whitespace.
export const useIsNarrowForTables = () => useMediaQuery((theme) => theme.breakpoints.down("md"));

export const useIsTabletLayout = () =>
  useMediaQuery((theme) => theme.breakpoints.between("sm", "md"));

// Settings values can be raw strings or {value,label} autocomplete objects depending on
// which control wrote them — accept both.
const unwrap = (setting) => (typeof setting === "object" && setting !== null ? setting.value : setting);

const VALID_MODES = ["auto", "cards", "table"];

/**
 * Resolves how a CippDataTable should present itself: 'cards' or 'table'.
 *
 * Precedence: per-call viewMode prop > settings.tableViewMode > 'auto'.
 * 'auto' means cards below the md breakpoint, table at or above it.
 * simple tables are always 'table' — they are 2-3 column embeds that already fit.
 *
 * The explicit modes exist for more than preference: jsdom has no width-based
 * matchMedia, so unit tests drive card mode through this path rather than by
 * stubbing media queries.
 */
export const useTableViewMode = ({ viewMode, simple = false } = {}) => {
  const settings = useSettings();
  const isNarrow = useIsNarrowForTables();

  if (simple) return "table";

  let mode = unwrap(viewMode) ?? unwrap(settings?.tableViewMode) ?? "auto";
  if (!VALID_MODES.includes(mode)) mode = "auto";

  if (mode === "auto") return isNarrow ? "cards" : "table";
  return mode;
};
