import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle,
  DeselectOutlined,
  DoneAll,
  Error as ErrorIcon,
  ExpandLess,
  ExpandMore,
  NavigateBefore,
  NavigateNext,
  SettingsBackupRestore,
  UploadFile,
  Warning,
} from "@mui/icons-material";
import { ApiPostCall } from "../../api/ApiCall";
import { CippApiResults } from "./CippApiResults";
import { useState, useEffect, useMemo } from "react";

const TABLE_LABELS = {
  AppPermissions: "App Permissions",
  CommunityRepos: "Community Repositories",
  Config: "CIPP Configuration",
  CustomPowershellScripts: "Custom PowerShell/Test Scripts",
  CustomData: "Custom Data",
  CustomRoles: "Custom Roles",
  Domains: "Domains",
  ExcludedLicenses: "Excluded Licenses",
  GDAPRoleTemplates: "GDAP Role Templates",
  GDAPRoles: "GDAP Roles",
  GraphPresets: "Graph Explorer Presets",
  ScheduledTasks: "Scheduled Tasks",
  SchedulerConfig: "Scheduler Configuration",
  TenantGroupMembers: "Tenant Group Members",
  TenantGroups: "Tenant Groups",
  WebhookRules: "Webhook Rules",
  "templates:AppApprovalTemplate": "App Approval Templates",
  "templates:AssignmentFilterTemplate": "Assignment Filter Templates",
  "templates:BPATemplate": "BPA Templates",
  "templates:CATemplate": "Conditional Access Templates",
  "templates:ConnectionfilterTemplate": "Connection Filter Templates",
  "templates:ContactTemplate": "Contact Templates",
  "templates:ExConnectorTemplate": "Exchange Connector Templates",
  "templates:GroupTemplate": "Group Templates",
  "templates:IntuneReusableSettingTemplate": "Intune Reusable Setting Templates",
  "templates:IntuneTemplate": "Intune Templates",
  "templates:JITAdminTemplate": "JIT Admin Templates",
  "templates:ReportingTemplate": "Reporting Templates",
  "templates:RoleTemplate": "Role Templates",
  "templates:SafeLinksTemplate": "Safe Links Templates",
  "templates:SpamfilterTemplate": "Spam Filter Templates",
  "templates:StandardsTemplateV2": "Standards Templates",
  "templates:Templates": "App Permission Templates",
  "templates:TransportTemplate": "Transport Rule Templates",
  "templates:UserDefaultTemplate": "User Default Templates",
  "templates:settings": "Template Settings",
};

const getItemCategoryKey = (item) => {
  if (item.table === "templates") {
    return `templates:${item.PartitionKey ?? "unknown"}`;
  }
  return item.table;
};

const IGNORED_CATEGORY_KEYS = new Set();

// Returns the best human-readable display name for a backup item
const getItemDisplayName = (item) => {
  // For templates, the name is inside the JSON payload
  if (item.table === "templates" && item.JSON) {
    try {
      const inner = JSON.parse(item.JSON);
      const name =
        inner.displayName ||
        inner.DisplayName ||
        inner.Displayname ||
        inner.templateName ||
        inner.name ||
        inner.Name;
      if (name && typeof name === "string" && name.trim()) return name.trim();
    } catch {
      // fall through
    }
  }
  // Try common named properties across all tables
  const candidates = [
    item.displayName,
    item.name,
    item.Name,
    item.Product_Display_Name,
    item.GroupName,
    item.RoleName,
    item.customerId,
  ];
  for (const c of candidates) {
    if (c && typeof c === "string" && c.trim()) return c.trim();
  }
  // Fall back to cleaned RowKey
  const rowKey = item.RowKey ?? "";
  if (item.table === "templates" && item.PartitionKey) {
    const stripped = rowKey
      .replace(new RegExp(`\\.${item.PartitionKey}\\.json$`), "")
      .replace(/\.json$/, "");
    return stripped || rowKey;
  }
  return rowKey.replace(/\.json$/, "") || rowKey;
};

const WIZARD_STEPS = ["Validation", "Select Categories", "Confirm & Restore"];

export const CippRestoreWizard = ({
  open,
  onClose,
  validationResult,
  backupFile,
  backupData,
  backupName,
  isLoading = false,
}) => {
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const handleToggleExpand = (key) =>
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));

  const restoreAction = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["BackupList"],
  });

  const categories = useMemo(() => {
    if (!Array.isArray(backupData)) return [];
    const counts = {};
    backupData.forEach((item) => {
      const key = getItemCategoryKey(item);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([key]) => !IGNORED_CATEGORY_KEYS.has(key))
      .sort((a, b) => (TABLE_LABELS[a[0]] || a[0]).localeCompare(TABLE_LABELS[b[0]] || b[0]))
      .map(([key, count]) => ({ key, label: TABLE_LABELS[key] || key, count }));
  }, [backupData]);

  useEffect(() => {
    if (open) {
      setStep(0);
      setExpandedCategories({});
      restoreAction.reset();
    }
  }, [open]);

  useEffect(() => {
    if (categories.length > 0) {
      const all = {};
      categories.forEach((c) => {
        all[c.key] = true;
      });
      setSelectedCategories(all);
    } else {
      setSelectedCategories({});
    }
  }, [categories]);

  const selectedCount = Object.values(selectedCategories).filter(Boolean).length;
  const totalCount = categories.length;

  const filteredData = useMemo(
    () =>
      Array.isArray(backupData)
        ? backupData.filter((item) => selectedCategories[getItemCategoryKey(item)])
        : [],
    [backupData, selectedCategories],
  );

  const handleSelectAll = () => {
    const all = {};
    categories.forEach((c) => {
      all[c.key] = true;
    });
    setSelectedCategories(all);
  };

  const handleDeselectAll = () => setSelectedCategories({});

  const handleToggleCategory = (key) =>
    setSelectedCategories((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleConfirmRestore = () => {
    const selectedTypes = Object.keys(selectedCategories).filter((k) => selectedCategories[k]);
    if (backupName) {
      // Blob backup: let the API fetch and filter server-side
      restoreAction.mutate({
        url: "/api/ExecRestoreBackup",
        data: { BackupName: backupName, SelectedTypes: selectedTypes },
      });
    } else {
      // File upload: post the filtered data directly
      restoreAction.mutate({
        url: "/api/ExecRestoreBackup",
        data: filteredData,
      });
    }
  };

  // Step 0 — Validation summary
  const StepValidation = () => (
    <Stack spacing={2}>
      {backupFile && (
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
          >
            <UploadFile color="primary" fontSize="small" />
            <strong>Backup Source</strong>
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "grey.50"),
              borderRadius: 1,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Name:</strong> {backupFile.name}
              </Typography>
              {backupFile.size != null && (
                <Typography variant="body2">
                  <strong>Size:</strong> {(backupFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
              {backupFile.lastModified && (
                <Typography variant="body2">
                  <strong>Date:</strong> {backupFile.lastModified.toLocaleString()}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      )}

      {validationResult &&
        (validationResult.isValid ? (
          <Alert severity="success" icon={<CheckCircle />}>
            <AlertTitle>Validation Passed</AlertTitle>
            <Typography variant="body2">
              {validationResult.validRows} valid rows across {categories.length} categories.
              {validationResult.repaired && " Minor issues were automatically repaired."}
            </Typography>
            {validationResult.warnings?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {validationResult.warnings.map((w, i) => (
                  <Typography key={i} variant="body2" color="warning.main">
                    ⚠ {w}
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        ) : (
          <Alert severity="error" icon={<ErrorIcon />}>
            <AlertTitle>Validation Failed</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              This backup cannot be restored safely.
            </Typography>
            {validationResult.errors?.map((err, i) => (
              <Typography key={i} variant="body2">
                • {err}
              </Typography>
            ))}
          </Alert>
        ))}
    </Stack>
  );

  // Step 1 — Category selection
  const StepSelectCategories = () => (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {selectedCount} of {totalCount} categories selected ({filteredData.length} items)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<DoneAll />}
            onClick={handleSelectAll}
            disabled={selectedCount === totalCount}
          >
            All
          </Button>
          <Button
            size="small"
            startIcon={<DeselectOutlined />}
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
          >
            None
          </Button>
        </Stack>
      </Box>
      <Divider />
      <FormGroup sx={{ width: "100%" }}>
        <Stack spacing={0}>
          {categories.map((cat) => {
            const items = Array.isArray(backupData)
              ? backupData.filter((item) => getItemCategoryKey(item) === cat.key)
              : [];
            const isExpanded = !!expandedCategories[cat.key];
            return (
              <Box key={cat.key} sx={{ width: "100%", minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", minWidth: 0 }}>
                  <FormControlLabel
                    sx={{ flex: 1, mr: 0, minWidth: 0, overflow: "hidden" }}
                    control={
                      <Checkbox
                        checked={!!selectedCategories[cat.key]}
                        onChange={() => handleToggleCategory(cat.key)}
                        size="small"
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          minWidth: 0,
                          overflow: "hidden",
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {cat.label}
                        </Typography>
                        <Chip
                          label={cat.count}
                          size="small"
                          variant="outlined"
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                    }
                  />
                  <Tooltip title={isExpanded ? "Hide items" : "Preview items"}>
                    <IconButton size="small" onClick={() => handleToggleExpand(cat.key)}>
                      {isExpanded ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Collapse in={isExpanded} unmountOnExit sx={{ overflow: "hidden" }}>
                  <Box
                    sx={{
                      mr: 0.5,
                      mb: 1,
                      maxHeight: 200,
                      overflowY: "auto",
                      overflowX: "hidden",
                      bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50"),
                      borderRadius: 1,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {items.map((item, i) => {
                      const name = getItemDisplayName(item);
                      const sub =
                        name !== item.RowKey && item.RowKey
                          ? item.RowKey.replace(/\.json$/, "")
                          : null;
                      return (
                        <Box key={i} sx={{ px: 1, py: 0.25 }}>
                          <Typography
                            variant="caption"
                            title={name}
                            sx={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {name}
                          </Typography>
                          {sub && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              title={sub}
                              sx={{
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {sub}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Stack>
      </FormGroup>
    </Stack>
  );

  // Step 2 — Confirm and results
  const StepConfirm = () => (
    <Stack spacing={2}>
      {!restoreAction.isSuccess && (
        <Alert severity="warning" icon={<Warning />}>
          <AlertTitle>Confirm Restore</AlertTitle>
          This will overwrite your current CIPP configuration for the selected categories. This
          action cannot be undone.
        </Alert>
      )}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {selectedCount} {selectedCount === 1 ? "category" : "categories"} ({filteredData.length}{" "}
          items) selected for restore:
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
          {categories
            .filter((c) => selectedCategories[c.key])
            .map((c) => (
              <Chip
                key={c.key}
                label={`${c.label} (${c.count})`}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
        </Stack>
      </Box>
      <CippApiResults apiObject={restoreAction} />
    </Stack>
  );

  const StepComponents = [StepValidation, StepSelectCategories, StepConfirm];
  const CurrentStep = StepComponents[step];

  const canProceed =
    step === 0 ? validationResult?.isValid : step === 1 ? selectedCount > 0 : false;

  return (
    <Dialog open={open} onClose={onClose} fullWidth size="lg" fullScreen={mdDown}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, p: 2 }}>
        <SettingsBackupRestore />
        Restore Backup
      </DialogTitle>
      {!isLoading && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ px: 3, pb: 2 }}>
            <Stepper activeStep={step} alternativeLabel>
              {WIZARD_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </>
      )}
      <DialogContent dividers={true} sx={{ overflowY: "auto", flex: 1, px: 3, pt: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading backup&hellip;
            </Typography>
          </Box>
        ) : (
          <CurrentStep />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button color="inherit" onClick={onClose}>
          {restoreAction.isSuccess ? "Close" : "Cancel"}
        </Button>
        {!isLoading && step > 0 && !restoreAction.isSuccess && (
          <Button startIcon={<NavigateBefore />} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {!isLoading && step < WIZARD_STEPS.length - 1 && (
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed}
          >
            Next
          </Button>
        )}
        {!isLoading && step === WIZARD_STEPS.length - 1 && !restoreAction.isSuccess && (
          <Button
            variant="contained"
            color="warning"
            startIcon={<SettingsBackupRestore />}
            onClick={handleConfirmRestore}
            disabled={selectedCount === 0 || restoreAction.isPending}
          >
            Restore
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CippRestoreWizard;
