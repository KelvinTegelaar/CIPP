import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { useSettings } from "/src/hooks/use-settings";
import { Grid } from "@mui/system";
import { Divider } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "/src/api/ApiCall";

const RetentionPolicy = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { name } = router.query;
  const isEdit = !!name;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      Name: "",
      RetentionPolicyTagLinks: [],
    },
  });

  // Get existing policy data if editing
  const existingPolicyRequest = ApiGetCall({
    url: `/api/ExecManageRetentionPolicies?tenantFilter=${userSettingsDefaults.currentTenant}${isEdit ? `&name=${encodeURIComponent(name)}` : ''}`,
    queryKey: `RetentionPolicy-${name}-${userSettingsDefaults.currentTenant}`,
    waiting: isEdit,
  });

  // Get available retention tags
  const retentionTagsRequest = ApiGetCall({
    url: `/api/ExecManageRetentionTags?tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `RetentionTags-ForManagement${userSettingsDefaults.currentTenant}`,
  });

  const availableTags = useMemo(() => {
    if (!retentionTagsRequest.isSuccess || !retentionTagsRequest.data) {
      return [];
    }
      
    return retentionTagsRequest.data.map(tag => ({
      label: `${tag.Name} (${tag.Type})`,
      value: tag.Name,
    }));
  }, [retentionTagsRequest.isSuccess, retentionTagsRequest.data]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && existingPolicyRequest.isSuccess && existingPolicyRequest.data && availableTags.length > 0) {
      const policy = existingPolicyRequest.data;
      
      // Map tag names to tag objects for the form
      const selectedTags = policy.RetentionPolicyTagLinks.map(tagName => 
        availableTags.find(tag => tag.value === tagName)
      ).filter(Boolean);

      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        Name: policy.Name,
        RetentionPolicyTagLinks: selectedTags,
      });
    }
  }, [
    isEdit, 
    existingPolicyRequest.isSuccess, 
    existingPolicyRequest.data, 
    availableTags,
    userSettingsDefaults.currentTenant,
    formControl
  ]);

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={isEdit ? `RetentionPolicy-${name}` : "AddRetentionPolicy"}
      title={isEdit ? `Edit Retention Policy: ${name}` : "Add Retention Policy"}
      backButtonTitle="Retention Policies"
      formPageType={isEdit ? "Edit" : "Add"}
      postUrl="/api/ExecManageRetentionPolicies"
      resetForm={false}
      customDataformatter={(values) => {
        // Extract tag names from the selected tag objects
        const tagNames = values.RetentionPolicyTagLinks?.map(tag => 
          typeof tag === 'string' ? tag : tag.value
        ) || [];

        if (isEdit) {
          return {
            ModifyPolicies: [{
              Identity: name,
              Name: values.Name,
              RetentionPolicyTagLinks: tagNames,
            }],
            tenantFilter: values.tenantFilter,
          };
        } else {
          return {
            CreatePolicies: [{
              Name: values.Name,
              RetentionPolicyTagLinks: tagNames,
            }],
            tenantFilter: values.tenantFilter,
          };
        }
      }}
    >
      {((existingPolicyRequest.isLoading && isEdit) || retentionTagsRequest.isLoading) && (
        <CippFormSkeleton layout={[2, 2, 1]} />
      )}
      {(!isEdit || !existingPolicyRequest.isLoading) && !retentionTagsRequest.isLoading && (
        <Grid container spacing={2}>
          {/* Policy Name */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Policy Name"
              name="Name"
              formControl={formControl}
              validators={{ required: "Policy name is required" }}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Retention Tags */}
          <Grid size={{ md: 12, xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Retention Tags"
              name="RetentionPolicyTagLinks"
              multiple={true}
              creatable={false}
              options={availableTags}
              formControl={formControl}
              helperText="Select the retention tags to include in this policy"
            />
          </Grid>
        </Grid>
      )}
    </CippFormPage>
  );
};

RetentionPolicy.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default RetentionPolicy;