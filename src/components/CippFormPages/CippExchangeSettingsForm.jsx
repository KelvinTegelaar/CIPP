import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Collapse,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { Forward } from "@mui/icons-material";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { Grid } from "@mui/system";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useWatch } from "react-hook-form";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const CippExchangeSettingsForm = (props) => {
  const userSettingsDefaults = useSettings();
  const { formControl, currentSettings, userId, calPermissions, isFetching } = props;
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
  
  useEffect(() => {
    console.log('Auto Reply State changed:', {
      autoReplyState,
      areDateFieldsDisabled,
      fullFormValues: formControl.getValues()
    });
  }, [autoReplyState]);

  // Add debug logging for form values
  useEffect(() => {
    const subscription = formControl.watch((value, { name, type }) => {
      console.log('Form value changed:', { name, type, value });
    });
    return () => subscription.unsubscribe();
  }, [formControl]);

  const handleExpand = (panel) => {
    setExpandedPanel((prev) => (prev === panel ? null : panel));
  };

  const usersList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `users`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $select: "id,displayName,userPrincipalName,mail",
      noPagination: true,
      $top: 999,
    },
    queryKey: `UserNames-${userSettingsDefaults.currentTenant}`,
  });

  const postRequest = ApiPostCall({
    datafromUrl: true,
    relatedQueryKeys: relatedQueryKeys,
  });

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

    // Reset the form
    formControl.reset();
  };

  // Data for each section
  const sections = [
    {
      id: "mailboxForwarding",
      cardLabelBox: currentSettings?.ForwardAndDeliver ? <Forward /> : "-",
      text: "Mailbox Forwarding",
      subtext: "Configure email forwarding options",
      formContent: (
        <Stack spacing={2}>
          <CippFormComponent
            type="radio"
            name="forwarding.forwardOption"
            formControl={formControl}
            options={[
              { label: "Forward to Internal Address", value: "internalAddress" },
              {
                label: "Forward to External Address (Tenant must allow this)",
                value: "ExternalAddress",
              },
              { label: "Disable Email Forwarding", value: "disabled" },
            ]}
          />

          <CippFormCondition
            formControl={formControl}
            field="forwarding.forwardOption"
            compareType="is"
            compareValue="internalAddress"
          >
            <CippFormComponent
              type="autoComplete"
              label="Select User"
              name="forwarding.ForwardInternal"
              multiple={false}
              options={
                usersList?.data?.Results?.map((user) => ({
                  value: user.userPrincipalName,
                  label: `${user.displayName} (${user.userPrincipalName})`,
                })) || []
              }
              formControl={formControl}
            />
          </CippFormCondition>

          <CippFormCondition
            formControl={formControl}
            field="forwarding.forwardOption"
            compareType="is"
            compareValue="ExternalAddress"
          >
            <CippFormComponent
              type="textField"
              label="External Email Address"
              name="forwarding.ForwardExternal"
              formControl={formControl}
            />
          </CippFormCondition>

          <CippFormComponent
            type="switch"
            label="Keep a Copy of the Forwarded Mail in the Source Mailbox"
            name="forwarding.KeepCopy"
            formControl={formControl}
          />
          <Grid item size={12}>
            <CippApiResults apiObject={postRequest} />
          </Grid>
          <Grid>
            <Button
              onClick={() => handleSubmit("forwarding")}
              variant="contained"
              disabled={!formControl.formState.isValid || postRequest.isPending}
            >
              Submit
            </Button>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "outOfOffice",
      cardLabelBox: "OOO",
      text: "Out Of Office",
      subtext: "Set automatic replies for when you are away",
      formContent: (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item size={12}>
              <CippFormComponent
                type="autoComplete"
                name="ooo.AutoReplyState"
                label="Auto Reply State"
                multiple={false}
                formControl={formControl}
                options={[
                  { label: "Enabled", value: "Enabled" },
                  { label: "Disabled", value: "Disabled" },
                  { label: "Scheduled", value: "Scheduled" },
                ]}
              />
            </Grid>
            <Grid item size={6}>
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
            <Grid item size={6}>
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
            <Grid item size={12}>
              <CippFormComponent
                type="richText"
                label="Internal Message"
                name="ooo.InternalMessage"
                formControl={formControl}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item size={12}>
              <CippFormComponent
                type="richText"
                label="External Message"
                name="ooo.ExternalMessage"
                formControl={formControl}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item size={12}>
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
      cardLabelBox: "RL",
      text: "Recipient Limits",
      subtext: "Set the maximum number of recipients per message",
      formContent: (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item size={12}>
              <CippFormComponent
                type="number"
                label="Maximum Recipients"
                name="recipientLimits.MaxRecipients"
                formControl={formControl}
                defaultValue={currentSettings?.Mailbox?.[0]?.RecipientLimits || 500}
              />
            </Grid>
            <Grid item size={12}>
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
                    color: "primary.contrastText",
                    display: "flex",
                    height: 40,
                    justifyContent: "center",
                    width: 40,
                  }}
                >
                  <Typography variant="subtitle2">{section.cardLabelBox}</Typography>
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
