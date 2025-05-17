import { useEffect, useState } from "react";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Typography } from "@mui/material";
import { CippInfoCard } from "/src/components/CippCards/CippInfoCard";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { getCippValidator } from "/src/utils/get-cipp-validator";

export const SafeLinksPolicyForm = ({ formControl, formType = "add" }) => {
  const { watch, setError, clearErrors } = formControl;
  const doNotRewriteUrls = watch("DoNotRewriteUrls");
  const [isUrlsValid, setIsUrlsValid] = useState(true);
  
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

  // Validate URLs in useEffect and update the validation state
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

  return (
    <Grid container spacing={2}>
      <Grid item size={{ xs: 12 }}>
        <Typography variant="h6">Policy Settings</Typography>
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Policy Name"
          name="PolicyName"
          required={true}
          formControl={formControl}
          disabled={formType === "edit"}
          validators={{ required: "Policy name is required" }}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Description"
          name="AdminDisplayName"
          formControl={formControl}
        />
      </Grid>
      <Grid item size={{ xs: 12 }}>
        <CippFormComponent
          type="textField" 
          fullWidth
          label="Custom Notification Text"
          name="CustomNotificationText"
          formControl={formControl}
          multiline
          rows={2}
        />
      </Grid>

      <Grid item size={{ xs: 12 }}>
        <Typography variant="h6">Safe Links Features</Typography>
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Email"
          name="EnableSafeLinksForEmail"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Teams"
          name="EnableSafeLinksForTeams"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Office"
          name="EnableSafeLinksForOffice"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Track Clicks"
          name="TrackClicks"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Scan URLs"
          name="ScanUrls"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Enable For Internal Senders"
          name="EnableForInternalSenders"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Deliver Message After Scan"
          name="DeliverMessageAfterScan"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Allow Click Through"
          name="AllowClickThrough"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Disable URL Rewrite"
          name="DisableUrlRewrite"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <CippFormComponent
          type="switch"
          label="Enable Organization Branding"
          name="EnableOrganizationBranding"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item size={{ xs: 12 }}>
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

      {formType === "edit" && (
        <Grid item size={{ xs: 12 }}>
          <CippInfoCard 
            icon={<InformationCircleIcon />}
            label="Propagation Time"
            value="Changes to Safe Links policies may take up to 6 hours to propagate throughout your organization."
            isFetching={false}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default SafeLinksPolicyForm;
