import React from "react";
import Grid from "@mui/material/Grid";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Typography } from "@mui/material";
import { CippInfoCard } from "/src/components/CippCards/CippInfoCard";
import { CippFormInputArray } from "/src/components/CippComponents/CippFormInputArray";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export const SafeLinksPolicyForm = ({ formControl, formType = "add" }) => {
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
        <CippFormInputArray
          formControl={formControl}
          name="DoNotRewriteUrls"
          label="Do Not Rewrite URLs"
          validators={{ 
            pattern: {
              value: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid domain"
            }
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