import { CippPropertyListCard } from "../../components/CippCards/CippPropertyListCard";
import CippFormComponent from "../../components/CippComponents/CippFormComponent";
import { Typography, Box } from "@mui/material";

export const CippOffboardingDefaultSettings = (props) => {
  const { formControl, defaultsSource = null, title = "Offboarding Default Settings" } = props;
  
  const getSourceIndicator = () => {
    // Only show the indicator if defaultsSource is explicitly provided (for wizard, not tenant config)
    if (!defaultsSource || defaultsSource === null) return null;
    
    let sourceText = "";
    let color = "text.secondary";
    
    switch (defaultsSource) {
      case "tenant":
        sourceText = "Using Tenant Defaults";
        color = "primary.main";
        break;
      case "user":
        sourceText = "Using User Defaults";
        color = "info.main";
        break;
      case "none":
      default:
        sourceText = "Using Default Settings";
        color = "text.secondary";
        break;
    }
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color, fontStyle: "italic" }}>
          {sourceText}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {getSourceIndicator()}
      <CippPropertyListCard
        layout="two"
        showDivider={false}
        title={title}
        propertyItems={[
        {
          label: "Convert to Shared Mailbox",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.ConvertToShared"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove from all groups",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveGroups"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Hide from Global Address List",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.HideFromGAL"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove Licenses",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveLicenses"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Cancel all calendar invites",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.removeCalendarInvites"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Revoke all sessions",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RevokeSessions"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove users mailbox permissions",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.removePermissions"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove all Rules",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveRules"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Reset Password",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.ResetPass"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Keep copy of forwarded mail in source mailbox",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.KeepCopy"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Delete user",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.DeleteUser"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove all Mobile Devices",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveMobile"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Disable Sign in",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.DisableSignIn"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove all MFA Devices",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveMFADevices"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Remove Teams Phone DID",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.RemoveTeamsPhoneDID"
              formControl={formControl}
            />
          ),
        },
        {
          label: "Clear Immutable ID",
          value: (
            <CippFormComponent
              type="switch"
              name="offboardingDefaults.ClearImmutableId"
              formControl={formControl}
            />
          ),
        },
      ]}
    />
    </>
  );
};
