import { useEffect, useState } from "react";
import { useForm, useWatch, useFormState } from "react-hook-form";
import {
  Button,
  Drawer,
  Box,
  Typography,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Tooltip,
} from "@mui/material";
import { Grid } from "@mui/system";
import {
  Close as CloseIcon,
  RestoreFromTrash,
  DeleteForever,
  Archive,
  Storage,
  AccountBox,
} from "@mui/icons-material";
import { useSettings } from "../../hooks/use-settings";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";

const wellKnownFolders = [
  "Inbox",
  "SentItems",
  "DeletedItems",
  "Calendar",
  "Contacts",
  "Drafts",
  "Journal",
  "Tasks",
  "Notes",
  "JunkEmail",
  "CommunicationHistory",
  "Voicemail",
  "Fax",
  "Conflicts",
  "SyncIssues",
  "LocalFailures",
  "ServerFailures",
].map((folder) => ({ value: `#${folder}#`, label: getCippTranslation(folder) }));

export const CippMailboxRestoreDrawer = ({
  buttonText = "New Restore Job",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults.currentTenant;

  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: tenantDomain,
    },
  });

  const createRestore = ApiPostCall({
    relatedQueryKeys: ["MailboxRestores*"],
    datafromurl: true,
  });

  const { isValid, isDirty } = useFormState({ control: formControl.control });

  const sourceMailbox = useWatch({ control: formControl.control, name: "SourceMailbox" });
  const targetMailbox = useWatch({ control: formControl.control, name: "TargetMailbox" });

  // Helper function to check if archive is active (GUID exists and is not all zeros)
  const hasActiveArchive = (mailbox) => {
    const archiveGuid = mailbox?.addedFields?.ArchiveGuid;
    return (
      archiveGuid &&
      archiveGuid !== "00000000-0000-0000-0000-000000000000" &&
      archiveGuid.replace(/0/g, "").replace(/-/g, "") !== ""
    );
  };

  useEffect(() => {
    if (sourceMailbox && targetMailbox) {
      const sourceUPN = sourceMailbox.value;
      const targetUPN = targetMailbox.value;
      const randomGUID = crypto.randomUUID();
      formControl.setValue("RequestName", `Restore ${sourceUPN} to ${targetUPN} (${randomGUID})`, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [sourceMailbox?.value, targetMailbox?.value]);

  useEffect(() => {
    if (createRestore.isSuccess) {
      formControl.reset();
    }
  }, [createRestore.isSuccess]);

  const handleSubmit = () => {
    const values = formControl.getValues();
    const shippedValues = {
      TenantFilter: tenantDomain,
      RequestName: values.RequestName,
      SourceMailbox: values.SourceMailbox?.addedFields?.ExchangeGuid ?? values.SourceMailbox?.value,
      TargetMailbox: values.TargetMailbox?.addedFields?.ExchangeGuid ?? values.TargetMailbox?.value,
      BadItemLimit: values.BadItemLimit,
      LargeItemLimit: values.LargeItemLimit,
      AcceptLargeDataLoss: values.AcceptLargeDataLoss,
      AssociatedMessagesCopyOption: values.AssociatedMessagesCopyOption,
      ExcludeFolders: values.ExcludeFolders,
      IncludeFolders: values.IncludeFolders,
      BatchName: values.BatchName,
      CompletedRequestAgeLimit: values.CompletedRequestAgeLimit,
      ConflictResolutionOption: values.ConflictResolutionOption,
      SourceRootFolder: values.SourceRootFolder,
      TargetRootFolder: values.TargetRootFolder,
      TargetType: values.TargetType,
      ExcludeDumpster: values.ExcludeDumpster,
      SourceIsArchive: values.SourceIsArchive,
      TargetIsArchive: values.TargetIsArchive,
    };

    createRestore.mutate({
      url: "/api/ExecMailboxRestore",
      data: shippedValues,
    });
  };

  const handleCloseDrawer = () => {
    formControl.reset();
    setDrawerVisible(false);
  };

  return (
    <>
      <PermissionButton
        startIcon={<RestoreFromTrash />}
        onClick={() => setDrawerVisible(true)}
        requiredPermissions={requiredPermissions}
      >
        {buttonText}
      </PermissionButton>

      <Drawer
        anchor="right"
        open={drawerVisible}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 600, md: 800 } },
        }}
      >
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}
          >
            <Typography variant="h5">New Mailbox Restore</Typography>
            <IconButton onClick={handleCloseDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 3, px: 2 }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Alert severity="info">
                  Use this form to restore a mailbox from a soft-deleted state to the target
                  mailbox. Use the optional settings to tailor the restore request for your needs.
                </Alert>
              </Grid>

              <Grid size={12}>
                <Typography variant="h6">Restore Settings</Typography>
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  name="SourceMailbox"
                  label="Source Mailbox"
                  type="autoComplete"
                  formControl={formControl}
                  multiple={false}
                  creatable={true}
                  required={true}
                  api={{
                    labelField: (option) => `${option.displayName} (${option.UPN})`,
                    valueField: "UPN",
                    addedField: {
                      displayName: "displayName",
                      ExchangeGuid: "ExchangeGuid",
                      recipientTypeDetails: "recipientTypeDetails",
                      ArchiveStatus: "ArchiveStatus",
                      ArchiveGuid: "ArchiveGuid",
                      ProhibitSendQuota: "ProhibitSendQuota",
                      TotalItemSize: "TotalItemSize",
                      ItemCount: "ItemCount",
                      WhenSoftDeleted: "WhenSoftDeleted",
                    },
                    url: "/api/ListMailboxes?SoftDeletedMailbox=true",
                    queryKey: `ListMailboxes-${tenantDomain}-SoftDeleted`,
                    showRefresh: true,
                  }}
                  validators={{
                    validate: (value) => (value ? true : "Please select a source mailbox."),
                  }}
                />
              </Grid>

              {sourceMailbox && (
                <Grid size={12}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                    {sourceMailbox.addedFields?.recipientTypeDetails && (
                      <Tooltip
                        title={`Mailbox type: ${sourceMailbox.addedFields.recipientTypeDetails}`}
                      >
                        <Chip
                          icon={<AccountBox />}
                          label={sourceMailbox.addedFields.recipientTypeDetails}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      title={
                        hasActiveArchive(sourceMailbox)
                          ? "This mailbox has an active archive available for restore"
                          : "This mailbox does not have an active archive - archive options will be disabled"
                      }
                    >
                      <Chip
                        icon={<Archive />}
                        label={
                          hasActiveArchive(sourceMailbox)
                            ? "Archive Active"
                            : "Archive Not Available"
                        }
                        size="small"
                        color={hasActiveArchive(sourceMailbox) ? "success" : "warning"}
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                </Grid>
              )}

              <Grid size={12}>
                <CippFormComponent
                  name="TargetMailbox"
                  label="Restore Target"
                  type="autoComplete"
                  formControl={formControl}
                  multiple={false}
                  creatable={true}
                  required={true}
                  api={{
                    queryKey: `ListMailboxes-${tenantDomain}`,
                    labelField: (option) => `${option.displayName} (${option.UPN})`,
                    valueField: "UPN",
                    addedField: {
                      displayName: "displayName",
                      ExchangeGuid: "ExchangeGuid",
                      recipientTypeDetails: "recipientTypeDetails",
                      ArchiveStatus: "ArchiveStatus",
                      ArchiveGuid: "ArchiveGuid",
                      ProhibitSendQuota: "ProhibitSendQuota",
                      TotalItemSize: "TotalItemSize",
                      ItemCount: "ItemCount",
                    },
                    url: "/api/ListMailboxes",
                    data: { UseReportDB: true },
                    showRefresh: true,
                  }}
                  validators={{
                    validate: (value) => (value ? true : "Please select a target mailbox."),
                  }}
                />
              </Grid>

              {targetMailbox && (
                <Grid size={12}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                    {targetMailbox.addedFields?.recipientTypeDetails && (
                      <Tooltip
                        title={`Target mailbox type: ${targetMailbox.addedFields.recipientTypeDetails}`}
                      >
                        <Chip
                          icon={<AccountBox />}
                          label={targetMailbox.addedFields.recipientTypeDetails}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                    <Tooltip
                      title={
                        hasActiveArchive(targetMailbox)
                          ? "This target mailbox has an active archive available"
                          : "This target mailbox does not have an active archive - archive options will be limited"
                      }
                    >
                      <Chip
                        icon={<Archive />}
                        label={
                          hasActiveArchive(targetMailbox)
                            ? "Archive Active"
                            : "Archive Not Available"
                        }
                        size="small"
                        color={hasActiveArchive(targetMailbox) ? "success" : "warning"}
                        variant="outlined"
                      />
                    </Tooltip>
                    {targetMailbox.addedFields?.TotalItemSize && (
                      <Tooltip
                        title={`Current mailbox size: ${targetMailbox.addedFields.TotalItemSize}`}
                      >
                        <Chip
                          icon={<Storage />}
                          label={targetMailbox.addedFields.TotalItemSize}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Grid>
              )}

              <Grid size={12}>
                <CippFormComponent
                  type="textField"
                  label="Restore Request Name"
                  name="RequestName"
                  required={true}
                  formControl={formControl}
                  validators={{ required: "Please enter a request name." }}
                />
              </Grid>

              <Grid size={12}>
                <Divider />
              </Grid>

              <Grid size={12}>
                <Typography variant="h6">Optional Settings</Typography>
              </Grid>

              <Grid size={{ xs: 6, md: 6 }}>
                <CippFormComponent
                  type="number"
                  label="Bad Item Limit"
                  name="BadItemLimit"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={{ xs: 6, md: 6 }}>
                <CippFormComponent
                  type="number"
                  label="Large Item Limit"
                  name="LargeItemLimit"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="number"
                  label="Completed Request Age Limit"
                  name="CompletedRequestAgeLimit"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Associated Messages Copy Option"
                  name="AssociatedMessagesCopyOption"
                  formControl={formControl}
                  options={[
                    { value: "DoNotCopy", label: "Do Not Copy" },
                    { value: "MapByMessageClass", label: "Map By Message Class" },
                    { value: "Copy", label: "Copy" },
                  ]}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Exclude Folders"
                  name="ExcludeFolders"
                  formControl={formControl}
                  multiple={true}
                  creatable={true}
                  options={wellKnownFolders}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Include Folders"
                  name="IncludeFolders"
                  formControl={formControl}
                  multiple={true}
                  creatable={true}
                  options={wellKnownFolders}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="textField"
                  label="Batch Name"
                  name="BatchName"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Conflict Resolution Option"
                  name="ConflictResolutionOption"
                  formControl={formControl}
                  multiple={false}
                  options={[
                    { value: "ForceCopy", label: "Force Copy" },
                    { value: "KeepAll", label: "Keep All" },
                    { value: "KeepLatestItem", label: "Keep Latest Item" },
                    { value: "KeepSourceItem", label: "Keep Source Item" },
                    { value: "KeepTargetItem", label: "Keep Target Item" },
                    { value: "UpdateFromSource", label: "Update From Source" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  label="Source Root Folder"
                  name="SourceRootFolder"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="textField"
                  label="Target Root Folder"
                  name="TargetRootFolder"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Target Type"
                  name="TargetType"
                  multiple={false}
                  formControl={formControl}
                  options={[
                    { value: "Archive", label: "Archive" },
                    { value: "MailboxLocation", label: "Mailbox Location" },
                    { value: "Primary", label: "Primary" },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="Exclude Dumpster"
                  name="ExcludeDumpster"
                  formControl={formControl}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="Source Is Archive"
                  name="SourceIsArchive"
                  formControl={formControl}
                  disabled={!hasActiveArchive(sourceMailbox)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <CippFormComponent
                  type="switch"
                  label="Target Is Archive"
                  name="TargetIsArchive"
                  formControl={formControl}
                  disabled={!hasActiveArchive(targetMailbox)}
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 2 }}>
            <CippApiResults apiObject={createRestore} />
          </Box>

          <Box sx={{ borderTop: 1, borderColor: "divider", pt: 2 }}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isValid || !isDirty || createRestore.isPending}
                startIcon={
                  createRestore.isPending ? <CircularProgress size={16} /> : <RestoreFromTrash />
                }
              >
                {createRestore.isPending ? "Creating..." : "Create Restore Job"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};
