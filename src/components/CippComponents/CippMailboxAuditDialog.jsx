import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import { Close, Warning } from "@mui/icons-material";
import CippFormComponent from "./CippFormComponent";

const CippMailboxAuditDialog = ({ formHook, auditData, isLoading }) => {
  const [selectedActions, setSelectedActions] = useState({
    Owner: [],
    Delegate: [],
    Admin: [],
  });

  // Track bypassEnabled from auditData (not user-configurable)
  const bypassEnabled = auditData?.BypassEnabled || false;

  // Default audit actions for user/shared mailboxes (from Microsoft docs table, starred actions)
  const defaultAuditActions = {
    Owner: [
      "ApplyRecord",
      "HardDelete",
      "MailItemsAccessed",
      "MoveToDeletedItems",
      "Send",
      "SoftDelete",
      "Update",
      "UpdateCalendarDelegation",
      "UpdateFolderPermissions",
      "UpdateInboxRules",
    ],
    Delegate: [
      "ApplyRecord",
      "Create",
      "HardDelete",
      "MailItemsAccessed",
      "MoveToDeletedItems",
      "SendAs",
      "SendOnBehalf",
      "SoftDelete",
      "Update",
      "UpdateFolderPermissions",
      "UpdateInboxRules",
    ],
    Admin: [
      "ApplyRecord",
      "Create",
      "HardDelete",
      "MailItemsAccessed",
      "MoveToDeletedItems",
      "Send",
      "SendAs",
      "SendOnBehalf",
      "SoftDelete",
      "Update",
      "UpdateCalendarDelegation",
      "UpdateFolderPermissions",
      "UpdateInboxRules",
    ],
  };

  // Only include actions that are supported for each access type
  const getSupportedDefaults = (accessType) => {
    const supported = auditData?.AuditActions?.filter((a) => a[`${accessType}Supported`]).map((a) => a.Action) || [];
    return defaultAuditActions[accessType].filter((action) => supported.includes(action));
  };

  const handleRestoreDefaults = () => {
    setSelectedActions({
      Owner: getSupportedDefaults("Owner"),
      Delegate: getSupportedDefaults("Delegate"),
      Admin: getSupportedDefaults("Admin"),
    });
    setAuditEnabled(true);
    // bypassEnabled is not user-configurable, so do not set it here
  };

  const [auditEnabled, setAuditEnabled] = useState(false);

  // Initialize from current audit config
  useEffect(() => {
    if (auditData) {
      setAuditEnabled(auditData.AuditEnabled || false);
      const initial = {
        Owner: auditData.AuditOwner || [],
        Delegate: auditData.AuditDelegate || [],
        Admin: auditData.AuditAdmin || [],
      };
      setSelectedActions(initial);
      // Initialize form
      formHook.setValue("AuditEnabled", auditData.AuditEnabled || false);
    }
  }, [auditData, formHook]);

  // Update form hook whenever selections change
  useEffect(() => {
    formHook.setValue("AuditEnabled", auditEnabled);
    // Always send the full, final set of enabled actions for each access type as 'Add'
    const actions = [];
    ["Owner", "Delegate", "Admin"].forEach((accessType) => {
      selectedActions[accessType].forEach((action) => {
        actions.push({
          Action: action,
          AccessType: accessType,
          Modification: "Add",
        });
      });
    });
    formHook.setValue("AuditActions", actions);
  }, [selectedActions, auditEnabled, formHook]);

  const handleToggle = (action, accessType) => {
    setSelectedActions((prev) => {
      const current = prev[accessType] || [];
      const isSelected = current.includes(action);

      return {
        ...prev,
        [accessType]: isSelected
          ? current.filter((a) => a !== action)
          : [...current, action],
      };
    });
  };

  const handleSelectAll = (accessType, supported) => {
    setSelectedActions((prev) => ({
      ...prev,
      [accessType]: supported,
    }));
  };

  const handleDeselectAll = (accessType) => {
    setSelectedActions((prev) => ({
      ...prev,
      [accessType]: [],
    }));
  };

  const isActionEnabled = (action, accessType) => {
    return selectedActions[accessType]?.includes(action) || false;
  };

  const getSupportedActions = (accessType) => {
    return (
      auditData?.AuditActions?.filter((a) => a[`${accessType}Supported`]).map((a) => a.Action) ||
      []
    );
  };

  if (isLoading) {
    return <Typography>Loading audit configuration...</Typography>;
  }

  const supportedOwner = getSupportedActions("Owner");
  const supportedDelegate = getSupportedActions("Delegate");
  const supportedAdmin = getSupportedActions("Admin");

  // Determine if settings are effectively disabled
  const isEffectivelyDisabled = auditData?.OrgAuditDisabled || !auditEnabled;

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      {/* Warnings */}
      {auditData?.OrgAuditDisabled && (
        <Alert severity="error" icon={<Warning />}>
          <strong>Organization-wide auditing is DISABLED</strong>
          <br />
          Mailbox-level audit settings will be ignored until auditing is enabled at the organization level.
          Contact your Exchange administrator to enable organization auditing.
        </Alert>
      )}

      <Divider />

      {/* Audit Actions Configuration */}
      <Box sx={{ opacity: isEffectivelyDisabled ? 0.3 : 1 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="subtitle2" gutterBottom sx={{ mr: 2 }}>
            Apply these audit configuration changes?
          </Typography>
          <Button
            variant="outlined"
            onClick={handleRestoreDefaults}
            disabled={isLoading || !auditData}
            title="Restore Microsoft default audit actions for user/shared mailboxes"
            size="small"
            sx={{ ml: 1 }}
          >
            Restore Defaults
          </Button>
        </Box>

        {auditData?.DefaultActions && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Default audit set: {auditData.DefaultActions}
          </Alert>
        )}

        {bypassEnabled && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Audit bypass is enabled. Action configuration will have no effect until bypass is disabled.
          </Alert>
        )}

        {!auditEnabled && !bypassEnabled && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Mailbox auditing is disabled. Enable it above to configure audit actions.
          </Alert>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ opacity: isEffectivelyDisabled ? 0.3 : 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Action</strong>
              </TableCell>
              <TableCell align="center">
                <Stack direction="column" spacing={0.1} alignItems="center">
                  <strong>Owner</strong>
                  <Stack direction="row" spacing={0.3}>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleSelectAll("Owner", supportedOwner)}
                    >
                      All
                    </Typography>
                    <Typography variant="caption">|</Typography>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleDeselectAll("Owner")}
                    >
                      None
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Stack direction="column" spacing={0.1} alignItems="center">
                  <strong>Delegate</strong>
                  <Stack direction="row" spacing={0.3}>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleSelectAll("Delegate", supportedDelegate)}
                    >
                      All
                    </Typography>
                    <Typography variant="caption">|</Typography>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleDeselectAll("Delegate")}
                    >
                      None
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Stack direction="column" spacing={0.1} alignItems="center">
                  <strong>Admin</strong>
                  <Stack direction="row" spacing={0.3}>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleSelectAll("Admin", supportedAdmin)}
                    >
                      All
                    </Typography>
                    <Typography variant="caption">|</Typography>
                    <Typography
                      variant="caption"
                      sx={{ cursor: isEffectivelyDisabled ? 'default' : 'pointer', color: isEffectivelyDisabled ? 'text.disabled' : 'primary.main' }}
                      onClick={() => !isEffectivelyDisabled && handleDeselectAll("Admin")}
                    >
                      None
                    </Typography>
                  </Stack>
                </Stack>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditData?.AuditActions?.map((actionData) => (
              <TableRow key={actionData.Action} hover sx={{ height: 24, '& td': { py: 0.25 } }}>
                <TableCell>
                  <Typography variant="body2">{actionData.Action}</Typography>
                </TableCell>

                {/* Owner Column */}
                <TableCell align="center">
                  {actionData.OwnerSupported ? (
                    <Checkbox
                      checked={isActionEnabled(actionData.Action, "Owner")}
                      onChange={() => handleToggle(actionData.Action, "Owner")}
                      size="small"
                      disabled={isEffectivelyDisabled}
                    />
                  ) : (
                    <Close fontSize="small" color="disabled" />
                  )}
                </TableCell>

                {/* Delegate Column */}
                <TableCell align="center">
                  {actionData.DelegateSupported ? (
                    <Checkbox
                      checked={isActionEnabled(actionData.Action, "Delegate")}
                      onChange={() => handleToggle(actionData.Action, "Delegate")}
                      size="small"
                      disabled={isEffectivelyDisabled}
                    />
                  ) : (
                    <Close fontSize="small" color="disabled" />
                  )}
                </TableCell>

                {/* Admin Column */}
                <TableCell align="center">
                  {actionData.AdminSupported ? (
                    <Checkbox
                      checked={isActionEnabled(actionData.Action, "Admin")}
                      onChange={() => handleToggle(actionData.Action, "Admin")}
                      size="small"
                      disabled={isEffectivelyDisabled}
                    />
                  ) : (
                    <Close fontSize="small" color="disabled" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default CippMailboxAuditDialog;