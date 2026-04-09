import { useEffect, useState } from "react";
import { Grid } from "@mui/system";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { Typography } from "@mui/material";
import { CippFormUserSelector } from "../CippComponents/CippFormUserSelector";
import { CippFormGroupSelector } from "../CippComponents/CippFormGroupSelector";
import { CippFormDomainSelector } from "../CippComponents/CippFormDomainSelector";
import { CippInfoCard } from "../CippCards/CippInfoCard";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { getCippValidator } from "../../utils/get-cipp-validator";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";

// Utility functions for data processing
export const safeLinksDataUtils = {
  // Process arrays for string inputs
  formatStringToArray: (value) => {
    if (!value || value === '') return [];
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    return value;
  },

  // Process domain fields - handle both string and object values
  processDomainField: (field) => {
    if (!field) return [];

    if (typeof field === 'string') {
      // Handle comma-separated string
      return safeLinksDataUtils.formatStringToArray(field);
    } else if (Array.isArray(field)) {
      // If already an array of strings, return it
      if (field.length > 0 && typeof field[0] === 'string') {
        return field;
      }
      // If an array of objects from the domain selector, extract the ids
      return field.map(item => item.id || item);
    }
    return [];
  },

  // Process group fields if they're returned as objects
  processGroupField: (field) => {
    if (Array.isArray(field)) {
      // If the field is already an array of IDs, return it
      if (field.length > 0 && typeof field[0] === 'string') {
        return field;
      }
      // If the field is an array of objects, extract the IDs
      return field.map(item => item.id || item);
    }
    return [];
  },

  // Create custom data formatter for different form types
  createDataFormatter: (formControl, formType = 'add', additionalFields = {}) => {
    return (values) => {
      const ruleValues = formControl.getValues();

      // Base data structure
      const baseData = {
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
        DoNotRewriteUrls: Array.isArray(values.DoNotRewriteUrls) ? values.DoNotRewriteUrls : [],
        AdminDisplayName: values.AdminDisplayName,
        CustomNotificationText: values.CustomNotificationText,
        EnableOrganizationBranding: values.EnableOrganizationBranding,

        // Rule fields
        RuleName: ruleValues.RuleName,
        Priority: ruleValues.Priority,
        Comments: ruleValues.Comments,

        // Process user, group and domain fields
        SentTo: ruleValues.SentTo,
        ExceptIfSentTo: ruleValues.ExceptIfSentTo,
        SentToMemberOf: safeLinksDataUtils.processGroupField(ruleValues.SentToMemberOf),
        ExceptIfSentToMemberOf: safeLinksDataUtils.processGroupField(ruleValues.ExceptIfSentToMemberOf),
        RecipientDomainIs: safeLinksDataUtils.processDomainField(ruleValues.RecipientDomainIs),
        ExceptIfRecipientDomainIs: safeLinksDataUtils.processDomainField(ruleValues.ExceptIfRecipientDomainIs),
      };

      // Add form-specific fields
      switch (formType) {
        case 'add':
          return {
            ...baseData,
            State: ruleValues.State,
          };
        
        case 'edit':
          return {
            ...baseData,
            State: ruleValues.State,
          };
        
        case 'template':
          return {
            ...baseData,
            ID: additionalFields.ID,
            TemplateName: values.TemplateName,
            TemplateDescription: values.TemplateDescription,
            State: ruleValues.State ? "Enabled" : "Disabled",
          };
        
        case 'createTemplate':
          return {
            ...baseData,
            TemplateName: values.TemplateName,
            TemplateDescription: values.TemplateDescription,
            // If no policy description provided, use template description as fallback
            AdminDisplayName: values.AdminDisplayName || values.Description,
            State: ruleValues.State,
          };
        
        default:
          return baseData;
      }
    };
  },

  // Helper to populate form with existing data
  populateFormData: (formControl, data, userSettingsDefaults, formType = 'edit' ) => {
    const baseData = {
      tenantFilter: userSettingsDefaults.currentTenant,
      PolicyName: data.PolicyName,
      EnableSafeLinksForEmail: data.EnableSafeLinksForEmail,
      EnableSafeLinksForTeams: data.EnableSafeLinksForTeams,
      EnableSafeLinksForOffice: data.EnableSafeLinksForOffice,
      TrackClicks: data.TrackClicks,
      AllowClickThrough: data.AllowClickThrough,
      ScanUrls: data.ScanUrls,
      EnableForInternalSenders: data.EnableForInternalSenders,
      DeliverMessageAfterScan: data.DeliverMessageAfterScan,
      DisableUrlRewrite: data.DisableUrlRewrite,
      DoNotRewriteUrls: data.DoNotRewriteUrls,
      AdminDisplayName: data.AdminDisplayName,
      CustomNotificationText: data.CustomNotificationText,
      EnableOrganizationBranding: data.EnableOrganizationBranding,
      RuleName: data.RuleName,
      Priority: data.Priority,
      Comments: data.Comments,
      State: data.State,
      SentTo: data.SentTo || [],
      ExceptIfSentTo: data.ExceptIfSentTo || [],
      SentToMemberOf: data.SentToMemberOf || [],
      ExceptIfSentToMemberOf: data.ExceptIfSentToMemberOf || [],
      RecipientDomainIs: data.RecipientDomainIs || [],
      ExceptIfRecipientDomainIs: data.ExceptIfRecipientDomainIs || [],
    };

    // Add template-specific fields
    if (formType === 'template') {
      baseData.TemplateName = data.TemplateName;
      baseData.TemplateDescription = data.TemplateDescription;
    }

    formControl.reset(baseData);
  },
};

export const SafeLinksForm = ({ formControl, formType = "add" }) => {
  const { watch, setError, clearErrors } = formControl;
  const doNotRewriteUrls = watch("DoNotRewriteUrls");
  const policyName = watch("PolicyName");
  const [isUrlsValid, setIsUrlsValid] = useState(true);
  const userSettingsDefaults = useSettings();

  // Fetch existing policies for name validation (only for add/createTemplate forms)
  const shouldFetchPolicies = formType === "add" || formType === "createTemplate";
  const existingPolicies = ApiGetCall({
    url: `/api/ListSafeLinksPolicy?tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `SafeLinksPolicy-List-${userSettingsDefaults.currentTenant}`,
    enabled: shouldFetchPolicies,
  });

  // Fetch existing templates for name validation (only for createTemplate forms)
  const shouldFetchTemplates = formType === "createTemplate";
  const existingTemplates = ApiGetCall({
    url: `/api/ListSafeLinksPolicyTemplates`,
    queryKey: `SafeLinksTemplates-List`,
    enabled: shouldFetchTemplates,
  });

  // Create validator for checking duplicate policy names
  const validatePolicyName = (value) => {
    if (!shouldFetchPolicies || !value) return true;
  
    // If still loading, allow validation to pass (it will re-validate when data loads)
    if (existingPolicies.isFetching) return true;
  
    // If API call failed, allow validation to pass (don't block user due to API issues)
    if (existingPolicies.error) return true;
  
    if (existingPolicies.isSuccess && existingPolicies.data) {
      const existingNames = existingPolicies.data.map(policy => policy.PolicyName?.toLowerCase()).filter(Boolean);
      if (existingNames.includes(value.toLowerCase())) {
        return "A policy with this name already exists";
      }
      
      const lowerValue = value.toLowerCase();
      if (lowerValue.startsWith("built-in protection policy") ||
          lowerValue.startsWith("standard preset security policy") ||
          lowerValue.startsWith("strict preset security policy")) {
        return "This name is reserved for built-in policies";
      }
    }
    return true;
  };

  // Create validator for checking duplicate template names
  const validateTemplateName = (value) => {
    if (!shouldFetchTemplates || !value) return true;
    
    // If still loading, allow validation to pass (it will re-validate when data loads)
    if (existingTemplates.isFetching) return true;
    
    // If API call failed, allow validation to pass (don't block user due to API issues)
    if (existingTemplates.error) return true;
    
    if (existingTemplates.isSuccess && existingTemplates.data) {
      const existingNames = existingTemplates.data.map(template => template.name?.toLowerCase()).filter(Boolean);
      if (existingNames.includes(value.toLowerCase())) {
        return "A template with this name already exists";
      }
    }
    return true;
  };

  // Helper function to validate a URL/domain entry
  const validateDoNotRewriteUrl = (entry) => {
    if (!entry) return true;

    // For entries with wildcards, use wildcard validators
    if (entry.includes('*') || entry.includes('~')) {
      const wildcardUrlResult = getCippValidator(entry, "wildcardUrl");
      const wildcardDomainResult = getCippValidator(entry, "wildcardDomain");

      if (wildcardUrlResult !== true && wildcardDomainResult !== true) {
        return false;
      }
      return true;
    }

    // For standard entries, check normal validators
    const hostnameResult = getCippValidator(entry, "hostname");
    const urlResult = getCippValidator(entry, "url");
    const domainResult = getCippValidator(entry, "domain");

    if (hostnameResult !== true && urlResult !== true && domainResult !== true) {
      return false;
    }

    return true;
  };

  // Re-validate policy name when existing policies data changes
  useEffect(() => {
    if (shouldFetchPolicies && (existingPolicies.isSuccess || existingPolicies.error)) {
      formControl.trigger('PolicyName');
    }
  }, [existingPolicies.isSuccess, existingPolicies.error, existingPolicies.data, shouldFetchPolicies, formControl]);

  // Re-validate template name when existing templates data changes
  useEffect(() => {
    if (shouldFetchTemplates && (existingTemplates.isSuccess || existingTemplates.error)) {
      formControl.trigger('TemplateName');
    }
  }, [existingTemplates.isSuccess, existingTemplates.error, existingTemplates.data, shouldFetchTemplates, formControl]);

  // Validate URLs in useEffect and update the validation Enabled
  useEffect(() => {
    if (!doNotRewriteUrls || doNotRewriteUrls.length === 0) {
      clearErrors("DoNotRewriteUrls");
      setIsUrlsValid(true);
      return;
    }

    let hasInvalidEntry = false;

    for (const item of doNotRewriteUrls) {
      const entry = typeof item === 'string' ? item : (item?.value || item?.label || '');
      if (!entry) continue;

      const isValid = validateDoNotRewriteUrl(entry);
      if (!isValid) {
        hasInvalidEntry = true;
        break;
      }
    }

    if (hasInvalidEntry) {
      setError("DoNotRewriteUrls", { 
        type: "validate", 
        message: "Not a valid URL, domain, or pattern" 
      });
      setIsUrlsValid(false);
    } else {
      clearErrors("DoNotRewriteUrls");
      setIsUrlsValid(true);
    }
  }, [doNotRewriteUrls, setError, clearErrors]);

  // Set the rule-related values whenever the policy name changes
  useEffect(() => {
    if (policyName) {
      // Always set SafeLinksPolicy to match the policy name
      formControl.setValue('SafeLinksPolicy', policyName);

      // Only auto-generate the rule name for new policies
      if (formType === "add" || formType === "createTemplate") {
        const ruleName = `${policyName}_Rule`;
        formControl.setValue('RuleName', ruleName);
      }
    }
  }, [policyName, formType, formControl]);

  // Show template-specific fields
  const showTemplateFields = formType === "template" || formType === "createTemplate";

  return (
    <Grid container spacing={2}>
      {/* Template Fields (if applicable) */}
      {showTemplateFields && (
        <>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Template Information</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Template Name"
              name="TemplateName"
              required={true}
              formControl={formControl}
              helperText={existingTemplates.isFetching && shouldFetchTemplates ? "Checking for duplicate names..." : undefined}
              validators={{ 
                required: "Template name is required",
                validate: {
                  duplicateName: validateTemplateName
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Template Description"
              name="TemplateDescription"
              formControl={formControl}
              helperText="Describe what this template is used for"
            />
          </Grid>
        </>
      )}

      {/* Policy Settings Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Safe Links Policy Configuration</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Policy Settings</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Policy Name"
          name="PolicyName"
          required={true}
          formControl={formControl}
          disabled={formType === "edit" || formType === "template"}
          validators={{ 
            required: "Policy name is required",
            validate: { validatePolicyName: validatePolicyName}
         }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Description"
          name="AdminDisplayName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Email"
          name="EnableSafeLinksForEmail"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Teams"
          name="EnableSafeLinksForTeams"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Office"
          name="EnableSafeLinksForOffice"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Track Clicks"
          name="TrackClicks"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Scan URLs"
          name="ScanUrls"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Enable For Internal Senders"
          name="EnableForInternalSenders"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Allow Click Through"
          name="AllowClickThrough"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Disable URL Rewrite"
          name="DisableUrlRewrite"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="switch"
          label="Enable Organization Branding"
          name="EnableOrganizationBranding"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }} sx={{ my: 2 }}>
        <CippFormComponent
          type="switch"
          label="Deliver Message After Scan"
          name="DeliverMessageAfterScan"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 9 }}>
        <CippFormComponent
          type="textField" 
          fullWidth
          label="Custom Notification Text"
          name="CustomNotificationText"
          formControl={formControl}
          multiline
          rows={2}
          disabled={!watch("DeliverMessageAfterScan")}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="autoComplete"
          createable={true}
          formControl={formControl}
          name="DoNotRewriteUrls"
          label="Do Not Rewrite URLs"
          placeholder="Enter domain patterns (one per line for multiple entries)"
          helperText="Enter URLs, domains, or wildcard patterns (e.g., *.example.com, https://example.com)"
          validators={{ 
            validate: {
              format: () => isUrlsValid || "Not a valid URL, domain, or pattern"
            }
          }}
        />
      </Grid>

      {/* Rule Settings Section */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Safe Links Rule Configuration</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Rule Information</Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          disabled={true}
          label="Rule Name (Auto-generated)"
          name="RuleName"
          formControl={formControl}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CippFormComponent
          type="number"
          fullWidth
          label="Priority"
          name="Priority"
          formControl={formControl}
          validators={{
            type: "number",
            min: {
              value: 0,
              message: "Priority must be a non-negative number"
            },
          }}
          helperText="Lower numbers have higher priority"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <CippFormComponent
          type="switch"
          label="Enable Rule"
          name="State"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Comments"
          name="Comments"
          formControl={formControl}
          multiline
          rows={2}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Applies To:</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormDomainSelector
          formControl={formControl}
          name="RecipientDomainIs"
          label="Domains"
          multiple={true}
          createable={false}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormGroupSelector
          formControl={formControl}
          name="SentToMemberOf"
          label="Groups"
          multiple={true}
          createable={false}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          formControl={formControl}
          name="SentTo"
          label="Recipients"
          valueField="userPrincipalName"
          multiple={true}
          createable={false}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Exceptions:</Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormDomainSelector
          formControl={formControl}
          name="ExceptIfRecipientDomainIs"
          label="Domains"
          multiple={true}
          createable={false}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormGroupSelector
          formControl={formControl}
          name="ExceptIfSentToMemberOf"
          label="Groups"
          multiple={true}
          createable={false}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CippFormUserSelector
          formControl={formControl}
          name="ExceptIfSentTo"
          label="Recipients"
          valueField="userPrincipalName"
          multiple={true}
          createable={false}
        />
      </Grid>

      {/* Information Cards */}
      <Grid size={{ xs:12 }}>
        <CippInfoCard 
          icon={<InformationCircleIcon />}
          label="Propagation Time"
          value="Changes to Safe Links policies and rules may take up to 6 hours to propagate throughout your organization."
          isFetching={false}
        />
      </Grid>
    </Grid>
  );
};

export default SafeLinksForm;