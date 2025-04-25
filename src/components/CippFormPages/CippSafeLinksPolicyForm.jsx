import React from "react";
import Grid from "@mui/material/Grid";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Typography } from "@mui/material";
import { CippInfoCard } from "/src/components/CippCards/CippInfoCard";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import CippUrlChipInput from "/src/components/CippComponents/CippUrlChipInput";

export const SafeLinksPolicyForm = ({ formControl, formType = "add" }) => {
  const wildcardAndUrlPattern = /^(\*\.)?([\da-z]([a-z\d-]*[a-z\d])?\.)+([\da-z]{2,})(\/\*|\/[\w.-]*\*?)?$|^(https?:\/\/)?([\da-z]([a-z\d-]*[a-z\d])?\.)+([\da-z]{2,})(\/[\w.-]*)*\/?$/i;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Policy Settings</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Policy Name"
          name="Name"
          required={true}
          formControl={formControl}
          disabled={formType === "edit"}
          validators={{ required: "Policy name is required" }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="textField"
          fullWidth
          label="Description"
          name="AdminDisplayName"
          formControl={formControl}
        />
      </Grid>
      <Grid item xs={12}>
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

      <Grid item xs={12}>
        <Typography variant="h6">Safe Links Features</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Email"
          name="EnableSafeLinksForEmail"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Teams"
          name="EnableSafeLinksForTeams"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable Safe Links For Office"
          name="EnableSafeLinksForOffice"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Track Clicks"
          name="TrackClicks"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Scan URLs"
          name="ScanUrls"
          formControl={formControl}
          defaultValue={true}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable For Internal Senders"
          name="EnableForInternalSenders"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Deliver Message After Scan"
          name="DeliverMessageAfterScan"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Allow Click Through"
          name="AllowClickThrough"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Disable URL Rewrite"
          name="DisableUrlRewrite"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CippFormComponent
          type="switch"
          label="Enable Organization Branding"
          name="EnableOrganizationBranding"
          formControl={formControl}
          defaultValue={false}
        />
      </Grid>
      <Grid item xs={12}>
        <CippUrlChipInput
          formControl={formControl}
          name="DoNotRewriteUrls"
          label="Do Not Rewrite URLs"
          placeholder="Enter domain patterns (one per line for multiple entries)"
          tooltip="You can use wildcard patterns (*.example.com/*) or standard URLs (https://example.com)"
          helperText="Paste multiple entries or add them one by one"
          validators={{ 
            validate: {
              validEntries: (value) => {
                if (!value || value.length === 0) return true;
                return value.every(url => wildcardAndUrlPattern.test(url)) || 
                  "Please enter valid domain patterns or URLs";
              }
            }
          }}
          options={{
            enableValidation: true,
            validationPattern: wildcardAndUrlPattern,
            validationErrorMessage: "Please enter a valid domain pattern or URL",
            addHttps: false,
            preventDuplicates: true,
            allowBatchInput: true,
            chipColor: "primary",
            chipVariant: "outlined",
            chipSize: "medium"
          }}
        />
      </Grid>

      {formType === "edit" && (
        <Grid item xs={12}>
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