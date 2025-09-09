import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  Stack,
  SvgIcon,
  Typography,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Check, Error } from "@mui/icons-material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { Grid } from "@mui/system";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useWatch } from "react-hook-form";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import CippForwardingSection from "../CippComponents/CippForwardingSection";

const CippExchangeSettingsForm = (props) => {
  const userSettingsDefaults = useSettings();
  const { formControl, currentSettings, userId, calPermissions, isFetching, oooRequest } = props;
  // State to manage the expanded panels
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [relatedQueryKeys, setRelatedQueryKeys] = useState([]);

  // Watch the Auto Reply State value
  const autoReplyState = useWatch({
    control: formControl.control,
    name: "ooo.AutoReplyState",
  });

  // Calculate if date fields should be disabled
  const areDateFieldsDisabled = autoReplyState?.value !== "Scheduled";

  const handleExpand = (panel) => {
    setExpandedPanel((prev) => (prev === panel ? null : panel));
  };

  const usersList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `users`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $select: "id,displayName,userPrincipalName,mail",
      $top: 999,
    },
    queryKey: `UserNames-${userSettingsDefaults.currentTenant}`,
  });

  const contactsList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `contacts`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $select: "displayName,mail,mailNickname",
      $top: 999,
    },
    queryKey: `TenantContacts-${userSettingsDefaults.currentTenant}`,
  });

  const postRequest = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: relatedQueryKeys,
  });

  // Handle form reset and set dropdown state after successful API calls
  useEffect(() => {
    if (postRequest.isSuccess) {
      // If this was an OOO submission, preserve the submitted values
      if (relatedQueryKeys.includes(`ooo-${userId}`)) {
        const submittedValues = formControl.getValues();
        const oooFields = ['AutoReplyState', 'InternalMessage', 'ExternalMessage', 'StartTime', 'EndTime'];
        
        // Reset the form
        formControl.reset();
        
        // Restore the submitted OOO values
        oooFields.forEach(field => {
          const value = submittedValues.ooo?.[field];
          if (value !== undefined) {
            formControl.setValue(`ooo.${field}`, value);
          }
        });
      } else {
        // For non-OOO submissions, just reset normally
        formControl.reset();
      }
    }
  }, [postRequest.isSuccess, relatedQueryKeys, userId, formControl]);

  const handleSubmit = (type) => {
    if (type === "calendar") {
      setRelatedQueryKeys([`CalendarPermissions-${userId}`]);
    } else if (type === "forwarding") {
      setRelatedQueryKeys([`Mailbox-${userId}`]);
    } else if (type === "ooo") {
      setRelatedQueryKeys([`ooo-${userId}`]);
    } else if (type === "recipientLimits") {
      setRelatedQueryKeys([`Mailbox-${userId}`]);
    }

    const values = formControl.getValues();
    const data = {
      tenantFilter: userSettingsDefaults.currentTenant,
      userid: currentSettings.Mailbox[0].UserPrincipalName,
      ...values[type],
    };

    // Format data for recipient limits
    if (type === "recipientLimits") {
      data.Identity = currentSettings.Mailbox[0].Identity;
      data.recipientLimit = values[type].MaxRecipients;
      delete data.MaxRecipients;
    }

    //remove all nulls and undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === null) {
        delete data[key];
      }
    });
    const url = {
      calendar: "/api/ExecEditCalendarPermissions",
      forwarding: "/api/ExecEmailForward",
      ooo: "/api/ExecSetOoO",
      recipientLimits: "/api/ExecSetRecipientLimits",
    };
    postRequest.mutate({
      url: url[type],
      data: data,
      queryKey: "MailboxPermissions",
    });
  };

  // Data for each section
  const sections = [
    {
      id: "mailboxForwarding",
      cardLabelBox: {
        cardLabelBoxHeader: isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : (currentSettings?.ForwardingAddress) ? (
          <Check/>
        ) : (
          <Error/>
        ),
      },
      text: "Mailbox Forwarding",
      subtext: (currentSettings?.ForwardingAddress)
        ? "Email forwarding is configured for this mailbox"
        : "No email forwarding configured for this mailbox",
      formContent: (
        <CippForwardingSection
          formControl={formControl}
          usersList={usersList}
          contactsList={contactsList}
          postRequest={postRequest}
          handleSubmit={handleSubmit}
        />
      ),
    },
    {
      id: "outOfOffice",
      cardLabelBox: {
        cardLabelBoxHeader: <Typography variant="subtitle2">OOO</Typography>,
      },
      text: "Out Of Office",
      subtext: "Set automatic replies for when you are away",
      formContent: (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CippFormComponent
                type="autoComplete"
                name="ooo.AutoReplyState"
                label="Auto Reply State"
                multiple={false}
                formControl={formControl}
                creatable={false}
                options={[
                  { label: "Enabled", value: "Enabled" },
                  { label: "Disabled", value: "Disabled" },
                  { label: "Scheduled", value: "Scheduled" },
                ]}
              />
            </Grid>
            <Grid size={6}>
              <Tooltip 
                title={areDateFieldsDisabled ? "Scheduling is only available when Auto Reply State is set to Scheduled" : ""}
                placement="bottom"
              >
                <Box>
                  <CippFormComponent
                    type="datePicker"
                    label="Start Date/Time"
                    name="ooo.StartTime"
                    formControl={formControl}
                    disabled={areDateFieldsDisabled}
                  />
                </Box>
              </Tooltip>
            </Grid>
            <Grid size={6}>
              <Tooltip 
                title={areDateFieldsDisabled ? "Scheduling is only available when Auto Reply State is set to Scheduled" : ""}
                placement="bottom"
              >
                <Box>
                  <CippFormComponent
                    type="datePicker"
                    label="End Date/Time"
                    name="ooo.EndTime"
                    formControl={formControl}
                    disabled={areDateFieldsDisabled}
                  />
                </Box>
              </Tooltip>
            </Grid>
            <Grid size={12}>
              <CippFormComponent
                type="richText"
                label="Internal Message"
                name="ooo.InternalMessage"
                formControl={formControl}
                multiline
                rows={4}
              />
            </Grid>
            <Grid size={12}>
              <CippFormComponent
                type="richText"
                label="External Message"
                name="ooo.ExternalMessage"
                formControl={formControl}
                multiline
                rows={4}
              />
            </Grid>
            <Grid size={12}>
              <CippApiResults apiObject={postRequest} />
            </Grid>
            <Grid>
              <Button
                onClick={() => handleSubmit("ooo")}
                variant="contained"
                disabled={!formControl.formState.isValid || postRequest.isPending}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "recipientLimits",
      cardLabelBox: {
        cardLabelBoxHeader: <Typography variant="subtitle2">RL</Typography>,
      },
      text: "Recipient Limits",
      subtext: "Set the maximum number of recipients per message",
      formContent: (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CippFormComponent
                type="number"
                label="Maximum Recipients"
                name="recipientLimits.MaxRecipients"
                formControl={formControl}
                defaultValue={currentSettings?.Mailbox?.[0]?.RecipientLimits || 500}
                validators={{
                  required: "Please enter a number",
                  min: { value: 1, message: "The minimum is 1" },
                  max: { value: 1000, message: "The maximum is 1000" }, 
                }}
              />
            </Grid>
            <Grid size={12}>
              <CippApiResults apiObject={postRequest} />
            </Grid>
            <Grid>
              <Button
                onClick={() => handleSubmit("recipientLimits")}
                variant="contained"
                disabled={!formControl.formState.isValid || postRequest.isPending}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      {sections.map((section) => {
        const isExpanded = expandedPanel === section.id;
        return (
          <Card key={section.id}>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
                py: 3,
                pl: 2,
                pr: 4,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              onClick={() => handleExpand(section.id)}
            >
              {/* Left Side: cardLabelBox, text, subtext */}
              <Stack direction="row" spacing={2} alignItems="center">
                {/* cardLabelBox */}
                <Box
                  sx={{
                    alignItems: "center",
                    borderRadius: 1,
                    color: "text.secondary",
                    display: "flex",
                    height: 40,
                    justifyContent: "center",
                    width: 40,
                  }}
                >
                  {section.cardLabelBox.cardLabelBoxHeader}
                </Box>

                {/* Main Text and Subtext */}
                <Box>
                  <Typography color="textPrimary" variant="h6">
                    {section.text}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">
                    {section.subtext}
                  </Typography>
                </Box>
              </Stack>

              <SvgIcon
                fontSize="small"
                sx={{
                  transition: "transform 150ms",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDownIcon />
              </SvgIcon>
            </Box>
            <Collapse in={isExpanded} unmountOnExit>
              <Divider />
              <Box sx={{ p: 2 }}>{section.formContent}</Box>
            </Collapse>
          </Card>
        );
      })}
    </Stack>
  );
};

export default CippExchangeSettingsForm;
