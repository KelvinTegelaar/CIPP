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
    waiting: !!PolicyName,
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
        title={PolicyName ? `Safe Links Policy: ${PolicyName}` : "Safe Links Policy"}
        backButtonTitle="Safe Links Overview"
        formPageType="Edit"
        formControl={formControl}
        customDataformatter={customDataFormatter}
        postUrl="/api/EditSafeLinkspolicy"
        queryKey={`SafeLinks-${userSettingsDefaults.currentTenant}-${PolicyName}`}
        isLoading={policyData.isFetching}
        allowResubmit={true}
        hideSubmit={!PolicyName}
      >
        {!PolicyName && (
          <Alert severity="info" sx={{ m: 2 }}>
            No policy selected. Open this page from the Safe Links Overview list to edit a policy.
          </Alert>
        )}
        {PolicyName && (
          <Box sx={{ my: 2 }}>
            <Box sx={{ mb: 4 }}>
              <SafeLinksForm
                formControl={formControl}
                PolicyName={watchPolicyName}
                formType="edit"
              />
            </Box>
          </Box>
        )}
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;