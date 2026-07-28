import { Visibility, Edit, Security, Settings, Warning, Circle } from "@mui/icons-material";

// Single source of truth for how action menus are colour coded and ordered.
// Every menu renderer (table row menu, top toolbar bulk menu, actions-menu,
// bulk-actions-menu, CippActionMenu) reads from here so a "danger" action looks
// and sorts the same everywhere it appears.

const CATEGORIES = {
  view: { color: "success", order: 1, label: "View" },
  edit: { color: "info", order: 2, label: "Edit & Manage" },
  security: { color: "warning", order: 3, label: "Security" },
  manage: { color: "secondary", order: 4, label: "Settings" },
  danger: { color: "error", order: 99, label: "Danger Zone" },
};

// Uncategorised actions sit between the known categories and the danger zone.
const OTHER_ORDER = 50;
const OTHER_LABEL = "Other Actions";

const normalize = (category) => String(category ?? "").trim().toLowerCase();

export const getCategoryColor = (category) =>
  CATEGORIES[normalize(category)]?.color ?? "text.secondary";

export const getCategoryOrder = (category) =>
  CATEGORIES[normalize(category)]?.order ?? OTHER_ORDER;

export const getCategoryLabel = (category) => {
  const known = CATEGORIES[normalize(category)]?.label;
  if (known) return known;

  // Pages fall back to the literal "Other" bucket; anything else is a custom
  // category name, so make it presentable rather than replacing it.
  const raw = String(category ?? "").trim();
  if (!raw || normalize(raw) === "other") return OTHER_LABEL;
  return raw.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (m) => m.toUpperCase());
};

export const getCategoryIcon = (category) => {
  switch (normalize(category)) {
    case "view":
      return <Visibility sx={{ fontSize: 14 }} />;
    case "edit":
      return <Edit sx={{ fontSize: 14 }} />;
    case "security":
      return <Security sx={{ fontSize: 14 }} />;
    case "manage":
      return <Settings sx={{ fontSize: 14 }} />;
    case "danger":
      return <Warning sx={{ fontSize: 14 }} />;
    default:
      return <Circle sx={{ fontSize: 8 }} />;
  }
};

/**
 * Sort grouped `[category, actions]` entries into a consistent reading order,
 * so destructive actions always land at the bottom of the menu no matter what
 * order a page happened to declare them in.
 */
export const sortCategoryEntries = (entries) =>
  [...entries].sort(([a], [b]) => {
    const diff = getCategoryOrder(a) - getCategoryOrder(b);
    return diff !== 0 ? diff : getCategoryLabel(a).localeCompare(getCategoryLabel(b));
  });

/**
 * Resolve the colour for a single action: an explicit colour wins, otherwise it
 * inherits its category's colour rather than falling back to grey.
 */
export const getActionColor = (action, category) =>
  action?.color || getCategoryColor(category ?? action?.category);

const CHIP_COLORS = ["primary", "secondary", "error", "info", "success", "warning"];

/** MUI Chip only accepts palette names, so uncategorised falls back to "default". */
export const getCategoryChipColor = (category) => {
  const color = getCategoryColor(category);
  return CHIP_COLORS.includes(color) ? color : "default";
};

/**
 * Always resolves to a real MUI palette name, for props like <Button color> that
 * reject arbitrary values. Category wins, then an explicit colour, then primary.
 */
export const getActionPaletteColor = (action, category) => {
  const fromCategory = getCategoryChipColor(category ?? action?.category);
  if (fromCategory !== "default") return fromCategory;
  const explicit = normalize(action?.color);
  if (explicit === "danger") return "error";
  return CHIP_COLORS.includes(explicit) ? explicit : "primary";
};

/** Actions spell destructive intent as either category "danger" or colour "danger"/"error". */
export const isDangerAction = (action) =>
  normalize(action?.category) === "danger" ||
  normalize(action?.color) === "danger" ||
  normalize(action?.color) === "error";
