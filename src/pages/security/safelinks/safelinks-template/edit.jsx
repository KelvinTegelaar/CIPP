import { Box, Alert } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect } from "react";
import { SafeLinksForm, safeLinksDataUtils } from "../../../../components/CippFormPages/CippSafeLinksPolicyRuleForm";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../api/ApiCall";

const Page = () => {
  const router = useRouter();
  const { ID } = router.query;
  const userSettingsDefaults = useSettings();

  // Main form for policy configuration
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  // Watch policy name to pass to rule form
  const watchPolicyName = useWatch({ control: formControl.control, name: "PolicyName" });

  // Get existing template data
  const templateData = ApiGetCall({
    url: `/api/ListSafeLinksPolicyTemplateDetails?ID=${ID}`,
    queryKey: `SafeLinksTemplate-${ID}`,
    waiting: !!ID,
  });

  // Populate forms with existing data when available
  useEffect(() => {
    if (templateData.isSuccess && templateData.data?.Results) {
      const template = templateData.data.Results;

      // Use utility to populate form
      safeLinksDataUtils.populateFormData(formControl, template, userSettingsDefaults, 'template');
    }
  }, [templateData.isSuccess, templateData.data, ID, formControl, userSettingsDefaults]);

  // Use the utility to create the data formatter
  const customDataFormatter = safeLinksDataUtils.createDataFormatter(formControl, 'template', { ID });

  return (
    <>
      <CippFormPage
        title={
          templateData.data?.Results?.name || ID
            ? `Safe Links Template: ${templateData.data?.Results?.name || ID}`
            : "Safe Links Template"
        }
        backButtonTitle="Safe Links Templates Overview"
        formPageType="Edit"
        formControl={formControl}
        customDataformatter={customDataFormatter}
        postUrl="/api/EditSafeLinksPolicyTemplate"
        queryKey={`SafeLinksTemplate-${ID}`}
        isLoading={templateData.isFetching}
        allowResubmit={true}
        hideSubmit={!ID}
      >
        {!ID && (
          <Alert severity="info" sx={{ m: 2 }}>
            No template selected. Open this page from the Safe Links Templates list to edit a
            template.
          </Alert>
        )}
        {ID && (
          <Box sx={{ my: 2 }}>
            <Box sx={{ mb: 4 }}>
              <SafeLinksForm
                formControl={formControl}
                PolicyName={watchPolicyName}
                formType="template"
              />
            </Box>
          </Box>
        )}
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;