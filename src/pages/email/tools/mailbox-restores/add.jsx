import { useEffect } from "react";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { useSettings } from "../../../../hooks/use-settings";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import { Alert, Divider, Typography } from "@mui/material";

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

const MailboxRestoreForm = () => {
  const tenantDomain = useSettings().currentTenant;

  const formControl = useForm({
    mode: "onChange",
  });

  const sourceMailbox = useWatch({ control: formControl.control, name: "SourceMailbox" });
  const targetMailbox = useWatch({ control: formControl.control, name: "TargetMailbox" });

  useEffect(() => {
    if (sourceMailbox && targetMailbox) {
      const sourceUPN = sourceMailbox.value;
      const targetUPN = targetMailbox.value;
      const randomGUID = crypto.randomUUID();
      formControl.setValue("RequestName", `Restore ${sourceUPN} to ${targetUPN} (${randomGUID})`);
    }
  }, [sourceMailbox, targetMailbox, formControl]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey="MailboxRestore"
      title="Mailbox Restore"
      backButtonTitle="Mailbox Overview"
      postUrl="/api/ExecMailboxRestore"
      customDataformatter={(values) => {
        const shippedValues = {
          TenantFilter: tenantDomain,
          RequestName: values.RequestName,
          SourceMailbox:
            values.SourceMailbox?.addedFields?.ExchangeGuid ?? values.SourceMailbox?.value,
          TargetMailbox:
            values.TargetMailbox?.addedFields?.ExchangeGuid ?? values.TargetMailbox?.value,
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
        return shippedValues;
      }}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <Alert severity="info">
            Use this form to restore a mailbox from a soft-deleted state to the target mailbox. Use
            the optional settings tailor the restore request for your needs.
          </Alert>
        </Grid>
        <Grid size={12}>
          <Typography variant="h6">Restore Settings</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
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
              addedField: { displayName: "displayName", ExchangeGuid: "ExchangeGuid" },
              url: "/api/ListMailboxes?SoftDeletedMailbox=true",
              queryKey: `ListMailboxes-${tenantDomain}-SoftDeleted`,
            }}
            validators={{ validate: (value) => (value ? true : "Please select a source mailbox.") }}
          />
        </Grid>
        {/* Target Mailbox */}
        <Grid size={{ xs: 12, md: 6 }}>
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
              addedField: { displayName: "displayName", ExchangeGuid: "ExchangeGuid" },
              url: "/api/ListMailboxes",
              data: { UseReportDB: true },
            }}
            validators={{ validate: (value) => (value ? true : "Please select a target mailbox.") }}
          />
        </Grid>
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
        <Grid size={{ xs: 6, md: 2 }}>
          <CippFormComponent
            type="number"
            label="Bad Item Limit"
            name="BadItemLimit"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <CippFormComponent
            type="number"
            label="Large Item Limit"
            name="LargeItemLimit"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 2 }}>
          <CippFormComponent
            type="number"
            label="Completed Request Age Limit"
            name="CompletedRequestAgeLimit"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="textField"
            label="Batch Name"
            name="BatchName"
            formControl={formControl}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            label="Exclude Dumpster"
            name="ExcludeDumpster"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            label="Source Is Archive"
            name="SourceIsArchive"
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CippFormComponent
            type="switch"
            label="Target Is Archive"
            name="TargetIsArchive"
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

MailboxRestoreForm.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default MailboxRestoreForm;
