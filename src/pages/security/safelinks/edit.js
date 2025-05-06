import { Box } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { useEffect, useState } from "react";
import { SafeLinksPolicyForm } from "/src/components/CippFormPages/CippSafeLinksPolicyForm";
import { SafeLinksRuleForm } from "/src/components/CippFormPages/CippSafeLinksRuleForm";
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

  // Secondary form for rule configuration
  const ruleFormControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      RuleName: RuleName,
      SafeLinksPolicy: PolicyName,
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
      
      // Reset policy form with existing data
      formControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        PolicyName: policy.PolicyName || PolicyName,
        EnableSafeLinksForEmail: policy.EnableSafeLinksForEmail,
        EnableSafeLinksForTeams: policy.EnableSafeLinksForTeams,
        EnableSafeLinksForOffice: policy.EnableSafeLinksForOffice,
        TrackClicks: policy.TrackClicks,
        AllowClickThrough: policy.AllowClickThrough,
        ScanUrls: policy.ScanUrls,
        EnableForInternalSenders: policy.EnableForInternalSenders,
        DeliverMessageAfterScan: policy.DeliverMessageAfterScan,
        DisableUrlRewrite: policy.DisableUrlRewrite,
        DoNotRewriteUrls: policy.DoNotRewriteUrls,
        AdminDisplayName: policy.AdminDisplayName,
        CustomNotificationText: policy.CustomNotificationText,
        EnableOrganizationBranding: policy.EnableOrganizationBranding,
      });
      
      // Reset rule form with existing data
      ruleFormControl.reset({
        tenantFilter: userSettingsDefaults.currentTenant,
        RuleName: rule.RuleName || RuleName,
        SafeLinksPolicy: policy.PolicyName || PolicyName,
        Priority: rule.Priority,
        Comments: rule.Comments,
        Enabled: rule.State === "Enabled",
        SentTo: rule.SentTo,
        ExceptIfSentTo: rule.ExceptIfSentTo,
        SentToMemberOf: rule.SentToMemberOf,
        ExceptIfSentToMemberOf: rule.ExceptIfSentToMemberOf,
        RecipientDomainIs: rule.RecipientDomainIs,
        ExceptIfRecipientDomainIs: rule.ExceptIfRecipientDomainIs,
      });
    }
  }, [policyData.isSuccess, policyData.data, PolicyName, RuleName, formControl, ruleFormControl, userSettingsDefaults.currentTenant]);

  // Custom data formatter to combine both forms' data
  const customDataFormatter = (values) => {
    // Get rule values from the second form
    const ruleValues = ruleFormControl.getValues();
    
    // Return combined data from both forms
    return {
      // Common fields
      PolicyName: values.PolicyName,
      tenantFilter: values.tenantFilter,
      
      // Policy fields
      EnableSafeLinksForEmail: values.EnableSafeLinksForEmail,
      EnableSafeLinksForTeams: values.EnableSafeLinksForTeams,
      EnableSafeLinksForOffice: values.EnableSafeLinksForOffice,
      TrackClicks: values.TrackClicks,
      AllowClickThrough: values.AllowClickThrough,
      ScanUrls: values.ScanUrls,
      EnableForInternalSenders: values.EnableForInternalSenders,
      DeliverMessageAfterScan: values.DeliverMessageAfterScan,
      DisableUrlRewrite: values.DisableUrlRewrite,
      DoNotRewriteUrls: values.DoNotRewriteUrls,
      AdminDisplayName: values.AdminDisplayName,
      CustomNotificationText: values.CustomNotificationText,
      EnableOrganizationBranding: values.EnableOrganizationBranding,
      
      // Rule fields
      RuleName: ruleValues.RuleName,
      Priority: ruleValues.Priority,
      Comments: ruleValues.Comments,
      Enabled: ruleValues.Enabled,
      SentTo: ruleValues.SentTo,
      ExceptIfSentTo: ruleValues.ExceptIfSentTo,
      SentToMemberOf: ruleValues.SentToMemberOf,
      ExceptIfSentToMemberOf: ruleValues.ExceptIfSentToMemberOf,
      RecipientDomainIs: ruleValues.RecipientDomainIs,
      ExceptIfRecipientDomainIs: ruleValues.ExceptIfRecipientDomainIs,
    };
  };

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
            <SafeLinksPolicyForm
              formControl={formControl}
              formType="edit" 
            />
          </Box>
          <Box>
            <SafeLinksRuleForm 
              formControl={ruleFormControl}
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