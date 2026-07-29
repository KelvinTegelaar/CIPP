import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  SvgIcon,
  TextField,
  InputAdornment,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Search,
  ExpandMore,
  ExpandLess,
  Visibility,
  Edit,
  Security,
  Settings,
  Delete,
  MoreHoriz,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { getSafeInternalRoute, openSafeExternalUrl } from "../../utils/safe-navigation";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "./CippApiDialog";
import { useSettings } from "../../hooks/use-settings";
import { resolvePaletteMainColor } from "../../theme/utils";
import {
  getActionColor,
  getActionPaletteColor,
  getCategoryChipColor,
  getCategoryColor,
  getCategoryLabel,
  getCategoryOrder,
} from "../../utils/action-categories";

// Larger icons for this menu style; headings, colours and ordering all come
// from the shared action-categories util so every menu agrees.
const categoryIcons = {
  view: <Visibility />,
  edit: <Edit />,
  security: <Security />,
  manage: <Settings />,
  danger: <Delete />,
  other: <MoreHoriz />,
};

// Helper to determine category from action
const getActionCategory = (action) => {
  if (action.category) return action.category;
  
  // Auto-detect category from label/type
  const label = (action.label || "").toLowerCase();
  
  if (label.includes("view") || label.includes("see") || action.link) {
    return "view";
  }
  if (label.includes("edit") || label.includes("rename") || label.includes("change") || label.includes("set") || label.includes("update")) {
    return "edit";
  }
  if (label.includes("delete") || label.includes("remove") || label.includes("wipe") || label.includes("reset") || action.color === "danger") {
    return "danger";
  }
  if (label.includes("security") || label.includes("password") || label.includes("key") || label.includes("defender") || label.includes("scan")) {
    return "security";
  }
  if (label.includes("sync") || label.includes("refresh") || label.includes("restart") || label.includes("reboot")) {
    return "manage";
  }
  
  return "other";
};

export const CippActionMenu = ({
  actions = [],
  data,
  variant = "list", // "list" | "compact" | "grid"
  showSearch = true,
  showCategories = true,
  maxVisibleActions = 0, // 0 = show all
  onActionClick,
  disabled = false,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const createDialog = useDialog();
  const settings = useSettings();

  // Filter and group actions
  const { groupedActions, filteredActions, visibleCount } = useMemo(() => {
    // Filter out disabled actions and apply search
    let filtered = actions.filter((action) => {
      // Check condition
      if (action.condition && !action.condition(data)) {
        return false;
      }
      // Apply search filter
      if (searchTerm) {
        return action.label?.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    // Group by category
    const grouped = {};
    filtered.forEach((action) => {
      const category = getActionCategory(action);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(action);
    });

    // Sort categories by order
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b))
      .forEach((key) => {
        sortedGrouped[key] = grouped[key];
      });

    return {
      groupedActions: sortedGrouped,
      filteredActions: filtered,
      visibleCount: filtered.length,
    };
  }, [actions, data, searchTerm]);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleActionClick = (action) => {
    if (disabled) return;

    // Handle tenant switching for AllTenants mode
    if (settings.currentTenant === "AllTenants" && data?.Tenant) {
      settings.handleUpdate({
        currentTenant: data.Tenant,
      });
    }

    // Handle custom function with no confirm
    if (action.noConfirm && action.customFunction) {
      action.customFunction(data, action, {});
      if (onActionClick) onActionClick(action);
      return;
    }

    // Handle link actions
    if (action.link) {
      let link = action.link.replace(/\[([^\]]+)\]/g, (_, key) =>
        encodeURIComponent(data?.[key] ?? "")
      );

      if (action.external || action.target === "_blank") {
        window.open(link, "_blank");
      } else {
        router.push(link);
      }
      if (onActionClick) onActionClick(action);
      return;
    }

    // Standard dialog flow
    setActionData({
      data: data,
      action: action,
      ready: true,
    });
    createDialog.handleOpen();
    if (onActionClick) onActionClick(action);
  };

  const renderAction = (action, index, inCategory = false) => {
    const isDisabled = disabled || (action.condition && !action.condition(data));
    const isDanger = getActionCategory(action) === "danger";

    return (
      <ListItem
        key={`action-${action.label}-${index}`}
        disablePadding
        sx={{
          borderRadius: 1,
          mb: 0.5,
          overflow: "hidden",
        }}
      >
        <ListItemButton
          onClick={() => handleActionClick(action)}
          disabled={isDisabled}
          sx={{
            py: smDown ? 1.5 : 1,
            px: 2,
            borderRadius: 1,
            minHeight: smDown ? 56 : 48,
            "&:hover": {
              bgcolor: isDanger
                ? alpha(theme.palette.error.main, 0.08)
                : "action.hover",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              // Inherit the category colour when the action doesn't set its own,
              // otherwise every uncoloured action renders grey under a coloured header
              color: (theme) =>
                resolvePaletteMainColor(
                  theme,
                  getActionColor(action, getActionCategory(action))
                ),
            }}
          >
            <SvgIcon fontSize={smDown ? "medium" : "small"}>{action.icon}</SvgIcon>
          </ListItemIcon>
          <ListItemText
            primary={action.label}
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: 500,
              color: isDanger ? "error.main" : "text.primary",
            }}
          />
          {action.link && (
            <Chip
              label="Link"
              size="small"
              variant="outlined"
              sx={{ ml: 1, height: 20, fontSize: "0.65rem" }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  const renderCategoryGroup = (category, categoryActions) => {
    const categoryIcon = categoryIcons[category] || categoryIcons.other;
    const isExpanded = expandedCategories[category] !== false; // Default expanded
    const isDanger = category === "danger";

    return (
      <Box key={`category-${category}`} sx={{ mb: 1 }}>
        <ListItemButton
          onClick={() => toggleCategory(category)}
          sx={{
            py: 0.75,
            px: 1.5,
            borderRadius: 1,
            bgcolor: isDanger
              ? alpha(theme.palette.error.main, 0.04)
              : alpha(theme.palette.primary.main, 0.04),
            "&:hover": {
              bgcolor: isDanger
                ? alpha(theme.palette.error.main, 0.08)
                : alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 32,
              color: (theme) => resolvePaletteMainColor(theme, getCategoryColor(category)),
            }}
          >
            <SvgIcon fontSize="small">{categoryIcon}</SvgIcon>
          </ListItemIcon>
          <ListItemText
            primary={getCategoryLabel(category)}
            primaryTypographyProps={{
              variant: "subtitle2",
              fontWeight: 600,
              color: isDanger ? "error.main" : "text.primary",
            }}
          />
          <Chip
            label={categoryActions.length}
            size="small"
            color={getCategoryChipColor(category)}
            sx={{ height: 20, fontSize: "0.7rem", mr: 1 }}
          />
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={isExpanded} timeout="auto">
          <List disablePadding sx={{ pl: 1, pt: 0.5 }}>
            {categoryActions.map((action, index) => renderAction(action, index, true))}
          </List>
        </Collapse>
      </Box>
    );
  };

  // Compact mode - just icons in a row
  if (variant === "compact") {
    const visibleActions = maxVisibleActions > 0
      ? filteredActions.slice(0, maxVisibleActions)
      : filteredActions;

    return (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {visibleActions.map((action, index) => {
          const isDisabled = disabled || (action.condition && !action.condition(data));
          const category = getActionCategory(action);
          const isDanger = category === "danger";

          return (
            <Tooltip key={`compact-action-${index}`} title={action.label}>
              <span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(action);
                  }}
                  disabled={isDisabled}
                  sx={{
                    color: isDanger
                      ? "error.main"
                      : action.color === "success"
                      ? "success.main"
                      : "text.secondary",
                    "&:hover": {
                      bgcolor: isDanger
                        ? alpha(theme.palette.error.main, 0.1)
                        : "action.hover",
                    },
                  }}
                >
                  <SvgIcon fontSize="small">{action.icon}</SvgIcon>
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
        {actionData.ready && (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Search bar for many actions */}
      {showSearch && filteredActions.length > 5 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Results count when searching */}
      {searchTerm && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          {visibleCount} action{visibleCount !== 1 ? "s" : ""} found
        </Typography>
      )}

      {/* Action list */}
      <List disablePadding>
        {showCategories && !searchTerm && Object.keys(groupedActions).length > 1 ? (
          // Grouped view
          Object.entries(groupedActions).map(([category, categoryActions]) =>
            renderCategoryGroup(category, categoryActions)
          )
        ) : (
          // Flat list (search results or single category)
          filteredActions.map((action, index) => renderAction(action, index))
        )}
      </List>

      {/* No results */}
      {filteredActions.length === 0 && (
        <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
          <Typography variant="body2">
            {searchTerm ? "No actions match your search" : "No actions available"}
          </Typography>
        </Box>
      )}

      {/* Action dialog */}
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
        />
      )}
    </Box>
  );
};

// Quick actions component for cards
export const CippQuickActions = ({
  actions = [],
  data,
  maxActions = 3,
  size = "small",
  showOnHover = false,
  onActionClick,
  onOffCanvasClick, // Callback to open offCanvas panel
  variant = "icon", // "icon" | "button"
}) => {
  const theme = useTheme();
  const router = useRouter();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });
  const createDialog = useDialog();
  const settings = useSettings();

  // Get quick actions - those marked as quickAction or first few actions
  const quickActions = useMemo(() => {
    const marked = actions.filter((a) => a.quickAction && (!a.condition || a.condition(data)));
    if (marked.length > 0) {
      return marked.slice(0, maxActions);
    }
    // Fallback: get first few non-danger actions
    return actions
      .filter((a) => getActionCategory(a) !== "danger" && (!a.condition || a.condition(data)))
      .slice(0, maxActions);
  }, [actions, data, maxActions]);

  const handleActionClick = (action, e) => {
    e.stopPropagation();

    // Handle tenant switching
    if (settings.currentTenant === "AllTenants" && data?.Tenant) {
      settings.handleUpdate({ currentTenant: data.Tenant });
    }

    // Handle offCanvas action - opens the details flyout panel
    if (action.offCanvasAction && onOffCanvasClick) {
      onOffCanvasClick(data);
      if (onActionClick) onActionClick(action);
      return;
    }

    if (action.noConfirm && action.customFunction) {
      action.customFunction(data, action, {});
      if (onActionClick) onActionClick(action);
      return;
    }

    if (action.link) {
      let link = action.link.replace(/\[([^\]]+)\]/g, (_, key) =>
        encodeURIComponent(data?.[key] ?? "")
      );
      if (action.external || action.target === "_blank") {
        openSafeExternalUrl(link);
      } else {
        const safeRoute = getSafeInternalRoute(link);
        if (safeRoute) {
          router.push(safeRoute);
        }
      }
      if (onActionClick) onActionClick(action);
      return;
    }

    setActionData({ data, action, ready: true });
    createDialog.handleOpen();
    if (onActionClick) onActionClick(action);
  };

  if (quickActions.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.75,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {quickActions.map((action, index) => {
        const category = getActionCategory(action);
        // Same category colours as the grouped menus, so a card's quick actions
        // and its overflow menu agree on what "edit" or "danger" looks like
        const buttonColor = getActionPaletteColor(action, category);
        const mainColor = theme.palette[buttonColor].main;

        if (variant === "button") {
          return (
            <Tooltip key={`quick-${index}`} title={action.label} arrow>
              <Button
                size={size}
                variant="outlined"
                color={buttonColor}
                startIcon={<SvgIcon fontSize="small">{action.icon}</SvgIcon>}
                onClick={(e) => handleActionClick(action, e)}
                sx={{
                  textTransform: "none",
                  borderRadius: 1,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  minHeight: smDown ? 32 : 28,
                }}
              >
                {action.label}
              </Button>
            </Tooltip>
          );
        }

        return (
          <Tooltip key={`quick-${index}`} title={action.label} arrow>
            <IconButton
              size={size}
              onClick={(e) => handleActionClick(action, e)}
              sx={{
                bgcolor: alpha(mainColor, 0.08),
                border: `1px solid ${alpha(mainColor, 0.3)}`,
                color: mainColor,
                borderRadius: 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha(mainColor, 0.15),
                  borderColor: mainColor,
                  transform: "scale(1.05)",
                },
                // Touch-friendly sizing
                minWidth: smDown ? 36 : 32,
                minHeight: smDown ? 36 : 32,
                p: 0.75,
              }}
            >
              <SvgIcon sx={{ fontSize: smDown ? 18 : 16 }}>
                {action.icon}
              </SvgIcon>
            </IconButton>
          </Tooltip>
        );
      })}

      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          fields={actionData.action?.fields}
          api={actionData.action}
          row={actionData.data}
        />
      )}
    </Box>
  );
};

export default CippActionMenu;
