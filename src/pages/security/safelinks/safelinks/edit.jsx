import { Box } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { useEffect } from "react";
import { SafeLinksForm, safeLinksDataUtils } from "/src/components/CippFormPages/CippSafeLinksPolicyRuleForm";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";

const Page = () => {
  const router = useRouter();
  const { PolicyName, RuleName } = router.query;
  const userSettingsDefaults = useSettings();

  // Main form for policy configuration
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      PolicyName: PolicyName,
    },
  });

  // Watch policy name for rule synchronization
  const watchPolicyName = useWatch({ control: formControl.control, name: "PolicyName" });

  // Get existing policy and rule data
  const policyData = ApiGetCall({
    url: `/api/ListSafeLinksPolicyDetails?PolicyName=${PolicyName}&RuleName=${RuleName}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `SafeLinksPolicy-${PolicyName}`,
    enabled: !!PolicyName,
  });

  // Populate forms with existing data when available
  useEffect(() => {
    if (policyData.isSuccess && policyData.data?.Results) {
      const results = policyData.data.Results;
      const policy = results.Policy || {};
      const rule = results.Rule || {};

      // Combine policy and rule data
      const combinedData = {
        ...policy,
        ...rule,
        RuleName: rule.RuleName || RuleName,
        SafeLinksPolicy: policy.PolicyName || PolicyName,
        State: rule.State,
      };

      // Use utility to populate form
      safeLinksDataUtils.populateFormData(formControl, combinedData, userSettingsDefaults, 'edit');
    }
  }, [policyData.isSuccess, policyData.data, PolicyName, RuleName, formControl, userSettingsDefaults]);

  // Use the utility to create the data formatter
  const customDataFormatter = safeLinksDataUtils.createDataFormatter(formControl, 'edit');

  return (
    <>
      <CippFormPage
        title={`Edit Safe Links Policy: ${PolicyName}`}
        backButtonTitle="Safe Links Overview"
        formPageType="Edit"
        formControl={formControl}
        customDataformatter={customDataFormatter}
        postUrl="/api/EditSafeLinkspolicy"
        queryKey={`SafeLinks-${userSettingsDefaults.currentTenant}-${PolicyName}`}
        isLoading={policyData.isFetching}
        allowResubmit={true}
      >
        <Box sx={{ my: 2 }}>
          <Box sx={{ mb: 4 }}>
            <SafeLinksForm
              formControl={formControl}
              PolicyName={watchPolicyName} 
              formType="edit" 
            />
          </Box>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;