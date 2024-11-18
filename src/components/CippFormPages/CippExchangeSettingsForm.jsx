import React, { useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormCondition } from "/src/components/CippComponents/CippFormCondition";
import { Forward } from "@mui/icons-material";
import { ApiGetCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { Grid } from "@mui/system";

const CippExchangeSettingsForm = (props) => {
  const userSettingsDefaults = useSettings();
  const { formControl, currentSettings, calPermissions } = props;
  // State to manage the expanded panels
  const [expandedPanel, setExpandedPanel] = useState(null);

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

  const handleSubmit = (type) => {
    const values = formControl.getValues();
    const permissions = values[type];
    const data = {
      UserId: currentSettings.UserId,
      Permissions: permissions,
    };
    console.log(data);
  };

  // Data for each section
  const sections = [
    {
      id: "mailboxPermissions",
      cardLabelBox: "-", // This can be an icon or text label
      text: "Mailbox Permissions",
      subtext: "Manage mailbox permissions for users",
      formContent: (
        <Stack spacing={2}>
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Remove Full Access"
            name="RemoveFullAccess"
            options={
              usersList?.data?.Results?.filter((user) =>
                currentSettings?.Permissions?.some(
                  (perm) =>
                    perm.AccessRights === "FullAccess" && perm.User === user.userPrincipalName
                )
              ).map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Add Full Access - Automapping Enabled"
            name="AddFullAccess"
            options={
              usersList?.data?.Results?.map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Add Full Access - Automapping Disabled"
            name="AddFullAccessNoAutoMap"
            options={
              usersList?.data?.Results?.map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Add Send-as Permissions"
            name="AddSendAs"
            options={
              usersList?.data?.Results?.map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Remove Send-as Permissions"
            name="RemoveSendAs"
            options={
              usersList?.data?.Results?.filter((user) =>
                currentSettings?.Permissions?.some(
                  (perm) => perm.AccessRights === "SendAs" && perm.User === user.userPrincipalName
                )
              ).map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Add Send On Behalf Permissions"
            name="AddSendOnBehalf"
            options={
              usersList?.data?.Results?.map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            multiple
            label="Remove Send On Behalf Permissions"
            name="RemoveSendOnBehalf"
            options={
              usersList?.data?.Results?.filter((user) =>
                currentSettings?.Permissions?.some(
                  (perm) =>
                    perm.AccessRights === "SendOnBehalf" && perm.User === user.userPrincipalName
                )
              ).map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <Grid>
            <Button onClick={() => handleSubmit("permissions")} variant="contained">
              Submit
            </Button>
          </Grid>
        </Stack>
      ),
    },
    {
      id: "calendarPermissions",
      cardLabelBox: "-",
      text: "Calendar Permissions",
      subtext: "Adjust calendar sharing settings",
      formContent: (
        <Stack spacing={2}>
          <CippFormComponent
            type="autoComplete"
            label="Remove Access"
            name="RemoveAccess"
            options={[]}
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            label="Add Access"
            name="UserToGetPermissions"
            options={
              usersList?.data?.Results?.map((user) => ({
                value: user.userPrincipalName,
                label: `${user.displayName} (${user.userPrincipalName})`,
              })) || []
            }
            formControl={formControl}
          />
          <CippFormComponent
            type="autoComplete"
            label="Permission Level"
            name="Permissions"
            options={[
              { value: "Author", label: "Author" },
              { value: "Contributor", label: "Contributor" },
              { value: "Editor", label: "Editor" },
              { value: "Owner", label: "Owner" },
              { value: "NonEditingAuthor", label: "Non Editing Author" },
              { value: "PublishingAuthor", label: "Publishing Author" },
              { value: "PublishingEditor", label: "Publishing Editor" },
              { value: "Reviewer", label: "Reviewer" },
              { value: "LimitedDetails", label: "Limited Details" },
              { value: "AvailabilityOnly", label: "Availability Only" },
            ]}
            formControl={formControl}
          />
        </Stack>
      ),
    },
    {
      id: "mailboxForwarding",
      cardLabelBox: currentSettings?.ForwardAndDeliver ? <Forward /> : "-",
      text: "Mailbox Forwarding",
      subtext: "Configure email forwarding options",
      formContent: (
        <Stack spacing={2}>
          <CippFormComponent
            type="radio"
            name="forwardOption"
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
            field="forwardOption"
            compareType="is"
            compareValue="internalAddress"
          >
            <CippFormComponent
              type="autoComplete"
              label="Select User"
              name="ForwardInternal"
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
            field="forwardOption"
            compareType="is"
            compareValue="ExternalAddress"
          >
            <CippFormComponent
              type="textField"
              label="External Email Address"
              name="ForwardExternal"
              formControl={formControl}
            />
          </CippFormCondition>

          <CippFormComponent
            type="switch"
            label="Keep a Copy of the Forwarded Mail in the Source Mailbox"
            name="KeepCopy"
            formControl={formControl}
          />
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
          <CippFormComponent
            type="switch"
            label="Auto Reply State"
            name="AutoReplyState"
            formControl={formControl}
          />
          <CippFormComponent
            type="datePicker"
            label="Start Date/Time"
            name="StartTime"
            formControl={formControl}
          />
          <CippFormComponent
            type="datePicker"
            label="End Date/Time"
            name="EndTime"
            formControl={formControl}
          />
          <CippFormComponent
            type="textField"
            label="Internal Message"
            name="InternalMessage"
            formControl={formControl}
            multiline
            rows={4}
          />
          <CippFormComponent
            type="textField"
            label="External Message"
            name="ExternalMessage"
            formControl={formControl}
            multiline
            rows={4}
          />
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
                p: 2,
              }}
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

              {/* Expand Icon */}
              <IconButton onClick={() => handleExpand(section.id)}>
                <SvgIcon
                  fontSize="small"
                  sx={{
                    transition: "transform 150ms",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ExpandMoreIcon />
                </SvgIcon>
              </IconButton>
            </Box>
            <Collapse in={isExpanded}>
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
