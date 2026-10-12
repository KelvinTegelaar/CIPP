import { useState, useEffect, useRef } from "react";
import { CippIcons } from "../../utils/icon-registry";
import {
  Alert,
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
  IconButton,
} from "@mui/material";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import { ApiGetCall, ApiPostCall } from "../../api/ApiCall";
import { useSettings } from "../../hooks/use-settings";
import { Grid } from "@mui/system";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { useWatch } from "react-hook-form";
import CippForwardingSection from "../CippComponents/CippForwardingSection";
import CippMailboxCustomAttributeRows, {
  canEditMailboxCustomAttributes,
} from "../CippComponents/CippMailboxCustomAttributeRows";

const CippExchangeSettingsForm = (props) => {
  const userSettingsDefaults = useSettings();
  const { formControl, currentSettings, userId, calPermissions, isFetching, oooRequest } = props;
  // State to manage the expanded panels
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [relatedQueryKeys, setRelatedQueryKeys] = useState([]);
  // Handle each successful mutation once — isSuccess stays true and must not re-run on mailbox refetch
  const lastHandledPostDataRef = useRef(null);

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
    if (!postRequest.isSuccess || !postRequest.data) {
      return;
    }
    // isSuccess stays true after the first success; only handle each mutation result once
    if (lastHandledPostDataRef.current === postRequest.data) {
      return;
    }
    lastHandledPostDataRef.current = postRequest.data;

    const submittedValues = formControl.getValues();
    // Capture before reset — OOO/calendar submits do not refetch Mailbox, so
    // clearing attributeRows would lose values until a mailbox refetch.
    const attributeRows =
      submittedValues.attributeRows?.length > 0
        ? submittedValues.attributeRows
        : [{ attribute: null, value: "" }];

    // If this was an OOO submission, preserve the submitted values
    if (relatedQueryKeys.includes(`ooo-${userId}`)) {
      const oooFields = [
        "AutoReplyState",
        "InternalMessage",
        "ExternalMessage",
        "StartTime",
        "EndTime",
        "CreateOOFEvent",
        "OOFEventSubject",
        "AutoDeclineFutureRequestsWhenOOF",
        "DeclineEventsForScheduledOOF",
        "DeclineMeetingMessage",
      ];

      // Reset the form
      formControl.reset();

      // Restore the submitted OOO values
      oooFields.forEach((field) => {
        const value = submittedValues.ooo?.[field];
        if (value !== undefined) {
          formControl.setValue(`ooo.${field}`, value);
        }
      });
    } else {
      // For non-OOO submissions, just reset normally
      formControl.reset();
    }

    formControl.setValue("attributeRows", attributeRows);
  }, [postRequest.isSuccess, postRequest.data, relatedQueryKeys, userId, formControl]);

  const handleSubmit = (type) => {
    if (type === "calendar") {
      setRelatedQueryKeys([`CalendarPermissions-${userId}`]);
    } else if (type === "forwarding") {
      setRelatedQueryKeys([`Mailbox-${userId}`]);
    } else if (type === "ooo") {
      setRelatedQueryKeys([`ooo-${userId}`]);
    } else if (type === "recipientLimits" || type === "customAttributes") {
      setRelatedQueryKeys([`Mailbox-${userId}`]);
    }

    const values = formControl.getValues();
    const data = {
      tenantFilter: userSettingsDefaults.currentTenant,
      userid: currentSettings.Mailbox[0].UserPrincipalName,
      ...(type === "customAttributes" ? {} : values[type]),
    };

    // Include browser timezone for OOO so the API can display local times in the response
    if (type === "ooo") {
      try {
        data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        // Fallback: leave timezone unset; API will display UTC
      }
    }

    // Format data for recipient limits
    if (type === "recipientLimits") {
      data.Identity = currentSettings.Mailbox[0].Identity;
      data.recipientLimit = values[type].MaxRecipients;
      delete data.MaxRecipients;
    }

    // Selective custom attributes — only rows present; empty value clears that attr
    if (type === "customAttributes") {
      data.Identity = currentSettings.Mailbox[0].Identity;
      (values.attributeRows || []).forEach((row) => {
        const attrName = row?.attribute?.value ?? row?.attribute;
        if (attrName) {
          data[attrName] = row?.value ?? "";
        }
      });
    }

    //remove all nulls and undefined values (keep empty strings for custom attributes)
    Object.keys(data).forEach((key) => {
      if (type === "customAttributes" && key.startsWith("CustomAttribute")) {
        return;
      }
      if (data[key] === "" || data[key] === null) {
        delete data[key];
      }
    });
    const url = {
      calendar: "/api/ExecEditCalendarPermissions",
      forwarding: "/api/ExecEmailForward",
      ooo: "/api/ExecSetOoO",
      recipientLimits: "/api/ExecSetRecipientLimits",
      customAttributes: "/api/ExecSetMailboxCustomAttributes",
    };
    postRequest.mutate({
      url: url[type],
      data: data,
      queryKey: "MailboxPermissions",
    });
  };

  const mailbox = currentSettings?.Mailbox?.[0];
  const hasCustomAttributes = Array.from({ length: 15 }, (_, i) => i + 1).some(
    (n) => !!mailbox?.[`CustomAttribute${n}`]
  );
  const customAttributesEditable = canEditMailboxCustomAttributes(mailbox);

  // Data for each section
  const sections = [
    {
      id: "mailboxForwarding",
      cardLabelBox: {
        cardLabelBoxHeader: isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : currentSettings?.ForwardingAddress ? (
          <CippIcons.Check />
        ) : (
          <CippIcons.Error />
        ),
      },
      text: "Mailbox Forwarding",
      subtext: currentSettings?.ForwardingAddress
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
      action: oooRequest
        ? {
            tooltip: oooRequest.isFetching
              ? "Refreshing Out Of Office data"
              : "Refresh Out Of Office data",
            onClick: () => oooRequest.refetch(),
            disabled: oooRequest.isFetching,
            isLoading: oooRequest.isFetching,
          }
        : null,
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip
                title={
                  areDateFieldsDisabled
                    ? "Scheduling is only available when Auto Reply State is set to Scheduled"
                    : ""
                }
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Tooltip
                title={
                  areDateFieldsDisabled
                    ? "Scheduling is only available when Auto Reply State is set to Scheduled"
                    : ""
                }
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
            {!areDateFieldsDisabled && (
              <>
                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Calendar Options
                  </Typography>
                </Grid>
                <Grid size={12}>
                  <CippFormComponent
                    type="switch"
                    name="ooo.CreateOOFEvent"
                    label="Block my calendar for this period"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="ooo.CreateOOFEvent"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={12}>
                    <CippFormComponent
                      type="textField"
                      name="ooo.OOFEventSubject"
                      label="Calendar Event Subject"
                      formControl={formControl}
                    />
                  </Grid>
                </CippFormCondition>
                <Grid size={12}>
                  <CippFormComponent
                    type="switch"
                    name="ooo.AutoDeclineFutureRequestsWhenOOF"
                    label="Automatically decline new invitations during this period"
                    formControl={formControl}
                  />
                </Grid>
                <Grid size={12}>
                  <CippFormComponent
                    type="switch"
                    name="ooo.DeclineEventsForScheduledOOF"
                    label="Decline and cancel my meetings during this period"
                    formControl={formControl}
                  />
                </Grid>
                <CippFormCondition
                  formControl={formControl}
                  field="ooo.DeclineEventsForScheduledOOF"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={12}>
                    <CippFormComponent
                      type="richText"
                      name="ooo.DeclineMeetingMessage"
                      label="Decline Message"
                      formControl={formControl}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </CippFormCondition>
              </>
            )}
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
    {
      id: "customAttributes",
      cardLabelBox: {
        cardLabelBoxHeader: isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : hasCustomAttributes ? (
          <CippIcons.Check />
        ) : (
          <Typography variant="subtitle2">CA</Typography>
        ),
      },
      text: "Custom Attributes",
      subtext: hasCustomAttributes
        ? "One or more Exchange Online custom attributes are set"
        : "Exchange Online Custom Attributes 1–15",
      formContent: (
        <Stack spacing={2}>
          {!customAttributesEditable && (
            <Alert severity="info">
              This mailbox is directory-synced and Exchange attributes are still managed
              on-premises. Enable Exchange cloud management for the mailbox
              (IsExchangeCloudManaged) before editing custom attributes in CIPP. Current values
              are shown read-only.
            </Alert>
          )}
          <CippMailboxCustomAttributeRows
            formControl={formControl}
            name="attributeRows"
            disabled={!customAttributesEditable}
          />
          <CippApiResults apiObject={postRequest} />
          {customAttributesEditable && (
            <Box>
              <Button
                onClick={() => handleSubmit("customAttributes")}
                variant="contained"
                disabled={postRequest.isPending}
              >
                Submit
              </Button>
            </Box>
          )}
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
              <Stack direction="row" spacing={2} sx={{
                alignItems: "center"
              }}>
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

              <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
              }}>
                {section.action && (
                  <Tooltip title={section.action.tooltip} placement="left">
                    <span>
                      <IconButton
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          section.action.onClick?.();
                        }}
                        disabled={section.action.disabled}
                        sx={{
                          color: "text.secondary",
                        }}
                      >
                        <SvgIcon
                          fontSize="small"
                          sx={{
                            animation: section.action.isLoading
                              ? "spin 1s linear infinite"
                              : "none",
                            "@keyframes spin": {
                              "0%": { transform: "rotate(0deg)" },
                              "100%": { transform: "rotate(360deg)" },
                            },
                          }}
                        >
                          <CippIcons.Sync />
                        </SvgIcon>
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <SvgIcon
                  fontSize="small"
                  sx={{
                    transition: "transform 150ms",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <CippIcons.ChevronDownIcon />
                </SvgIcon>
              </Stack>
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
