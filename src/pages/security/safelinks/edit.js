import React from "react";
import { Box } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import { useEffect } from "react";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import { Policy, CalendarToday } from "@mui/icons-material";
import { CippCopyToClipBoard } from "/src/components/CippComponents/CippCopyToClipboard";
import { CippTimeAgo } from "/src/components/CippComponents/CippTimeAgo";
import { SafeLinksPolicyForm } from "/src/components/CippFormPages/CippSafeLinksPolicyForm";
import { SafeLinksRuleForm } from "/src/components/CippFormPages/CippSafeLinksRuleForm";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { RuleName } = router.query;
  const { PolicyName } = router.query;

  const policyRequest = ApiGetCall({
    url: `/api/ListSafeLinksPolicyDetails?RuleName=${RuleName}&PolicyName=${PolicyName}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListSafeLinksPolicyDetails-${RuleName}-${PolicyName}`,
  });

  // Main form for policy configuration
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  // Secondary form for rule configuration
  const ruleFormControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  // Watch policy name to sync with rule form
  const watchPolicyName = useWatch({ control: formControl.control, name: "Name" });
  
  useEffect(() => {
    if (watchPolicyName) {
      ruleFormControl.setValue("SafeLinksPolicy", watchPolicyName);
    }
  }, [watchPolicyName, ruleFormControl]);

  useEffect(() => {
    if (policyRequest.isSuccess) {
      const policyData = policyRequest.data?.Results;
      
      if (policyData && policyData.Policy && policyData.Rule) {
        // Set policy form values
        const policyFormValues = {
          ...policyData.Policy,
          Name: policyData.PolicyName,
          tenantFilter: userSettingsDefaults.currentTenant,
          // Format DoNotRewriteUrls properly
          DoNotRewriteUrls: Array.isArray(policyData.Policy.DoNotRewriteUrls) 
            ? policyData.Policy.DoNotRewriteUrls.join(',') 
            : policyData.Policy.DoNotRewriteUrls
        };
        
        // Set rule form values
        const ruleFormValues = {
          ...policyData.Rule,
          Name: policyData.RuleName,
          SafeLinksPolicy: policyData.PolicyName,
          tenantFilter: userSettingsDefaults.currentTenant,
          // Format any arrays properly
          RecipientDomainIs: Array.isArray(policyData.Rule.RecipientDomainIs)
            ? policyData.Rule.RecipientDomainIs
            : [],
          ExceptIfRecipientDomainIs: Array.isArray(policyData.Rule.ExceptIfRecipientDomainIs)
            ? policyData.Rule.ExceptIfRecipientDomainIs
            : [],
          SentTo: policyData.Rule.SentTo || [],
          ExceptIfSentTo: policyData.Rule.ExceptIfSentTo || [],
          SentToMemberOf: policyData.Rule.SentToMemberOf || [],
          ExceptIfSentToMemberOf: policyData.Rule.ExceptIfSentToMemberOf || []
        };
        
        formControl.reset(policyFormValues);
        ruleFormControl.reset(ruleFormValues);
      }
    }
  }, [policyRequest.isSuccess, policyRequest.data, policyRequest.isLoading]);

  // Custom data formatter to combine both forms' data
  const customDataFormatter = (values) => {
    // Format DoNotRewriteUrls if provided
    if (values.DoNotRewriteUrls && typeof values.DoNotRewriteUrls === 'string') {
      values.DoNotRewriteUrls = values.DoNotRewriteUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
    }
  
    // Get rule values and validate
    const ruleValues = ruleFormControl.getValues();
    
    // Process arrays for string inputs
    const formatStringToArray = (value) => {
      if (!value || value === '') return [];
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item !== '');
      }
      return value;
    };
  
    // Process domain fields
    if (ruleValues.RecipientDomainIs) {
      ruleValues.RecipientDomainIs = formatStringToArray(ruleValues.RecipientDomainIs);
    }
    
    if (ruleValues.ExceptIfRecipientDomainIs) {
      ruleValues.ExceptIfRecipientDomainIs = formatStringToArray(ruleValues.ExceptIfRecipientDomainIs);
    }
  
    // Combined data object
    return {
      // Common fields
      Name: values.Name,
      tenantFilter: values.tenantFilter,
      
      // Original rule and policy names for reference
      PolicyName: PolicyName,
      RuleName: RuleName,
      
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
      DoNotRewriteUrls: Array.isArray(values.DoNotRewriteUrls) ? values.DoNotRewriteUrls : [],
      AdminDisplayName: values.AdminDisplayName,
      CustomNotificationText: values.CustomNotificationText,
      EnableOrganizationBranding: values.EnableOrganizationBranding,
      
      // Rule fields
      Priority: ruleValues.Priority,
      Comments: ruleValues.Comments,
      Enabled: ruleValues.Enabled,
      
      // These fields from the user selector will already have the correct userPrincipalName values
      SentTo: ruleValues.SentTo,
      ExceptIfSentTo: ruleValues.ExceptIfSentTo,
      
      // These fields require specific handling based on the component
      SentToMemberOf: ruleValues.SentToMemberOf,
      ExceptIfSentToMemberOf: ruleValues.ExceptIfSentToMemberOf,
      
      // Domain fields are now properly formatted
      RecipientDomainIs: ruleValues.RecipientDomainIs,
      ExceptIfRecipientDomainIs: ruleValues.ExceptIfRecipientDomainIs
    };
  };

  // Set the title for the page
  const title = policyRequest.isSuccess 
    ? `Edit Safe Links Policy: ${policyRequest.data?.Results?.PolicyName}` 
    : "Edit Safe Links Policy";

  // Generate subtitle content
  const getSubtitle = () => {
    if (!policyRequest.isSuccess) return null;
    
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <Policy fontSize="small" style={{ marginRight: '0.5rem' }} />
          <span>Rule Name:</span> 
          <CippCopyToClipBoard type="chip" text={policyRequest.data?.Results?.RuleName} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarToday fontSize="small" style={{ marginRight: '0.5rem' }} />
          <span>Last Modified:</span> 
          <CippTimeAgo data={policyRequest.data?.Results?.Policy?.WhenChanged || policyRequest.data?.Results?.Rule?.WhenChanged} />
        </div>
      </>
    );
  };

  return (
    <CippFormPage
      queryKey={[`ListSafeLinksPolicyDetails-${RuleName}-${PolicyName}`]}
      formControl={formControl}
      title={title}
      subtitle={getSubtitle()}
      isFetching={policyRequest.isLoading}
      formPageType="Edit"
      postUrl="/api/EditSafeLinksPolicy"
      customDataformatter={customDataFormatter}
    >
      {policyRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 1, 1, 1, 2, 2, 2, 2, 3]} />}
      {policyRequest.isSuccess && (
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
              policyName={watchPolicyName} 
              formType="edit" 
            />
          </Box>
        </Box>
      )}
    </CippFormPage>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;