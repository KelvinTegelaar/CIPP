import { Box } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { SafeLinksPolicyForm } from "/src/components/CippFormPages/CippSafeLinksPolicyForm";
import { SafeLinksRuleForm } from "/src/components/CippFormPages/CippSafeLinksRuleForm";

const Page = () => {
  const userSettingsDefaults = useSettings();
  
  // Main form for policy configuration
  const formControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      EnableSafeLinksForEmail: true,
      TrackClicks: true,
      ScanUrls: true,
      DeliverMessageAfterScan: false,
      EnableSafeLinksForTeams: false,
      EnableSafeLinksForOffice: false
    },
  });

  // Secondary form for rule configuration
  const ruleFormControl = useForm({
    mode: "onBlur",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
      Enabled: true,
      Priority: 0
    },
  });

  // Watch policy name to pass to rule form
  const watchPolicyName = useWatch({ control: formControl.control, name: "Name" });
  
  // Custom data formatter to combine both forms' data
  const customDataFormatter = (values) => {
    // Get rule values
    const ruleValues = ruleFormControl.getValues();
    
    // Process arrays for string inputs
    const formatStringToArray = (value) => {
      if (!value || value === '') return [];
      if (typeof value === 'string') {
        return value.split(',').map(item => item.trim()).filter(item => item !== '');
      }
      return value;
    };

    // Process domain fields - handle both string and object values
    const processDomainField = (field) => {
      if (!field) return [];
      
      if (typeof field === 'string') {
        // Handle comma-separated string
        return formatStringToArray(field);
      } else if (Array.isArray(field)) {
        // If already an array of strings, return it
        if (field.length > 0 && typeof field[0] === 'string') {
          return field;
        }
        // If an array of objects from the domain selector, extract the ids
        return field.map(item => item.id || item);
      }
      return [];
    };

    // Process group fields if they're returned as objects
    const processGroupField = (field) => {
      if (Array.isArray(field)) {
        // If the field is already an array of IDs, return it
        if (field.length > 0 && typeof field[0] === 'string') {
          return field;
        }
        // If the field is an array of objects, extract the IDs
        return field.map(item => item.id || item);
      }
      return [];
    };

    // Combined data object
    return {
      // Common fields
      Name: values.Name,
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
      DoNotRewriteUrls: Array.isArray(values.DoNotRewriteUrls) ? values.DoNotRewriteUrls : [],
      AdminDisplayName: values.AdminDisplayName,
      CustomNotificationText: values.CustomNotificationText,
      EnableOrganizationBranding: values.EnableOrganizationBranding,
      
      // Rule fields
      RuleName: ruleValues.Name, // Include the auto-generated rule name
      Priority: ruleValues.Priority,
      Comments: ruleValues.Comments,
      Enabled: ruleValues.Enabled,
      
      // Process user, group and domain fields
      SentTo: ruleValues.SentTo,
      ExceptIfSentTo: ruleValues.ExceptIfSentTo,
      SentToMemberOf: processGroupField(ruleValues.SentToMemberOf),
      ExceptIfSentToMemberOf: processGroupField(ruleValues.ExceptIfSentToMemberOf),
      RecipientDomainIs: processDomainField(ruleValues.RecipientDomainIs),
      ExceptIfRecipientDomainIs: processDomainField(ruleValues.ExceptIfRecipientDomainIs),
    };
  };

  return (
    <>
      <CippFormPage
        title="Safe Links"
        backButtonTitle="Safe Links Overview"
        formPageType="Add"
        formControl={formControl}
        customDataformatter={customDataFormatter}
        postUrl="/api/ExecNewSafeLinkspolicy"
        queryKey={`SafeLinks-${userSettingsDefaults.currentTenant}`}
      >
        <Box sx={{ my: 2 }}>
          <Box sx={{ mb: 4 }}>
            <SafeLinksPolicyForm
              formControl={formControl}
              formType="add" 
            />
          </Box>
          <Box>
            <SafeLinksRuleForm 
              formControl={ruleFormControl}
              PolicyName={watchPolicyName} 
              formType="add" 
            />
          </Box>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;