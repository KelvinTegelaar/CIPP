import { useState } from "react";
import { useFieldArray, useWatch, Controller } from "react-hook-form";
import {
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import {
  Add,
  Delete,
  Folder,
  Language,
  Label,
  Lock,
  MoreHoriz,
  VpnKey,
  ViewColumn,
} from "@mui/icons-material";
import { CippSharePointPermissionEditor } from "./CippSharePointPermissionEditor";

const newLibrary = () => ({ name: "", description: "", permissions: [] });
const newSiteTemplate = () => ({
  displayName: "",
  alias: "",
  permissions: [],
  libraries: [],
});

const CARD_WIDTH = 320;

// One document library row inside a site card. Shows a lock when it carries unique permissions and
// a "..." menu mirroring the mock-up (Configure Permissions / Add Column / Manage Metadata).
const LibraryRow = ({ formControl, name, onRemove, onConfigurePermissions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const permissions = useWatch({ control: formControl.control, name: `${name}.permissions` });
  const permCount = Array.isArray(permissions) ? permissions.length : 0;
  const openMenu = Boolean(anchorEl);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Folder fontSize="small" sx={{ color: "text.secondary" }} />
      <Controller
        name={`${name}.name`}
        control={formControl.control}
        rules={{ required: true }}
        render={({ field }) => (
          <InputBase
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="Library name"
            sx={{ flexGrow: 1, fontSize: 14 }}
          />
        )}
      />
      {permCount > 0 && (
        <Tooltip title={`${permCount} unique permission${permCount > 1 ? "s" : ""}`}>
          <Lock fontSize="small" sx={{ color: "warning.main" }} />
        </Tooltip>
      )}
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreHoriz fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onConfigurePermissions();
          }}
        >
          <ListItemIcon>
            <VpnKey fontSize="small" />
          </ListItemIcon>
          <ListItemText>{permCount > 0 ? "Edit Permissions" : "Add Permissions"}</ListItemText>
        </MenuItem>
        <Tooltip title="Columns can be added later" placement="left">
          <span>
            <MenuItem disabled>
              <ListItemIcon>
                <ViewColumn fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Column</ListItemText>
            </MenuItem>
          </span>
        </Tooltip>
        <Tooltip title="Metadata can be added later" placement="left">
          <span>
            <MenuItem disabled>
              <ListItemIcon>
                <Label fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage Metadata</ListItemText>
            </MenuItem>
          </span>
        </Tooltip>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onRemove();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Remove Library</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// A single site template card: coloured header, its libraries, and its own "..." menu carrying the
// site-level permission entry point and the site-type switch.
const SiteTemplateCard = ({ formControl, name, index, onRemove, onConfigurePermissions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const permissions = useWatch({ control: formControl.control, name: `${name}.permissions` });
  const permCount = Array.isArray(permissions) ? permissions.length : 0;
  const openMenu = Boolean(anchorEl);

  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: `${name}.libraries`,
  });

  // Root-level permission objects are mandatory: flag the card in red until one is added.
  const missingRootPerms = permCount === 0;

  return (
    <Card
      sx={{
        width: CARD_WIDTH,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: missingRootPerms ? "2px solid" : "none",
        borderColor: missingRootPerms ? "error.main" : "transparent",
      }}
    >
      {/* Brand header — CyberDrain navy */}
      <Box
        sx={{
          bgcolor: "#003049",
          color: "#fff",
          px: 1.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Language fontSize="small" />
        <Controller
          name={`${name}.displayName`}
          control={formControl.control}
          rules={{ required: true }}
          render={({ field }) => (
            <InputBase
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={`Site Template ${index + 1}`}
              sx={{
                flexGrow: 1,
                color: "#fff",
                fontWeight: 600,
                "& input::placeholder": { color: "rgba(255,255,255,0.7)", opacity: 1 },
              }}
            />
          )}
        />
        {permCount > 0 ? (
          <Tooltip title={`${permCount} site-level permission${permCount > 1 ? "s" : ""}`}>
            <Lock fontSize="small" sx={{ color: "#fff" }} />
          </Tooltip>
        ) : (
          <Tooltip title="Root permissions required">
            <Lock fontSize="small" sx={{ color: "error.light" }} />
          </Tooltip>
        )}
        <IconButton size="small" sx={{ color: "#fff" }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreHoriz fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onConfigurePermissions();
            }}
          >
            <ListItemIcon>
              <VpnKey fontSize="small" />
            </ListItemIcon>
            <ListItemText>{permCount > 0 ? "Edit Permission Object" : "Add Permission Object"}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onRemove();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: "error.main" }} />
            </ListItemIcon>
            <ListItemText>Remove Site Template</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Mandatory root permissions: clickable error strip until at least one grant exists */}
      {missingRootPerms && (
        <Box
          role="button"
          onClick={() => onConfigurePermissions()}
          sx={{
            bgcolor: "error.main",
            color: "error.contrastText",
            px: 1.5,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <Lock sx={{ fontSize: 14 }} />
          <Typography variant="caption">Root permissions required — click to add</Typography>
        </Box>
      )}

      {/* Body: document libraries */}
      <Box sx={{ p: 1.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Document Libraries
        </Typography>
        <Stack spacing={0.25} sx={{ flexGrow: 1 }}>
          {fields.map((field, libIndex) => (
            <LibraryRow
              key={field.id}
              formControl={formControl}
              name={`${name}.libraries.${libIndex}`}
              onRemove={() => remove(libIndex)}
              onConfigurePermissions={() =>
                onConfigurePermissions(`${name}.libraries.${libIndex}.permissions`, "Library")
              }
            />
          ))}
          <Box
            role="button"
            onClick={() => append(newLibrary())}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.75,
              mt: 0.5,
              borderRadius: 1,
              cursor: "pointer",
              color: "primary.main",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Add fontSize="small" />
            <Typography variant="body2">Add Library</Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};

// The dashed placeholder card that appends a new site template.
const AddSiteCard = ({ onClick }) => (
  <Card
    role="button"
    onClick={onClick}
    variant="outlined"
    sx={{
      width: CARD_WIDTH,
      minHeight: 220,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      color: "text.secondary",
      borderStyle: "dashed",
      borderWidth: 2,
      cursor: "pointer",
      "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: "action.hover" },
    }}
  >
    <Add sx={{ fontSize: 40 }} />
    <Typography variant="subtitle1">Add New Site Template</Typography>
  </Card>
);

// Small stat tile used by the Quick Stats panel.
const Stat = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", py: 0.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

const QuickStats = ({ formControl }) => {
  const siteTemplates = useWatch({ control: formControl.control, name: "siteTemplates" }) || [];
  const libraryCount = siteTemplates.reduce(
    (total, site) => total + (Array.isArray(site?.libraries) ? site.libraries.length : 0),
    0
  );
  const permissionCount = siteTemplates.reduce((total, site) => {
    const sitePerms = Array.isArray(site?.permissions) ? site.permissions.length : 0;
    const libPerms = Array.isArray(site?.libraries)
      ? site.libraries.reduce(
          (sum, lib) => sum + (Array.isArray(lib?.permissions) ? lib.permissions.length : 0),
          0
        )
      : 0;
    return total + sitePerms + libPerms;
  }, 0);

  return (
    <Card sx={{ p: 2, width: 260, flexShrink: 0, alignSelf: "flex-start" }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Quick Stats
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stat label="Site Templates" value={siteTemplates.length} />
      <Stat label="Libraries Defined" value={libraryCount} />
      <Stat label="Permission Grants" value={permissionCount} />
    </Card>
  );
};

// Permission editor rendered in a dialog, targeting whichever field-array path was requested.
const PermissionDialog = ({ formControl, target, onClose }) => (
  <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{target?.title === "Library" ? "Library Permissions" : "Site Permissions"}</DialogTitle>
    <DialogContent dividers>
      {target && (
        <CippSharePointPermissionEditor
          formControl={formControl}
          name={target.name}
          emptyText={
            target.title === "Library"
              ? "No unique permissions — this library inherits the site's permissions."
              : "No site-level permissions — the site uses its default owner/member/visitor groups."
          }
        />
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Done</Button>
    </DialogActions>
  </Dialog>
);

// The card-canvas builder: a horizontal, wrapping row of site-template cards plus the dashed
// "add" card, with a Quick Stats panel. Only needs a react-hook-form control.
export const CippSharePointTemplateBuilder = ({ formControl }) => {
  const [permTarget, setPermTarget] = useState(null);
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: "siteTemplates",
  });

  const handleConfigurePermissions = (name, title) => setPermTarget({ name, title });

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Site Templates</Typography>
        <Typography variant="body2" color="text.secondary">
          Each site template provisions a SharePoint site and its document libraries.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexGrow: 1 }}>
          {fields.map((field, index) => (
            <SiteTemplateCard
              key={field.id}
              formControl={formControl}
              name={`siteTemplates.${index}`}
              index={index}
              onRemove={() => remove(index)}
              onConfigurePermissions={(target, title) =>
                target
                  ? handleConfigurePermissions(target, title)
                  : handleConfigurePermissions(`siteTemplates.${index}.permissions`, "Site")
              }
            />
          ))}
          <AddSiteCard onClick={() => append(newSiteTemplate())} />
        </Box>
        <QuickStats formControl={formControl} />
      </Box>

      <PermissionDialog
        formControl={formControl}
        target={permTarget}
        onClose={() => setPermTarget(null)}
      />
    </Box>
  );
};

// Loading placeholder that mirrors the builder's card canvas + stats panel, shown while an
// existing template is being fetched for edit/copy.
export const CippSharePointTemplateBuilderSkeleton = () => (
  <Box>
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" width={180} height={32} />
      <Skeleton variant="text" width={320} />
    </Box>
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flexGrow: 1 }}>
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} sx={{ width: CARD_WIDTH, overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={44} />
            <Box sx={{ p: 1.5 }}>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="rounded" height={28} sx={{ my: 0.75 }} />
              <Skeleton variant="rounded" height={28} sx={{ my: 0.75 }} />
              <Skeleton variant="rounded" height={28} sx={{ my: 0.75 }} />
            </Box>
          </Card>
        ))}
      </Box>
      <Card sx={{ p: 2, width: 260, flexShrink: 0, alignSelf: "flex-start" }}>
        <Skeleton variant="text" width={100} height={28} />
        <Divider sx={{ my: 1 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Card>
    </Box>
  </Box>
);

export default CippSharePointTemplateBuilder;
