import { Box } from "@mui/material";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "../../../../hooks/use-settings";
import { SafeLinksForm, safeLinksDataUtils } from "../../../../components/CippFormPages/CippSafeLinksPolicyRuleForm";

const Page = () => {
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

  // Use the utility to create the data formatter
  const customDataFormatter = safeLinksDataUtils.createDataFormatter(formControl, 'createTemplate');

  return (
    <>
      <CippFormPage
        title="Create Safe Links Template"
        backButtonTitle="Safe Links Templates Overview"
        formPageType="Add"
        formControl={formControl}
        customDataformatter={customDataFormatter}
        postUrl="/api/CreateSafeLinksPolicyTemplate"
        queryKey={`SafeLinksTemplates-${userSettingsDefaults.currentTenant}`}
      >
        <Box sx={{ my: 2 }}>
          <Box sx={{ mb: 4 }}>
            <SafeLinksForm
              formControl={formControl}
              PolicyName={watchPolicyName}
              formType="createTemplate" 
            />
          </Box>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;