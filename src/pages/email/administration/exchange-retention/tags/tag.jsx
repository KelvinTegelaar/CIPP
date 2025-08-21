import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { useSettings } from "/src/hooks/use-settings";
import { Grid } from "@mui/system";
import { Divider } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "/src/api/ApiCall";

const RetentionTag = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { name } = router.query;
  const isEdit = !!name;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      Name: "",
      Type: "",
      Comment: "",
      RetentionAction: "",
      AgeLimitForRetention: "",
      RetentionEnabled: true,
      LocalizedComment: "",
      LocalizedRetentionPolicyTagName: "",
    },
  });

  // Get existing tag data if editing
  const existingTagRequest = ApiGetCall({
    url: `/api/ExecManageRetentionTags?tenantFilter=${userSettingsDefaults.currentTenant}${isEdit ? `&name=${encodeURIComponent(name)}` : ''}`,
    queryKey: `RetentionTag-${name}-${userSettingsDefaults.currentTenant}`,
    waiting: isEdit,
  });

  const tagTypes = [
    { label: 'All', value: 'All' },
    { label: 'Inbox', value: 'Inbox' },
    { label: 'Sent Items', value: 'SentItems' },
    { label: 'Deleted Items', value: 'DeletedItems' },
    { label: 'Drafts', value: 'Drafts' },
    { label: 'Outbox', value: 'Outbox' },
    { label: 'Junk Email', value: 'JunkEmail' },
    { label: 'Journal', value: 'Journal' },
    { label: 'Sync Issues', value: 'SyncIssues' },
    { label: 'Conversation History', value: 'ConversationHistory' },
    { label: 'Personal', value: 'Personal' },
    { label: 'Recoverable Items', value: 'RecoverableItems' },
    { label: 'Non IPM Root', value: 'NonIpmRoot' },
    { label: 'Legacy Archive Journals', value: 'LegacyArchiveJournals' },
    { label: 'Clutter', value: 'Clutter' },
    { label: 'Calendar', value: 'Calendar' },
    { label: 'Notes', value: 'Notes' },
    { label: 'Tasks', value: 'Tasks' },
    { label: 'Contacts', value: 'Contacts' },
    { label: 'RSS Subscriptions', value: 'RssSubscriptions' },
    { label: 'Managed Custom Folder', value: 'ManagedCustomFolder' }
  ];

  const retentionActions = [
    { label: 'Delete and Allow Recovery', value: 'DeleteAndAllowRecovery' },
    { label: 'Permanently Delete', value: 'PermanentlyDelete' },
    { label: 'Move to Archive', value: 'MoveToArchive' },
    { label: 'Mark as Past Retention Limit', value: 'MarkAsPastRetentionLimit' }
  ];

  // Parse AgeLimitForRetention from TimeSpan format "90.00:00:00" to just days "90"
  const parseAgeLimitDays = (ageLimit) => {
    if (!ageLimit) return "";
    const match = ageLimit.toString().match(/^(\d+)\./);
    return match ? match[1] : "";
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && existingTagRequest.isSuccess && existingTagRequest.data) {
      const tag = existingTagRequest.data;
      
      // Find the matching options for dropdowns
      const typeOption = tagTypes.find(option => option.value === tag.Type) || null;
      const actionOption = retentionActions.find(option => option.value === tag.RetentionAction) || null;

      // Handle localized fields (arrays in API, strings in form)
      const localizedComment = Array.isArray(tag.LocalizedComment) 
        ? tag.LocalizedComment[0] || "" 
        : tag.LocalizedComment || "";
      const localizedTagName = Array.isArray(tag.LocalizedRetentionPolicyTagName) 
        ? tag.LocalizedRetentionPolicyTagName[0] || "" 
        : tag.LocalizedRetentionPolicyTagName || "";

      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        Name: tag.Name || "",
        Type: typeOption,
        Comment: tag.Comment || "",
        RetentionAction: actionOption,
        AgeLimitForRetention: parseAgeLimitDays(tag.AgeLimitForRetention),
        RetentionEnabled: tag.RetentionEnabled !== false,
        LocalizedComment: localizedComment,
        LocalizedRetentionPolicyTagName: localizedTagName,
      });
    }
  }, [isEdit, existingTagRequest.isSuccess, existingTagRequest.data, userSettingsDefaults.currentTenant, formControl]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={isEdit ? `RetentionTag-${name}` : "AddRetentionTag"}
      title={isEdit ? `Edit Retention Tag: ${name}` : "Add Retention Tag"}
      backButtonTitle="Retention Tags"
      formPageType={isEdit ? "Edit" : "Add"}
      postUrl="/api/ExecManageRetentionTags"
      resetForm={false}
      relatedQueryKeys={[
        `RetentionTags-${userSettingsDefaults.currentTenant}`,
        `RetentionTags-ForManagement${userSettingsDefaults.currentTenant}`,
        `RetentionTag-${name}-${userSettingsDefaults.currentTenant}`
      ]}
      customDataformatter={(values) => {
        const tagData = {
          Name: values.Name,
          Comment: values.Comment,
          RetentionEnabled: values.RetentionEnabled,
        };

        // Extract .value from select objects and only include non-empty optional fields
        if (values.RetentionAction) {
          tagData.RetentionAction = typeof values.RetentionAction === 'string' 
            ? values.RetentionAction 
            : values.RetentionAction.value;
        }
        if (values.AgeLimitForRetention) {
          tagData.AgeLimitForRetention = parseInt(values.AgeLimitForRetention);
        }
        if (values.LocalizedComment) {
          tagData.LocalizedComment = values.LocalizedComment;
        }
        if (values.LocalizedRetentionPolicyTagName) {
          tagData.LocalizedRetentionPolicyTagName = values.LocalizedRetentionPolicyTagName;
        }

        if (isEdit) {
          return {
            ModifyTags: [{
              Identity: name,
              ...tagData,
            }],
            tenantFilter: values.tenantFilter,
          };
        } else {
          return {
            CreateTags: [{
              Type: typeof values.Type === 'string' ? values.Type : values.Type.value,
              ...tagData,
            }],
            tenantFilter: values.tenantFilter,
          };
        }
      }}
    >
      {existingTagRequest.isLoading && isEdit && <CippFormSkeleton layout={[2, 2, 1, 2, 2, 2]} />}
      {(!isEdit || !existingTagRequest.isLoading) && (
        <Grid container spacing={2}>
          {/* Tag Name */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Tag Name *"
              name="Name"
              formControl={formControl}
              validators={{ required: "Tag name is required" }}
            />
          </Grid>
          
          {/* Tag Type */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="select"
              label="Tag Type *"
              name="Type"
              creatable={false}
              options={tagTypes}
              formControl={formControl}
              validators={{ required: "Tag type is required" }}
              disabled={isEdit}
              helperText={isEdit ? "Tag type cannot be changed when editing" : ""}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Retention Action */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="select"
              label="Retention Action"
              name="RetentionAction"
              creatable={false}
              options={retentionActions}
              formControl={formControl}
              helperText="Action to take when retention limit is reached"
            />
          </Grid>

          {/* Age Limit */}
          <Grid size={{ md: 3, xs: 12 }}>
            <CippFormComponent
              type="number"
              label="Age Limit (Days)"
              name="AgeLimitForRetention"
              formControl={formControl}
              helperText="Days before retention action is applied"
            />
          </Grid>

          {/* Retention Enabled */}
          <Grid size={{ md: 3, xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Retention Enabled"
              name="RetentionEnabled"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Comment */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Comment"
              name="Comment"
              multiline
              rows={3}
              formControl={formControl}
            />
          </Grid>

          {/* Localized Fields */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Localized Tag Name"
              name="LocalizedRetentionPolicyTagName"
              formControl={formControl}
              helperText="Localized display name for the tag"
            />
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Localized Comment"
              name="LocalizedComment"
              formControl={formControl}
              helperText="Localized comment for the tag"
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

        </Grid>
      )}
    </CippFormPage>
  );
};

RetentionTag.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default RetentionTag;