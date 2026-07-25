import { useState, useEffect } from "react";
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
  Category,
  Delete,
  Folder,
  Label,
  Lock,
  MoreVert,
  Translate,
  VpnKey,
  ViewColumn,
  Web,
} from "@mui/icons-material";
import CippFormComponent from "./CippFormComponent";
import { CippSharePointPermissionEditor } from "./CippSharePointPermissionEditor";
import SharePointIcon from "../../icons/iconly/bulk/sharepoint";
import TeamsIcon from "../../icons/iconly/bulk/teams";

export const SITE_TYPE_OPTIONS = [
  { label: "SharePoint site", value: "sharePoint" },
  { label: "Microsoft Teams", value: "teams" },
];

// Current provisioning engine version stamped on save. Schemas live in
// frontend/src/data/sharePointTemplateSchemas.json (array keyed by templateEngineVersion).
export const SHAREPOINT_TEMPLATE_ENGINE_VERSION = 1;

// Team site vs Communication when deploying as SharePoint (not a Microsoft Team).
// Values match New-CIPPSharepointSite -TemplateName.
export const CREATE_AS_DEFAULT = "Team";
export const CREATE_AS_OPTIONS = [
  { label: "Team site", value: "Team" },
  { label: "Communication site", value: "Communication" },
];

// SharePoint Online site-creation language LCIDs (UI language picker), plus tenant default.
// Regional variants such as en-GB are not supported by SPO site creation.
// Keep numeric values in sync with $AllowedSiteLcids in New-CIPPSharepointSite.ps1.
export const SITE_LANGUAGE_DEFAULT = "default";
export const SITE_LANGUAGE_OPTIONS = [
  { label: "Tenant default", value: SITE_LANGUAGE_DEFAULT },
  { label: "Arabic", value: "1025" },
  { label: "Basque", value: "1069" },
  { label: "Bulgarian", value: "1026" },
  { label: "Catalan", value: "1027" },
  { label: "Chinese (Simplified)", value: "2052" },
  { label: "Chinese (Traditional)", value: "1028" },
  { label: "Croatian", value: "1050" },
  { label: "Czech", value: "1029" },
  { label: "Danish", value: "1030" },
  { label: "Dutch", value: "1043" },
  { label: "English", value: "1033" },
  { label: "Estonian", value: "1061" },
  { label: "Finnish", value: "1035" },
  { label: "French", value: "1036" },
  { label: "Galician", value: "1110" },
  { label: "German", value: "1031" },
  { label: "Greek", value: "1032" },
  { label: "Hebrew", value: "1037" },
  { label: "Hindi", value: "1081" },
  { label: "Hungarian", value: "1038" },
  { label: "Indonesian", value: "1057" },
  { label: "Italian", value: "1040" },
  { label: "Japanese", value: "1041" },
  { label: "Kazakh", value: "1087" },
  { label: "Korean", value: "1042" },
  { label: "Latvian", value: "1062" },
  { label: "Lithuanian", value: "1063" },
  { label: "Malay", value: "1086" },
  { label: "Norwegian (Bokmål)", value: "1044" },
  { label: "Polish", value: "1045" },
  { label: "Portuguese (Brazil)", value: "1046" },
  { label: "Portuguese (Portugal)", value: "2070" },
  { label: "Romanian", value: "1048" },
  { label: "Russian", value: "1049" },
  { label: "Serbian (Latin)", value: "2074" },
  { label: "Slovak", value: "1051" },
  { label: "Slovenian", value: "1060" },
  { label: "Spanish", value: "3082" },
  { label: "Swedish", value: "1053" },
  { label: "Thai", value: "1054" },
  { label: "Turkish", value: "1055" },
  { label: "Ukrainian", value: "1058" },
  { label: "Vietnamese", value: "1066" },
  { label: "Welsh", value: "1106" },
];

const siteTypeIcon = (siteType) => (siteType === "teams" ? TeamsIcon : SharePointIcon);

// Faint grayscale watermark only; header product marks stay in color.
const watermarkTypeIconSx = { filter: "grayscale(1)" };

const resolveSiteType = (value) => (value === "teams" ? "teams" : "sharePoint");

const resolveSiteLanguage = (value) => {
  const raw = value?.value ?? value;
  if (raw === undefined || raw === null || raw === "" || raw === SITE_LANGUAGE_DEFAULT) {
    return SITE_LANGUAGE_DEFAULT;
  }
  return String(raw);
};

/** Option object for the language autocomplete (so the dialog shows "Tenant default", not "default"). */
export const getSiteLanguageOption = (value) => {
  const resolved = resolveSiteLanguage(value);
  return (
    SITE_LANGUAGE_OPTIONS.find((option) => option.value === resolved) ?? SITE_LANGUAGE_OPTIONS[0]
  );
};

export { resolveSiteLanguage };

const resolveCreateAs = (value) => {
  const raw = value?.value ?? value;
  return raw === "Communication" ? "Communication" : CREATE_AS_DEFAULT;
};

export { resolveCreateAs };

const newLibrary = () => ({ name: "", description: "", permissions: [] });
const newSiteTemplate = (siteType = "sharePoint") => ({
  displayName: "",
  alias: "",
  siteType: resolveSiteType(siteType),
  language: getSiteLanguageOption(SITE_LANGUAGE_DEFAULT),
  createAs: CREATE_AS_DEFAULT,
  permissions: [],
  libraries: [],
});

/** True when a site card has issues that keep Save disabled (name, root perms, library names). */
export const siteTemplateBlocksSave = (site) => {
  if (!site?.displayName?.trim()) return true;
  if (!Array.isArray(site?.permissions) || site.permissions.length === 0) return true;
  if ((site?.libraries || []).some((lib) => !lib?.name?.trim())) return true;
  return false;
};

/** Human-readable save blockers for site templates (for the Save footer info tooltip). */
export const getSiteTemplateSaveIssues = (sites = []) => {
  const issues = [];
  sites.forEach((site, index) => {
    const label = site?.displayName?.trim() || `Site Template ${index + 1}`;
    if (!site?.displayName?.trim()) {
      issues.push(`${label}: needs a name`);
    }
    if (!Array.isArray(site?.permissions) || site.permissions.length === 0) {
      issues.push(`${label}: root permissions required`);
    }
    if ((site?.libraries || []).some((lib) => !lib?.name?.trim())) {
      issues.push(`${label}: every library needs a name`);
    }
  });
  return issues;
};

const CARD_WIDTH = 320;

// One document library row inside a site card. Shows a lock when it carries unique permissions and
// a "..." menu mirroring the mock-up (Configure Permissions / Add Column / Manage Metadata).
const LibraryRow = ({ formControl, name, onRemove, onConfigurePermissions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const permissions = useWatch({ control: formControl.control, name: `${name}.permissions` });
  const libraryName = useWatch({ control: formControl.control, name: `${name}.name` });
  const permCount = Array.isArray(permissions) ? permissions.length : 0;
  const openMenu = Boolean(anchorEl);
  const missingName = !libraryName?.trim();

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
      <Tooltip title={missingName ? "Library name required" : "Document library"}>
        <Folder fontSize="small" sx={{ color: missingName ? "error.main" : "text.secondary" }} />
      </Tooltip>
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
      <Tooltip title="Library actions">
        <IconButton
          size="small"
          aria-label="Library actions"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Tooltip>
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

// Site type editor shown from the site card "..." menu.
const SiteTypeDialog = ({ formControl, name, overrideActive, onClose }) => (
  <Dialog open={Boolean(name)} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Site type</DialogTitle>
    <DialogContent dividers>
      {name && (
        <Stack spacing={1}>
          <CippFormComponent
            type="select"
            label="Site type"
            name={`${name}.siteType`}
            formControl={formControl}
            options={SITE_TYPE_OPTIONS}
            disabled={overrideActive}
          />
          {overrideActive ? (
            <Typography variant="body2" color="text.secondary">
              Template override is active — all sites use the template site type at deploy.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Choose whether this entry provisions a SharePoint site or a Microsoft Team.
            </Typography>
          )}
        </Stack>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Done</Button>
    </DialogActions>
  </Dialog>
);

// Site language editor shown from the site card "..." menu.
const SiteLanguageDialog = ({ formControl, name, onClose }) => {
  // Ensure the field always has a real option object when the dialog opens so the
  // autocomplete shows "Tenant default" (or the saved language) instead of blank/raw values.
  useEffect(() => {
    if (!name) return;
    const fieldName = `${name}.language`;
    formControl.setValue(fieldName, getSiteLanguageOption(formControl.getValues(fieldName)), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [name, formControl]);

  return (
    <Dialog open={Boolean(name)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Site language</DialogTitle>
      <DialogContent dividers>
        {name && (
          <Stack spacing={1}>
            <CippFormComponent
              type="autoComplete"
              label="Site language"
              name={`${name}.language`}
              formControl={formControl}
              options={SITE_LANGUAGE_OPTIONS}
              multiple={false}
              creatable={false}
              disableClearable={true}
            />
            <Typography variant="body2" color="text.secondary">
              Tenant default follows each target tenant&apos;s SharePoint root site language
              (the SPO default for new sites) at deploy. A specific language is applied when
              the SharePoint site is created.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

// Team site vs Communication site — SharePoint path only; ignored for Teams.
const CreateAsDialog = ({ formControl, name, onClose }) => {
  useEffect(() => {
    if (!name) return;
    const fieldName = `${name}.createAs`;
    formControl.setValue(fieldName, resolveCreateAs(formControl.getValues(fieldName)), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [name, formControl]);

  return (
    <Dialog open={Boolean(name)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create as</DialogTitle>
      <DialogContent dividers>
        {name && (
          <Stack spacing={1}>
            <CippFormComponent
              type="select"
              label="Create as"
              name={`${name}.createAs`}
              formControl={formControl}
              options={CREATE_AS_OPTIONS}
            />
            <Typography variant="body2" color="text.secondary">
              Team site is a collaboration workspace. Communication site is for publishing
              (intranet, news). Only applies when this card deploys as a SharePoint site.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

// A single site template card: coloured header, libraries, and "..." menu for permissions,
// site type, and remove. Header icon + watermark reflect the effective site type.
const SiteTemplateCard = ({ formControl, name, index, onRemove, onConfigurePermissions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [siteTypeOpen, setSiteTypeOpen] = useState(false);
  const [siteLanguageOpen, setSiteLanguageOpen] = useState(false);
  const [createAsOpen, setCreateAsOpen] = useState(false);
  const permissions = useWatch({ control: formControl.control, name: `${name}.permissions` });
  const displayName = useWatch({ control: formControl.control, name: `${name}.displayName` });
  const libraries = useWatch({ control: formControl.control, name: `${name}.libraries` });
  const cardSiteType = useWatch({ control: formControl.control, name: `${name}.siteType` });
  const createAs = useWatch({ control: formControl.control, name: `${name}.createAs` });
  const overrideSiteType = useWatch({ control: formControl.control, name: "overrideSiteType" });
  const templateSiteType = useWatch({ control: formControl.control, name: "siteType" });
  const permCount = Array.isArray(permissions) ? permissions.length : 0;
  const openMenu = Boolean(anchorEl);
  const overrideActive = !!overrideSiteType;
  const effectiveSiteType = resolveSiteType(overrideActive ? templateSiteType : cardSiteType);
  const TypeIcon = siteTypeIcon(effectiveSiteType);
  const createAsLabel =
    effectiveSiteType === "teams"
      ? "Microsoft Team"
      : resolveCreateAs(createAs) === "Communication"
        ? "Communication site"
        : "Team site";

  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: `${name}.libraries`,
  });

  // Flag anything on this card that keeps Save disabled (same rules as form + save checks).
  const missingDisplayName = !displayName?.trim();
  const missingRootPerms = permCount === 0;
  const incompleteLibraries = (libraries || []).some((lib) => !lib?.name?.trim());
  const cardBlocksSave = missingDisplayName || missingRootPerms || incompleteLibraries;

  return (
    <Card
      sx={{
        width: CARD_WIDTH,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: cardBlocksSave ? "2px solid" : "none",
        borderColor: cardBlocksSave ? "error.main" : "transparent",
      }}
    >
      {/* Brand header + subheader — clearly divided bars */}
      <Box>
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
          <Tooltip
            title={
              overrideActive
                ? "Clear the site type override first"
                : effectiveSiteType === "teams"
                  ? "Microsoft Teams — click to change site type"
                  : "SharePoint site — click to change site type"
            }
          >
            <Box
              component="button"
              type="button"
              disabled={overrideActive}
              onClick={() => {
                if (overrideActive) return;
                setSiteTypeOpen(true);
              }}
              aria-label={
                overrideActive
                  ? effectiveSiteType === "teams"
                    ? "Microsoft Teams"
                    : "SharePoint site"
                  : "Change site type"
              }
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 0,
                p: 0.25,
                m: 0,
                border: "none",
                borderRadius: 1,
                background: "none",
                color: "inherit",
                cursor: overrideActive ? "default" : "pointer",
                opacity: overrideActive ? 0.7 : 1,
                "&:hover": overrideActive
                  ? undefined
                  : { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              <TypeIcon fontSize="small" aria-hidden />
            </Box>
          </Tooltip>
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
          <Tooltip
            title={
              permCount > 0
                ? `${permCount} site-level permission${permCount > 1 ? "s" : ""} — click to edit`
                : "Root permissions required — click to add"
            }
          >
            <IconButton
              size="small"
              aria-label={
                permCount > 0 ? "Edit site permissions" : "Add site permissions"
              }
              onClick={() => onConfigurePermissions()}
              sx={{ color: permCount > 0 ? "#fff" : "error.main" }}
            >
              <Lock fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Site actions">
            <IconButton
              size="small"
              aria-label="Site actions"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: "#fff" }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            bgcolor: "#0a4059",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            px: 1.5,
            py: 0.75,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.3,
            }}
          >
            {createAsLabel}
          </Typography>
        </Box>
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
            <ListItemText>{permCount > 0 ? "Edit Site Permissions" : "Add Site Permissions"}</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={overrideActive}
            onClick={() => {
              if (overrideActive) return;
              setAnchorEl(null);
              setSiteTypeOpen(true);
            }}
          >
            <ListItemIcon>
              <Category fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Change Site Type"
              secondary={overrideActive ? "Clear the site type override first" : undefined}
            />
          </MenuItem>
          {effectiveSiteType === "sharePoint" && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setSiteLanguageOpen(true);
              }}
            >
              <ListItemIcon>
                <Translate fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Site Language" />
            </MenuItem>
          )}
          {effectiveSiteType === "sharePoint" && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setCreateAsOpen(true);
              }}
            >
              <ListItemIcon>
                <Web fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Create as" />
            </MenuItem>
          )}
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

      {/* Body: document libraries + faint type watermark */}
      <Box
        sx={{
          p: 1.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          minHeight: 160,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 72,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.08,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <TypeIcon sx={{ fontSize: 64 }} style={watermarkTypeIconSx} />
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5, position: "relative", zIndex: 1 }}>
          Document Libraries
        </Typography>
        <Stack spacing={0.25} sx={{ flexGrow: 1, position: "relative", zIndex: 1 }}>
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

      <SiteTypeDialog
        formControl={formControl}
        name={siteTypeOpen ? name : null}
        overrideActive={overrideActive}
        onClose={() => setSiteTypeOpen(false)}
      />
      <SiteLanguageDialog
        formControl={formControl}
        name={siteLanguageOpen ? name : null}
        onClose={() => setSiteLanguageOpen(false)}
      />
      <CreateAsDialog
        formControl={formControl}
        name={createAsOpen ? name : null}
        onClose={() => setCreateAsOpen(false)}
      />
    </Card>
  );
};

// Dashed add card with two peer buttons: SharePoint site or Microsoft Teams.
const AddSiteCard = ({ onAddSharePoint, onAddTeams }) => (
  <Card
    variant="outlined"
    sx={{
      width: CARD_WIDTH,
      minHeight: 220,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "center",
      gap: 1.5,
      px: 2,
      py: 2,
      color: "text.secondary",
      borderStyle: "dashed",
      borderWidth: 2,
    }}
  >
    <Typography variant="subtitle2" textAlign="center">
      Add New Site Template
    </Typography>
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        onClick={onAddSharePoint}
        sx={{
          flexDirection: "column",
          gap: 0.75,
          py: 2,
          borderStyle: "dashed",
          color: "text.secondary",
          "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <SharePointIcon sx={{ fontSize: 36 }} />
        <Typography variant="caption">SharePoint</Typography>
      </Button>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        onClick={onAddTeams}
        sx={{
          flexDirection: "column",
          gap: 0.75,
          py: 2,
          borderStyle: "dashed",
          color: "text.secondary",
          "&:hover": { color: "primary.main", borderColor: "primary.main", bgcolor: "action.hover" },
        }}
      >
        <TeamsIcon sx={{ fontSize: 36 }} />
        <Typography variant="caption">Teams</Typography>
      </Button>
    </Box>
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

export const CippSharePointTemplateQuickStats = ({ formControl, sx }) => {
  const siteTemplates = useWatch({ control: formControl.control, name: "siteTemplates" }) || [];
  const overrideSiteType = useWatch({ control: formControl.control, name: "overrideSiteType" });
  const templateSiteType = useWatch({ control: formControl.control, name: "siteType" });
  const overrideActive = !!overrideSiteType;

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

  // Counts respect the section override so they match what deploy will create.
  const teamsCount = siteTemplates.filter((site) => {
    const effective = overrideActive ? templateSiteType : site?.siteType;
    return effective === "teams";
  }).length;
  const sharePointCount = siteTemplates.length - teamsCount;

  return (
    <Card sx={{ p: 2, width: "100%", height: "100%", ...sx }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Quick Stats
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Stat label="Total Site Templates" value={siteTemplates.length} />
      <Stat label="SharePoint Templates" value={sharePointCount} />
      <Stat label="Teams Templates" value={teamsCount} />
      <Stat label="Libraries Defined" value={libraryCount} />
      <Stat label="Permission Grants" value={permissionCount} />
    </Card>
  );
};

export const CippSharePointTemplateQuickStatsSkeleton = () => (
  <Card sx={{ p: 2, width: "100%", height: "100%" }}>
    <Skeleton variant="text" width={100} height={28} />
    <Divider sx={{ my: 1 }} />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </Card>
);

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

// Dialog for the section-level site type override (one menu entry → this dialog).
const SiteTypeOverrideDialog = ({ formControl, open, onClose }) => {
  const overrideActive = !!useWatch({ control: formControl.control, name: "overrideSiteType" });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Override site types</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Force every site in this template to deploy as the same type, ignoring each card&apos;s
            own site type.
          </Typography>
          <CippFormComponent
            type="switch"
            label="Override site type for all sites"
            name="overrideSiteType"
            formControl={formControl}
          />
          <CippFormComponent
            type="select"
            label="Site type"
            name="siteType"
            formControl={formControl}
            options={SITE_TYPE_OPTIONS}
            disabled={!overrideActive}
          />
          {!overrideActive && (
            <Typography variant="caption" color="text.secondary">
              Turn on the override to choose the type applied to every site.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

// The card-canvas builder: site-template cards plus dual SharePoint/Teams add buttons.
// Site-type override lives in the section actions menu.
export const CippSharePointTemplateBuilder = ({ formControl }) => {
  const [permTarget, setPermTarget] = useState(null);
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const overrideSiteType = useWatch({ control: formControl.control, name: "overrideSiteType" });
  const templateSiteType = useWatch({ control: formControl.control, name: "siteType" });
  const overrideActive = !!overrideSiteType;
  const OverrideIcon = siteTypeIcon(resolveSiteType(templateSiteType));
  const { fields, append, remove } = useFieldArray({
    control: formControl.control,
    name: "siteTemplates",
  });

  const handleConfigurePermissions = (name, title) => setPermTarget({ name, title });

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5">Site Templates</Typography>
          <Typography variant="body2" color="text.secondary">
            Each site template provisions a SharePoint site or Microsoft Team and its document
            libraries.
          </Typography>
          {overrideActive && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}
            >
              <OverrideIcon sx={{ fontSize: 14 }} />
              Site type override active — all sites deploy as{" "}
              {resolveSiteType(templateSiteType) === "teams" ? "Microsoft Teams" : "SharePoint sites"}.
            </Typography>
          )}
        </Box>
        <Box>
          <Tooltip title="Site template actions">
            <IconButton
              aria-label="Site template actions"
              onClick={(e) => setActionsAnchor(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={actionsAnchor}
            open={Boolean(actionsAnchor)}
            onClose={() => setActionsAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setActionsAnchor(null);
                setOverrideDialogOpen(true);
              }}
            >
              <ListItemIcon>
                <Category fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Override site types…" />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
        <AddSiteCard
          onAddSharePoint={() => append(newSiteTemplate("sharePoint"))}
          onAddTeams={() => append(newSiteTemplate("teams"))}
        />
      </Box>

      <PermissionDialog
        formControl={formControl}
        target={permTarget}
        onClose={() => setPermTarget(null)}
      />
      <SiteTypeOverrideDialog
        formControl={formControl}
        open={overrideDialogOpen}
        onClose={() => setOverrideDialogOpen(false)}
      />
    </Box>
  );
};

// Loading placeholder for the site card canvas, shown while an existing template is fetched.
export const CippSharePointTemplateBuilderSkeleton = () => (
  <Box>
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" width={180} height={32} />
      <Skeleton variant="text" width={320} />
    </Box>
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
  </Box>
);

export default CippSharePointTemplateBuilder;
