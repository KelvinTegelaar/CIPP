import React, { useState, useEffect, cloneElement } from "react";
import { Divider, Typography, Alert, Box } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormDomainSelector } from "/src/components/CippComponents/CippFormDomainSelector";
import { useSettings } from "/src/hooks/use-settings";

const AddTransportRule = () => {
  const currentTenant = useSettings().currentTenant;
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      Enabled: true,
      Mode: { value: "Enforce", label: "Enforce" },
      StopRuleProcessing: false,
      SenderAddressLocation: { value: "Header", label: "Header" },
      applyToAllMessages: false,
      tenantFilter: currentTenant
    },
  });

  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedExceptions, setSelectedExceptions] = useState([]);

  const conditionTypeWatch = useWatch({ control: formControl.control, name: "conditionType" });
  const actionTypeWatch = useWatch({ control: formControl.control, name: "actionType" });
  const exceptionTypeWatch = useWatch({ control: formControl.control, name: "exceptionType" });
  const applyToAllMessagesWatch = useWatch({ control: formControl.control, name: "applyToAllMessages" });

  // Helper function to get field names for a condition
  const getConditionFieldNames = (conditionValue) => {
    const fields = [conditionValue];
    // Add related fields for special cases
    if (conditionValue === "HeaderContainsWords") {
      fields.push("HeaderContainsWordsMessageHeader");
    } else if (conditionValue === "HeaderMatchesPatterns") {
      fields.push("HeaderMatchesPatternsMessageHeader");
    }
    return fields;
  };

  // Helper function to get field names for an action
  const getActionFieldNames = (actionValue) => {
    const fields = [];
    switch (actionValue) {
      case "RejectMessage":
        fields.push("RejectMessageReasonText", "RejectMessageEnhancedStatusCode");
        break;
      case "SetHeader":
        fields.push("SetHeaderName", "SetHeaderValue");
        break;
      case "ApplyHtmlDisclaimer":
        fields.push("ApplyHtmlDisclaimerText", "ApplyHtmlDisclaimerLocation", "ApplyHtmlDisclaimerFallbackAction");
        break;
      default:
        fields.push(actionValue);
    }
    return fields;
  };

  // Update selected conditions and clean up removed ones
  useEffect(() => {
    const newConditions = conditionTypeWatch || [];
    const newConditionValues = newConditions.map(c => c.value || c);
    const oldConditionValues = selectedConditions.map(c => c.value || c);

    // Find removed conditions
    const removedConditions = oldConditionValues.filter(
      oldVal => !newConditionValues.includes(oldVal)
    );

    // Clear form values for removed conditions
    removedConditions.forEach(conditionValue => {
      const fieldNames = getConditionFieldNames(conditionValue);
      fieldNames.forEach(fieldName => {
        formControl.setValue(fieldName, undefined);
      });
    });

    setSelectedConditions(newConditions);
  }, [conditionTypeWatch]);

  // Update selected actions and clean up removed ones
  useEffect(() => {
    const newActions = actionTypeWatch || [];
    const newActionValues = newActions.map(a => a.value || a);
    const oldActionValues = selectedActions.map(a => a.value || a);

    // Find removed actions
    const removedActions = oldActionValues.filter(
      oldVal => !newActionValues.includes(oldVal)
    );

    // Clear form values for removed actions
    removedActions.forEach(actionValue => {
      const fieldNames = getActionFieldNames(actionValue);
      fieldNames.forEach(fieldName => {
        formControl.setValue(fieldName, undefined);
      });
    });

    setSelectedActions(newActions);
  }, [actionTypeWatch]);

  // Update selected exceptions and clean up removed ones
  useEffect(() => {
    const newExceptions = exceptionTypeWatch || [];
    const newExceptionValues = newExceptions.map(e => e.value || e);
    const oldExceptionValues = selectedExceptions.map(e => e.value || e);

    // Find removed exceptions
    const removedExceptions = oldExceptionValues.filter(
      oldVal => !newExceptionValues.includes(oldVal)
    );

    // Clear form values for removed exceptions
    removedExceptions.forEach(exceptionValue => {
      // Get base condition name (remove ExceptIf prefix)
      const baseCondition = exceptionValue.replace("ExceptIf", "");
      const fieldNames = getConditionFieldNames(baseCondition).map(
        field => field.includes("MessageHeader") ? `ExceptIf${field}` : exceptionValue
      );
      fieldNames.forEach(fieldName => {
        formControl.setValue(fieldName, undefined);
      });
    });

    setSelectedExceptions(newExceptions);
  }, [exceptionTypeWatch]);

  // Update selected conditions when conditionType changes
  useEffect(() => {
    setSelectedConditions(conditionTypeWatch || []);
  }, [conditionTypeWatch]);

  useEffect(() => {
    setSelectedActions(actionTypeWatch || []);
  }, [actionTypeWatch]);

  useEffect(() => {
    setSelectedExceptions(exceptionTypeWatch || []);
  }, [exceptionTypeWatch]);

  // Handle "Apply to all messages" logic
  useEffect(() => {
    if (applyToAllMessagesWatch) {
      // Clear conditions when "apply to all" is enabled
      formControl.setValue("conditionType", []);
      setSelectedConditions([]);
    }
  }, [applyToAllMessagesWatch, formControl]);

  // Disable "Apply to all messages" when conditions are selected
  useEffect(() => {
    if (conditionTypeWatch && conditionTypeWatch.length > 0) {
      formControl.setValue("applyToAllMessages", false);
    }
  }, [conditionTypeWatch, formControl]);

  // Condition options
  const conditionOptions = [
    { value: "From", label: "The sender is..." },
    { value: "FromScope", label: "The sender is located..." },
    { value: "SentTo", label: "The recipient is..." },
    { value: "SentToScope", label: "The recipient is located..." },
    { value: "SubjectContainsWords", label: "Subject contains words..." },
    { value: "SubjectMatchesPatterns", label: "Subject matches patterns..." },
    { value: "SubjectOrBodyContainsWords", label: "Subject or body contains words..." },
    { value: "SubjectOrBodyMatchesPatterns", label: "Subject or body matches patterns..." },
    { value: "FromAddressContainsWords", label: "Sender address contains words..." },
    { value: "FromAddressMatchesPatterns", label: "Sender address matches patterns..." },
    { value: "AttachmentContainsWords", label: "Attachment content contains words..." },
    { value: "AttachmentMatchesPatterns", label: "Attachment content matches patterns..." },
    { value: "AttachmentExtensionMatchesWords", label: "Attachment extension is..." },
    { value: "AttachmentSizeOver", label: "Attachment size is greater than..." },
    { value: "MessageSizeOver", label: "Message size is greater than..." },
    { value: "SCLOver", label: "SCL is greater than or equal to..." },
    { value: "WithImportance", label: "Message importance is..." },
    { value: "MessageTypeMatches", label: "Message type is..." },
    { value: "SenderDomainIs", label: "Sender domain is..." },
    { value: "RecipientDomainIs", label: "Recipient domain is..." },
    { value: "HeaderContainsWords", label: "Message header contains words..." },
    { value: "HeaderMatchesPatterns", label: "Message header matches patterns..." },
  ];

  // Action options
  const actionOptions = [
    { value: "DeleteMessage", label: "Delete the message without notifying anyone" },
    { value: "Quarantine", label: "Quarantine the message" },
    { value: "RedirectMessageTo", label: "Redirect the message to..." },
    { value: "BlindCopyTo", label: "Add recipients to the Bcc box..." },
    { value: "CopyTo", label: "Add recipients to the Cc box..." },
    { value: "ModerateMessageByUser", label: "Forward the message for approval to..." },
    { value: "ModerateMessageByManager", label: "Forward the message for approval to the sender's manager" },
    { value: "RejectMessage", label: "Reject the message with explanation..." },
    { value: "PrependSubject", label: "Prepend the subject with..." },
    { value: "SetSCL", label: "Set spam confidence level (SCL) to..." },
    { value: "SetHeader", label: "Set message header..." },
    { value: "RemoveHeader", label: "Remove message header..." },
    { value: "ApplyClassification", label: "Apply message classification..." },
    { value: "ApplyHtmlDisclaimer", label: "Apply HTML disclaimer..." },
    { value: "GenerateIncidentReport", label: "Generate incident report and send to..." },
    { value: "GenerateNotification", label: "Notify the sender with a message..." },
    { value: "ApplyOME", label: "Apply Office 365 Message Encryption" },
  ];

  const renderConditionField = (condition) => {
    const conditionValue = condition.value || condition;
    const conditionLabel = condition.label || condition;

    switch (conditionValue) {
      case "From":
      case "SentTo":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
              multiple={true}
              api={{
                url: "/api/ListGraphRequest",
                data: {
                  Endpoint: "users",
                  tenantFilter: currentTenant,
                  $select: "id,displayName,userPrincipalName",
                  $top: 999,
                },
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "userPrincipalName",
                dataKey: "Results",
              }}
            />
          </Grid>
        );

      case "FromScope":
      case "SentToScope":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
              creatable={false}
              multiple={false}
              options={[
                { value: "InOrganization", label: "Inside the organization" },
                { value: "NotInOrganization", label: "Outside the organization" },
              ]}
            />
          </Grid>
        );

      case "WithImportance":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              creatable={false}
              multiple={false}
              formControl={formControl}
              options={[
                { value: "Low", label: "Low" },
                { value: "Normal", label: "Normal" },
                { value: "High", label: "High" },
              ]}
            />
          </Grid>
        );

      case "MessageTypeMatches":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              creatable={false}
              multiple={false}
              formControl={formControl}
              options={[
                { value: "OOF", label: "Automatic reply (OOF)" },
                { value: "AutoForward", label: "Auto-forward" },
                { value: "Encrypted", label: "Encrypted" },
                { value: "Calendaring", label: "Calendaring" },
                { value: "PermissionControlled", label: "Permission controlled" },
                { value: "Voicemail", label: "Voicemail" },
                { value: "Signed", label: "Signed" },
                { value: "ApprovalRequest", label: "Approval request" },
                { value: "ReadReceipt", label: "Read receipt" },
              ]}
            />
          </Grid>
        );

      case "SCLOver":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              creatable={false}
              multiple={false}
              formControl={formControl}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: i.toString(),
                label: i.toString(),
              }))}
            />
          </Grid>
        );

      case "AttachmentSizeOver":
      case "MessageSizeOver":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="number"
              fullWidth
              label={`${conditionLabel} (in bytes, e.g., 10MB = 10485760)`}
              name={conditionValue}
              formControl={formControl}
              placeholder="Enter size in bytes"
            />
          </Grid>
        );

      case "SenderDomainIs":
      case "RecipientDomainIs":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormDomainSelector
              fullWidth
              label="Recipient Domain Is"
              name={conditionValue}
              formControl={formControl}
            />
          </Grid>
        );

      case "HeaderContainsWords":
      case "HeaderMatchesPatterns":
        return (
          <Grid size={12} key={conditionValue}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <CippFormComponent
                  type="textField"
                  label="Header name"
                  name={`${conditionValue}MessageHeader`}
                  formControl={formControl}
                  placeholder="e.g., Subject, From"
                />
              </Grid>
              <Grid size={6}>
                <CippFormComponent
                  type="textField"
                  label="Words/Patterns (comma-separated)"
                  name={conditionValue}
                  formControl={formControl}
                  placeholder="word1,word2,word3"
                />
              </Grid>
            </Grid>
          </Grid>
        );

      default:
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="textField"
              label={`${conditionLabel} (comma-separated)`}
              name={conditionValue}
              formControl={formControl}
              placeholder="Enter comma-separated values"
            />
          </Grid>
        );
    }
  };

  const renderActionField = (action) => {
    const actionValue = action.value || action;
    const actionLabel = action.label || action;

    switch (actionValue) {
      case "DeleteMessage":
      case "Quarantine":
      case "ModerateMessageByManager":
      case "ApplyOME":
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="switch"
              label={actionLabel}
              name={actionValue}
              formControl={formControl}
            />
          </Grid>
        );

      case "RedirectMessageTo":
      case "BlindCopyTo":
      case "CopyTo":
      case "ModerateMessageByUser":
      case "GenerateIncidentReport":
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="autoComplete"
              label={actionLabel}
              name={actionValue}
              formControl={formControl}
              multiple={true}
              api={{
                url: "/api/ListGraphRequest",
                data: {
                  Endpoint: "users",
                  tenantFilter: currentTenant,
                  $select: "id,displayName,userPrincipalName",
                  $top: 999,
                },
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "userPrincipalName",
                dataKey: "Results",
              }}
            />
          </Grid>
        );

      case "SetSCL":
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="autoComplete"
              label={actionLabel}
              name={actionValue}
              formControl={formControl}
              options={[
                { value: "-1", label: "-1 (Bypass spam filtering)" },
                ...Array.from({ length: 10 }, (_, i) => ({
                  value: i.toString(),
                  label: i.toString(),
                })),
              ]}
            />
          </Grid>
        );

      case "RejectMessage":
        return (
          <Grid size={12} key={actionValue}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CippFormComponent
                  type="textField"
                  label="Rejection reason"
                  name="RejectMessageReasonText"
                  formControl={formControl}
                  multiline
                  rows={3}
                  placeholder="Enter the reason for rejection"
                />
              </Grid>
              <Grid size={12}>
                <CippFormComponent
                  type="textField"
                  label="Enhanced status code (optional)"
                  name="RejectMessageEnhancedStatusCode"
                  formControl={formControl}
                  placeholder="e.g., 5.7.1"
                />
              </Grid>
            </Grid>
          </Grid>
        );

      case "SetHeader":
        return (
          <Grid size={12} key={actionValue}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <CippFormComponent
                  type="textField"
                  label="Header name"
                  name="SetHeaderName"
                  formControl={formControl}
                  placeholder="X-Custom-Header"
                />
              </Grid>
              <Grid size={6}>
                <CippFormComponent
                  type="textField"
                  label="Header value"
                  name="SetHeaderValue"
                  formControl={formControl}
                  placeholder="Header value"
                />
              </Grid>
            </Grid>
          </Grid>
        );

      case "RemoveHeader":
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="textField"
              label="Header name to remove"
              name="RemoveHeader"
              formControl={formControl}
              placeholder="X-Header-To-Remove"
            />
          </Grid>
        );

      case "ApplyHtmlDisclaimer":
        return (
          <Grid size={12} key={actionValue}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CippFormComponent
                  type="textField"
                  label="Disclaimer text (HTML)"
                  name="ApplyHtmlDisclaimerText"
                  formControl={formControl}
                  multiline
                  rows={4}
                  placeholder="Enter HTML disclaimer text"
                />
              </Grid>
              <Grid size={6}>
                <CippFormComponent
                  type="autoComplete"
                  label="Disclaimer location"
                  name="ApplyHtmlDisclaimerLocation"
                  formControl={formControl}
                  options={[
                    { value: "Append", label: "Append (bottom)" },
                    { value: "Prepend", label: "Prepend (top)" },
                  ]}
                />
              </Grid>
              <Grid size={6}>
                <CippFormComponent
                  type="autoComplete"
                  label="Fallback action"
                  name="ApplyHtmlDisclaimerFallbackAction"
                  formControl={formControl}
                  options={[
                    { value: "Wrap", label: "Wrap message" },
                    { value: "Ignore", label: "Ignore and send" },
                    { value: "Reject", label: "Reject message" },
                  ]}
                />
              </Grid>
            </Grid>
          </Grid>
        );

      case "PrependSubject":
      case "ApplyClassification":
      case "GenerateNotification":
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="textField"
              label={actionLabel}
              name={actionValue}
              formControl={formControl}
              multiline
              rows={2}
              placeholder={`Enter ${actionLabel.toLowerCase()}`}
            />
          </Grid>
        );

      default:
        return (
          <Grid size={12} key={actionValue}>
            <CippFormComponent
              type="textField"
              label={actionLabel}
              name={actionValue}
              formControl={formControl}
            />
          </Grid>
        );
    }
  };

  const renderExceptionField = (exception) => {
    const exceptionValue = exception.value || exception;
    const baseCondition = exceptionValue.replace("ExceptIf", "");
    const exceptionLabel = exception.label || exception;

    // Reuse the condition rendering logic
    const mockCondition = { value: baseCondition, label: exceptionLabel };
    const field = renderConditionField(mockCondition);

    // Update the field's name to include ExceptIf prefix
    if (field) {
      return cloneElement(field, {
        key: exceptionValue,
        children: React.Children.map(field.props.children, (child) => {
          if (child?.type === CippFormComponent) {
            return cloneElement(child, {
              name: exceptionValue,
            });
          }
          // For Grid containers with multiple fields (like HeaderContains)
          if (child?.type === Grid && child.props.container) {
            return cloneElement(child, {
              children: React.Children.map(child.props.children, (gridChild) => {
                if (gridChild?.props?.children?.type === CippFormComponent) {
                  const formComponent = gridChild.props.children;
                  const originalName = formComponent.props.name;
                  const newName = originalName.includes("MessageHeader")
                    ? `ExceptIf${originalName}`
                    : exceptionValue;
                  return cloneElement(gridChild, {
                    children: cloneElement(formComponent, {
                      name: newName,
                    }),
                  });
                }
                return gridChild;
              }),
            });
          }
          return child;
        }),
      });
    }
    return null;
  };

  return (
    <CippFormPage
      formControl={formControl}
      queryKey={`ExecNewTransportRule${currentTenant}`}
      title="Add Transport Rule"
      backButtonTitle="Transport Rules"
      postUrl="/api/ExecNewTransportRule"
      data={currentTenant}
    >
      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>

          {/* Basic Information */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="textField"
              label="Rule Name"
              name="Name"
              formControl={formControl}
              required
              validators={{
                required: "Rule name is required",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="number"
              label="Priority"
              name="Priority"
              formControl={formControl}
              placeholder="0 (lowest priority)"
            />
          </Grid>

          <Grid size={12}>
            <CippFormComponent
              type="textField"
              label="Comments"
              name="Comments"
              formControl={formControl}
              multiline
              rows={2}
              placeholder="Optional description of this rule"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="autoComplete"
              label="Rule Mode"
              name="Mode"
              multiple={false}
              formControl={formControl}
              required
              creatable={false}
              options={[
                { value: "Enforce", label: "Enforce" },
                { value: "TestWithPolicyTips", label: "Test with Policy Tips" },
                { value: "TestWithoutPolicyTips", label: "Test without Policy Tips" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="autoComplete"
              label="Severity"
              name="SetAuditSeverity"
              multiple={false}
              formControl={formControl}
              creatable={false}
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "DoNotAudit", label: "Do not audit" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CippFormComponent
              type="switch"
              label="Enable this rule"
              name="Enabled"
              formControl={formControl}
            />
          </Grid>

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Conditions */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Apply this rule if...
            </Typography>
          </Grid>

          <Grid size={12}>
            <CippFormComponent
              type="switch"
              label="Apply to all messages (no conditions)"
              name="applyToAllMessages"
              formControl={formControl}
            />
          </Grid>

          {applyToAllMessagesWatch && (
            <Grid size={12}>
              <Alert severity="info">
                This rule will apply to ALL inbound and outbound messages
                for the entire organization.
              </Alert>
            </Grid>
          )}

          {!applyToAllMessagesWatch && (
            <>
              <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select one or more conditions to target specific messages. If you want this rule to
                  apply to all messages, enable "Apply to all messages" above.
                </Alert>
              </Grid>

              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  label="Select condition types"
                  name="conditionType"
                  formControl={formControl}
                  multiple={true}
                  options={conditionOptions}
                  disabled={applyToAllMessagesWatch}
                  creatable={false}
                />
              </Grid>

              {selectedConditions.map((condition) => renderConditionField(condition))}
            </>
          )}

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Actions */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Do the following...
            </Typography>
          </Grid>

          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              label="Select action types"
              name="actionType"
              formControl={formControl}
              multiple={true}
              options={actionOptions}
              required
              creatable={false}
              validators={{
                required: "At least one action must be selected",
              }}
            />
          </Grid>

          {selectedActions.map((action) => renderActionField(action))}

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Exceptions */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Except if... (optional)
            </Typography>
          </Grid>

          <Grid size={12}>
            <CippFormComponent
              type="autoComplete"
              label="Select exception types"
              name="exceptionType"
              formControl={formControl}
              multiple={true}
              creatable={false}
              options={conditionOptions.map((opt) => ({
                value: `ExceptIf${opt.value}`,
                label: opt.label,
              }))}
            />
          </Grid>

          {selectedExceptions.map((exception) => renderExceptionField(exception))}

          <Divider sx={{ my: 2, width: "100%" }} />

          {/* Advanced Settings */}
          <Grid size={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Advanced Settings
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="autoComplete"
              label="Match sender address in message"
              name="SenderAddressLocation"
              multiple={false}
              formControl={formControl}
              required
              creatable={false}
              options={[
                { value: "Header", label: "Header" },
                { value: "Envelope", label: "Envelope" },
                { value: "HeaderOrEnvelope", label: "Header or Envelope" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="switch"
              label="Stop processing more rules"
              name="StopRuleProcessing"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="datePicker"
              label="Activate this rule on (optional)"
              name="ActivationDate"
              formControl={formControl}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CippFormComponent
              type="datePicker"
              label="Deactivate this rule on (optional)"
              name="ExpiryDate"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </Box>
    </CippFormPage>
  );
};

AddTransportRule.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddTransportRule;