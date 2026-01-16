import React, { useState, useEffect, useMemo, useCallback, cloneElement } from "react";
import { Button, Divider, Typography, Alert, Box } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch } from "react-hook-form";
import { RocketLaunch, Edit } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippFormDomainSelector } from "./CippFormDomainSelector";
import { CippApiResults } from "./CippApiResults";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import { useQueryClient } from "@tanstack/react-query";

export const CippTransportRuleDrawer = ({
  buttonText = "New Transport Rule",
  isEditMode = false,
  ruleId = null,
  requiredPermissions = [],
  PermissionButton = Button,
  onSuccess = () => {},
  drawerVisible: controlledDrawerVisible,
  setDrawerVisible: controlledSetDrawerVisible,
  rowAction = false,
}) => {
  const currentTenant = useSettings().currentTenant;
  const [internalDrawerVisible, internalSetDrawerVisible] = useState(false);
  const drawerVisible = controlledDrawerVisible !== undefined ? controlledDrawerVisible : internalDrawerVisible;
  const setDrawerVisible = controlledSetDrawerVisible !== undefined ? controlledSetDrawerVisible : internalSetDrawerVisible;

  // Fetch existing rule data in edit mode
  const ruleInfo = ApiGetCall({
    url: `/api/ListTransportRules?tenantFilter=${currentTenant}&id=${ruleId}`,
    queryKey: `ListTransportRules-${ruleId}`,
    waiting: !!drawerVisible || !!isEditMode || !!ruleId,
  });

  // Default form values
  const defaultFormValues = useMemo(
    () => ({
      Enabled: true,
      Mode: { value: "Enforce", label: "Enforce" },
      StopRuleProcessing: false,
      SenderAddressLocation: { value: "Header", label: "Header" },
      applyToAllMessages: false,
      tenantFilter: currentTenant,
      Name: "",
      Priority: "",
      Comments: "",
      conditionType: [],
      actionType: [],
      exceptionType: [],
    }),
    [currentTenant]
  );

  const formControl = useForm({
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedExceptions, setSelectedExceptions] = useState([]);

  const conditionTypeWatch = useWatch({ control: formControl.control, name: "conditionType" });
  const actionTypeWatch = useWatch({ control: formControl.control, name: "actionType" });
  const exceptionTypeWatch = useWatch({ control: formControl.control, name: "exceptionType" });
  const applyToAllMessagesWatch = useWatch({ control: formControl.control, name: "applyToAllMessages" });

  // API call for submit
  const submitRule = ApiPostCall({
    urlFromData: true,
  });

  // Helper to convert ISO8601 date string to Unix timestamp (seconds)
  const iso8601ToUnixTimestamp = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return Math.floor(d.getTime() / 1000);
  };

  // Helper to convert Enable/Disable into a usable bool for switches
  const boolHelper = (boolValue) => {
    if (boolValue === "Enabled") return true;
    return false;
  };

  // Memoize processed rule data
  const processedRuleData = useMemo(() => {
    if (!ruleInfo.isSuccess || !ruleInfo.data || !isEditMode) {
      return null;
    }

    const rule = ruleInfo.data?.Results 
      ? (Array.isArray(ruleInfo.data.Results) ? ruleInfo.data.Results[0] : ruleInfo.data.Results)
      : (Array.isArray(ruleInfo.data) ? ruleInfo.data[0] : ruleInfo.data);

    if (!rule) {
      return null;
    }

    // Map of condition field names to their display labels
    const conditionFieldMap = {
      From: "The sender is...",
      FromScope: "The sender is located...",
      FromMemberOf: "The sender is a member of...",
      SentTo: "The recipient is...",
      SentToScope: "The recipient is located...",
      SentToMemberOf: "The recipient is a member of...",
      SubjectContainsWords: "Subject contains words...",
      SubjectMatchesPatterns: "Subject matches patterns...",
      SubjectOrBodyContainsWords: "Subject or body contains words...",
      SubjectOrBodyMatchesPatterns: "Subject or body matches patterns...",
      FromAddressContainsWords: "Sender address contains words...",
      FromAddressMatchesPatterns: "Sender address matches patterns...",
      AttachmentContainsWords: "Attachment content contains words...",
      AttachmentMatchesPatterns: "Attachment content matches patterns...",
      AttachmentExtensionMatchesWords: "Attachment extension is...",
      AttachmentSizeOver: "Attachment size is greater than...",
      MessageSizeOver: "Message size is greater than...",
      SCLOver: "SCL is greater than or equal to...",
      WithImportance: "Message importance is...",
      MessageTypeMatches: "Message type is...",
      SenderDomainIs: "Sender domain is...",
      RecipientDomainIs: "Recipient domain is...",
      SenderIpRanges: "Sender IP address belongs to any of these ranges...",
      HeaderContainsWords: "Message header contains words...",
      HeaderMatchesPatterns: "Message header matches patterns...",
      AnyOfToHeader: "Any To header contains...",
      AnyOfToHeaderMemberOf: "Any To header is a member of...",
      AnyOfCcHeader: "Any Cc header contains...",
      AnyOfCcHeaderMemberOf: "Any Cc header is a member of...",
      AnyOfToCcHeader: "Any To or Cc header contains...",
      AnyOfToCcHeaderMemberOf: "Any To or Cc header is a member of...",
      RecipientAddressContainsWords: "Recipient address contains words...",
      RecipientAddressMatchesPatterns: "Recipient address matches patterns...",
      AnyOfRecipientAddressContainsWords: "Any recipient address contains words...",
      AnyOfRecipientAddressMatchesPatterns: "Any recipient address matches patterns...",
    };

    const actionFieldMap = {
      DeleteMessage: "Delete the message without notifying anyone",
      Quarantine: "Quarantine the message",
      RedirectMessageTo: "Redirect the message to...",
      BlindCopyTo: "Add recipients to the Bcc box...",
      CopyTo: "Add recipients to the Cc box...",
      ModerateMessageByUser: "Forward the message for approval to...",
      ModerateMessageByManager: "Forward the message for approval to the sender's manager",
      RejectMessageReasonText: "Reject the message with explanation...",
      PrependSubject: "Prepend the subject with...",
      SetSCL: "Set spam confidence level (SCL) to...",
      SetHeaderName: "Set message header...",
      RemoveHeader: "Remove message header...",
      ApplyClassification: "Apply message classification...",
      ApplyHtmlDisclaimerText: "Apply HTML disclaimer...",
      GenerateIncidentReport: "Generate incident report and send to...",
      GenerateNotification: "Notify the sender with a message...",
      ApplyOME: "Apply Office 365 Message Encryption",
    };

    // Detect active conditions
    const activeConditions = [];
    Object.keys(conditionFieldMap).forEach(field => {
      const value = rule[field];
      if (value !== null && value !== undefined && value !== false && value !== "") {
        activeConditions.push({
          value: field,
          label: conditionFieldMap[field]
        });
      }
    });

    // Detect active actions
    const activeActions = [];
    Object.keys(actionFieldMap).forEach(field => {
      const value = rule[field];
      if (field === "RejectMessageReasonText" && (rule.RejectMessageReasonText || rule.RejectMessageEnhancedStatusCode)) {
        activeActions.push({ value: "RejectMessage", label: actionFieldMap[field] });
      } else if (field === "SetHeaderName" && (rule.SetHeaderName || rule.SetHeaderValue)) {
        activeActions.push({ value: "SetHeader", label: actionFieldMap[field] });
      } else if (field === "ApplyHtmlDisclaimerText" && rule.ApplyHtmlDisclaimerText) {
        activeActions.push({ value: "ApplyHtmlDisclaimer", label: actionFieldMap[field] });
      } else if (field === "ModerateMessageByManager" && value === true) {
        activeActions.push({ value: field, label: actionFieldMap[field] });
      } else if (value !== null && value !== undefined && value !== false && value !== "" && 
                 field !== "RejectMessageReasonText" && field !== "SetHeaderName" && 
                 field !== "ApplyHtmlDisclaimerText" && field !== "ModerateMessageByManager") {
        activeActions.push({ value: field, label: actionFieldMap[field] });
      }
    });

    // Detect active exceptions
    const activeExceptions = [];
    Object.keys(conditionFieldMap).forEach(field => {
      const exceptionField = `ExceptIf${field}`;
      const value = rule[exceptionField];
      if (value !== null && value !== undefined && value !== false && value !== "") {
        activeExceptions.push({
          value: exceptionField,
          label: conditionFieldMap[field]
        });
      }
    });

    // Build form data
    const formData = {
      Name: rule.Name || "",
      Priority: rule.Priority || "",
      Comments: rule.Comments || "",
      Enabled: boolHelper(rule.State),
      Mode: rule.Mode ? { value: rule.Mode, label: rule.Mode } : { value: "Enforce", label: "Enforce" },
      SetAuditSeverity: rule.SetAuditSeverity 
        ? { value: rule.SetAuditSeverity, label: rule.SetAuditSeverity }
        : undefined,
      SenderAddressLocation: rule.SenderAddressLocation
        ? { value: rule.SenderAddressLocation, label: rule.SenderAddressLocation }
        : { value: "Header", label: "Header" },
      StopRuleProcessing: rule.StopRuleProcessing || false,
      ActivationDate: iso8601ToUnixTimestamp(rule.ActivationDate),
      ExpiryDate: iso8601ToUnixTimestamp(rule.ExpiryDate),
      applyToAllMessages: activeConditions.length === 0,
      conditionType: activeConditions,
      actionType: activeActions,
      exceptionType: activeExceptions,
      tenantFilter: currentTenant,
    };

    // Add all condition values
    Object.keys(conditionFieldMap).forEach(field => {
      if (rule[field] !== null && rule[field] !== undefined) {
        if (field === "FromScope" || field === "SentToScope") {
          formData[field] = rule[field] 
            ? { value: rule[field], label: rule[field] === "InOrganization" ? "Inside the organization" : "Outside the organization" }
            : undefined;
        } else if (field === "WithImportance") {
          formData[field] = rule[field] 
            ? { value: rule[field], label: rule[field] }
            : undefined;
        } else if (field === "MessageTypeMatches") {
          formData[field] = rule[field] 
            ? { value: rule[field], label: rule[field] }
            : undefined;
        } else if (field === "SCLOver") {
          formData[field] = rule[field] !== null
            ? { value: rule[field].toString(), label: rule[field].toString() }
            : undefined;
        } else if (field === "SenderIpRanges") {
          // Transform array of IP strings to autocomplete format
          if (Array.isArray(rule[field])) {
            formData[field] = rule[field].map(ip => ({ value: ip, label: ip }));
          } else {
            formData[field] = rule[field];
          }
        } else if (
          // Fields that use creatable autocomplete with API (users/groups)
          field === "From" || field === "SentTo" || 
          field === "AnyOfToHeader" || field === "AnyOfCcHeader" || field === "AnyOfToCcHeader" ||
          field === "FromMemberOf" || field === "SentToMemberOf" || 
          field === "AnyOfToHeaderMemberOf" || field === "AnyOfCcHeaderMemberOf" || field === "AnyOfToCcHeaderMemberOf"
        ) {
          // Transform array of email/UPN strings to autocomplete format
          if (Array.isArray(rule[field])) {
            formData[field] = rule[field].map(item => ({ value: item, label: item }));
          } else {
            formData[field] = rule[field];
          }
        } else {
          formData[field] = rule[field];
        }
      }
      if (field === "HeaderContainsWords" && rule.HeaderContainsMessageHeader) {
        formData.HeaderContainsWordsMessageHeader = rule.HeaderContainsMessageHeader;
      }
      if (field === "HeaderMatchesPatterns" && rule.HeaderMatchesMessageHeader) {
        formData.HeaderMatchesPatternsMessageHeader = rule.HeaderMatchesMessageHeader;
      }
    });

    // Add all action values
    if (rule.RejectMessageReasonText) formData.RejectMessageReasonText = rule.RejectMessageReasonText;
    if (rule.RejectMessageEnhancedStatusCode) formData.RejectMessageEnhancedStatusCode = rule.RejectMessageEnhancedStatusCode;
    if (rule.SetHeaderName) formData.SetHeaderName = rule.SetHeaderName;
    if (rule.SetHeaderValue) formData.SetHeaderValue = rule.SetHeaderValue;
    if (rule.ApplyHtmlDisclaimerText) formData.ApplyHtmlDisclaimerText = rule.ApplyHtmlDisclaimerText;
    if (rule.ApplyHtmlDisclaimerLocation) {
      formData.ApplyHtmlDisclaimerLocation = { value: rule.ApplyHtmlDisclaimerLocation, label: rule.ApplyHtmlDisclaimerLocation };
    }
    if (rule.ApplyHtmlDisclaimerFallbackAction) {
      formData.ApplyHtmlDisclaimerFallbackAction = { value: rule.ApplyHtmlDisclaimerFallbackAction, label: rule.ApplyHtmlDisclaimerFallbackAction };
    }
    
    Object.keys(actionFieldMap).forEach(field => {
      if (rule[field] !== null && rule[field] !== undefined && !formData[field]) {
        if (field === "SetSCL" && rule[field] !== null) {
          formData[field] = { value: rule[field].toString(), label: rule[field].toString() };
        } else {
          formData[field] = rule[field];
        }
      }
    });

    // Add all exception values
    Object.keys(conditionFieldMap).forEach(field => {
      const exceptionField = `ExceptIf${field}`;
      if (rule[exceptionField] !== null && rule[exceptionField] !== undefined) {
        if (field === "FromScope" || field === "SentToScope") {
          formData[exceptionField] = rule[exceptionField] 
            ? { value: rule[exceptionField], label: rule[exceptionField] === "InOrganization" ? "Inside the organization" : "Outside the organization" }
            : undefined;
        } else if (field === "WithImportance") {
          formData[exceptionField] = rule[exceptionField] 
            ? { value: rule[exceptionField], label: rule[exceptionField] }
            : undefined;
        } else if (field === "MessageTypeMatches") {
          formData[exceptionField] = rule[exceptionField] 
            ? { value: rule[exceptionField], label: rule[exceptionField] }
            : undefined;
        } else if (field === "SCLOver") {
          formData[exceptionField] = rule[exceptionField] !== null
            ? { value: rule[exceptionField].toString(), label: rule[exceptionField].toString() }
            : undefined;
        } else if (field === "SenderIpRanges") {
          // Transform array of IP strings to autocomplete format
          if (Array.isArray(rule[exceptionField])) {
            formData[exceptionField] = rule[exceptionField].map(ip => ({ value: ip, label: ip }));
          } else {
            formData[exceptionField] = rule[exceptionField];
          }
        } else if (
          // Fields that use creatable autocomplete with API (users/groups)
          field === "From" || field === "SentTo" || 
          field === "AnyOfToHeader" || field === "AnyOfCcHeader" || field === "AnyOfToCcHeader" ||
          field === "FromMemberOf" || field === "SentToMemberOf" || 
          field === "AnyOfToHeaderMemberOf" || field === "AnyOfCcHeaderMemberOf" || field === "AnyOfToCcHeaderMemberOf"
        ) {
          // Transform array of email/UPN strings to autocomplete format
          if (Array.isArray(rule[exceptionField])) {
            formData[exceptionField] = rule[exceptionField].map(item => ({ value: item, label: item }));
          } else {
            formData[exceptionField] = rule[exceptionField];
          }
        } else {
          formData[exceptionField] = rule[exceptionField];
        }
      }
      if (field === "HeaderContainsWords" && rule[`ExceptIfHeaderContainsMessageHeader`]) {
        formData.ExceptIfHeaderContainsWordsMessageHeader = rule.ExceptIfHeaderContainsMessageHeader;
      }
      if (field === "HeaderMatchesPatterns" && rule[`ExceptIfHeaderMatchesMessageHeader`]) {
        formData.ExceptIfHeaderMatchesPatternsMessageHeader = rule.ExceptIfHeaderMatchesMessageHeader;
      }
    });

    return formData;
  }, [ruleInfo.isSuccess, ruleInfo.data, currentTenant, isEditMode]);

  // Reset form with processed data
  const resetForm = useCallback(() => {
    if (processedRuleData) {
      formControl.reset(processedRuleData);
    }
  }, [processedRuleData, formControl]);

  useEffect(() => {
    if (drawerVisible && isEditMode) {
      resetForm();
    }
  }, [resetForm, drawerVisible, isEditMode]);

  // Custom data formatter for API submission
  const customDataFormatter = useCallback(
    (values) => {
      const rule = ruleInfo.data?.Results 
        ? (Array.isArray(ruleInfo.data.Results) ? ruleInfo.data.Results[0] : ruleInfo.data.Results)
        : (Array.isArray(ruleInfo.data) ? ruleInfo.data[0] : ruleInfo.data);
      
      const apiData = {
        tenantFilter: currentTenant,
        Name: values.Name,
        Priority: values.Priority,
        Comments: values.Comments,
        State: values.Enabled ? "Enabled" : "Disabled",
        Mode: values.Mode?.value || values.Mode,
        SetAuditSeverity: values.SetAuditSeverity?.value || values.SetAuditSeverity,
        SenderAddressLocation: values.SenderAddressLocation?.value || values.SenderAddressLocation,
        StopRuleProcessing: values.StopRuleProcessing,
        ActivationDate: values.ActivationDate,
        ExpiryDate: values.ExpiryDate,
      };

      if (isEditMode && rule) {
        apiData.ruleId = rule.Guid || rule.Identity || rule.Name;
      }

      const conditionTypes = values.conditionType || [];
      conditionTypes.forEach(condition => {
        const conditionValue = condition.value || condition;
        if (values[conditionValue] !== undefined) {
          const fieldValue = values[conditionValue];
          
          // Handle single object with value property
          if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue) && fieldValue.value !== undefined) {
            apiData[conditionValue] = fieldValue.value;
          } 
          // Handle array of objects with value property (for creatable autocomplete fields)
          else if (Array.isArray(fieldValue)) {
            apiData[conditionValue] = fieldValue.map(item => {
              if (item && typeof item === 'object' && item.value !== undefined) {
                return item.value;
              }
              return item;
            });
          } 
          // Handle plain values
          else {
            apiData[conditionValue] = fieldValue;
          }
        }
        if (conditionValue === "HeaderContainsWords" && values.HeaderContainsWordsMessageHeader) {
          apiData.HeaderContainsMessageHeader = values.HeaderContainsWordsMessageHeader;
          apiData.HeaderContainsWords = values.HeaderContainsWords;
        }
        if (conditionValue === "HeaderMatchesPatterns" && values.HeaderMatchesPatternsMessageHeader) {
          apiData.HeaderMatchesMessageHeader = values.HeaderMatchesPatternsMessageHeader;
          apiData.HeaderMatchesPatterns = values.HeaderMatchesPatterns;
        }
      });

      const actionTypes = values.actionType || [];
      actionTypes.forEach(action => {
        const actionValue = action.value || action;
        
        if (actionValue === "RejectMessage") {
          if (values.RejectMessageReasonText) {
            apiData.RejectMessageReasonText = values.RejectMessageReasonText;
          }
          if (values.RejectMessageEnhancedStatusCode) {
            apiData.RejectMessageEnhancedStatusCode = values.RejectMessageEnhancedStatusCode;
          }
        } else if (actionValue === "SetHeader") {
          if (values.SetHeaderName) apiData.SetHeaderName = values.SetHeaderName;
          if (values.SetHeaderValue) apiData.SetHeaderValue = values.SetHeaderValue;
        } else if (actionValue === "ApplyHtmlDisclaimer") {
          if (values.ApplyHtmlDisclaimerText) {
            apiData.ApplyHtmlDisclaimerText = values.ApplyHtmlDisclaimerText;
          }
          if (values.ApplyHtmlDisclaimerLocation) {
            const location = values.ApplyHtmlDisclaimerLocation;
            apiData.ApplyHtmlDisclaimerLocation = location?.value || location;
          }
          if (values.ApplyHtmlDisclaimerFallbackAction) {
            const fallback = values.ApplyHtmlDisclaimerFallbackAction;
            apiData.ApplyHtmlDisclaimerFallbackAction = fallback?.value || fallback;
          }
        } else if (values[actionValue] !== undefined) {
          const fieldValue = values[actionValue];
          
          // Handle single object with value property
          if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue) && fieldValue.value !== undefined) {
            apiData[actionValue] = fieldValue.value;
          } 
          // Handle array of objects with value property (for creatable autocomplete fields)
          else if (Array.isArray(fieldValue)) {
            apiData[actionValue] = fieldValue.map(item => {
              if (item && typeof item === 'object' && item.value !== undefined) {
                return item.value;
              }
              return item;
            });
          } 
          // Handle plain values
          else {
            apiData[actionValue] = fieldValue;
          }
        }
      });

      const exceptionTypes = values.exceptionType || [];
      exceptionTypes.forEach(exception => {
        const exceptionValue = exception.value || exception;
        if (values[exceptionValue] !== undefined) {
          const fieldValue = values[exceptionValue];
          
          // Handle single object with value property
          if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue) && fieldValue.value !== undefined) {
            apiData[exceptionValue] = fieldValue.value;
          } 
          // Handle array of objects with value property (for creatable autocomplete fields)
          else if (Array.isArray(fieldValue)) {
            apiData[exceptionValue] = fieldValue.map(item => {
              if (item && typeof item === 'object' && item.value !== undefined) {
                return item.value;
              }
              return item;
            });
          } 
          // Handle plain values
          else {
            apiData[exceptionValue] = fieldValue;
          }
        }
        if (exceptionValue === "ExceptIfHeaderContainsWords" && values.ExceptIfHeaderContainsWordsMessageHeader) {
          apiData.ExceptIfHeaderContainsMessageHeader = values.ExceptIfHeaderContainsWordsMessageHeader;
          apiData.ExceptIfHeaderContainsWords = values.ExceptIfHeaderContainsWords;
        }
        if (exceptionValue === "ExceptIfHeaderMatchesPatterns" && values.ExceptIfHeaderMatchesPatternsMessageHeader) {
          apiData.ExceptIfHeaderMatchesMessageHeader = values.ExceptIfHeaderMatchesPatternsMessageHeader;
          apiData.ExceptIfHeaderMatchesPatterns = values.ExceptIfHeaderMatchesPatterns;
        }
      });

      return apiData;
    },
    [currentTenant, ruleInfo.data, isEditMode]
  );

  // Helper function to get field names for a condition
  const getConditionFieldNames = (conditionValue) => {
    const fields = [conditionValue];
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

    const removedConditions = oldConditionValues.filter(
      oldVal => !newConditionValues.includes(oldVal)
    );

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

    const removedActions = oldActionValues.filter(
      oldVal => !newActionValues.includes(oldVal)
    );

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

    const removedExceptions = oldExceptionValues.filter(
      oldVal => !newExceptionValues.includes(oldVal)
    );

    removedExceptions.forEach(exceptionValue => {
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

  // Handle "Apply to all messages" logic
  useEffect(() => {
    if (applyToAllMessagesWatch) {
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
    { value: "FromMemberOf", label: "The sender is a member of..." },
    { value: "SentTo", label: "The recipient is..." },
    { value: "SentToScope", label: "The recipient is located..." },
    { value: "SentToMemberOf", label: "The recipient is a member of..." },
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
    { value: "SenderIpRanges", label: "Sender IP address belongs to any of these ranges..." },
    { value: "HeaderContainsWords", label: "Message header contains words..." },
    { value: "HeaderMatchesPatterns", label: "Message header matches patterns..." },
    { value: "AnyOfToHeader", label: "Any To header contains..." },
    { value: "AnyOfToHeaderMemberOf", label: "Any To header is a member of..." },
    { value: "AnyOfCcHeader", label: "Any Cc header contains..." },
    { value: "AnyOfCcHeaderMemberOf", label: "Any Cc header is a member of..." },
    { value: "AnyOfToCcHeader", label: "Any To or Cc header contains..." },
    { value: "AnyOfToCcHeaderMemberOf", label: "Any To or Cc header is a member of..." },
    { value: "RecipientAddressContainsWords", label: "Recipient address contains words..." },
    { value: "RecipientAddressMatchesPatterns", label: "Recipient address matches patterns..." },
    { value: "AnyOfRecipientAddressContainsWords", label: "Any recipient address contains words..." },
    { value: "AnyOfRecipientAddressMatchesPatterns", label: "Any recipient address matches patterns..." },
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
      case "AnyOfToHeader":
      case "AnyOfCcHeader":
      case "AnyOfToCcHeader":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
              multiple={true}
              creatable={true}
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

      case "FromMemberOf":
      case "SentToMemberOf":
      case "AnyOfToHeaderMemberOf":
      case "AnyOfCcHeaderMemberOf":
      case "AnyOfToCcHeaderMemberOf":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
              multiple={true}
              creatable={true}
              api={{
                url: "/api/ListGraphRequest",
                data: {
                  Endpoint: "groups",
                  tenantFilter: currentTenant,
                  $select: "id,displayName,mail",
                  $top: 999,
                },
                labelField: (option) => `${option.displayName}${option.mail ? ` (${option.mail})` : ''}`,
                valueField: "mail",
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
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
            />
          </Grid>
        );

      case "SenderIpRanges":
        return (
          <Grid size={12} key={conditionValue}>
            <CippFormComponent
              type="autoComplete"
              label={conditionLabel}
              name={conditionValue}
              formControl={formControl}
              multiple={true}
              creatable={true}
              options={[]}
              placeholder="Enter IP addresses or CIDR ranges (e.g., 192.168.1.1 or 10.0.0.0/24)"
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

    const mockCondition = { value: baseCondition, label: exceptionLabel };
    const field = renderConditionField(mockCondition);

    if (field) {
      return cloneElement(field, {
        key: exceptionValue,
        children: React.Children.map(field.props.children, (child) => {
          if (child?.type === CippFormComponent) {
            return cloneElement(child, {
              name: exceptionValue,
            });
          }
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

  const handleSubmit = () => {
    formControl.trigger();
    const formData = formControl.getValues();
    const apiData = customDataFormatter(formData);

    submitRule.mutate({
      url: "/api/AddEditTransportRule",
      data: apiData,
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset(defaultFormValues);
    setSelectedConditions([]);
    setSelectedActions([]);
    setSelectedExceptions([]);
  };

  const rule = ruleInfo.data?.Results 
    ? (Array.isArray(ruleInfo.data.Results) ? ruleInfo.data.Results[0] : ruleInfo.data.Results)
    : (Array.isArray(ruleInfo.data) ? ruleInfo.data[0] : ruleInfo.data);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (submitRule.isSuccess) {
      queryClient.invalidateQueries({ queryKey: [`ListTransportRules-${ruleId}`]});
      queryClient.invalidateQueries({ queryKey: [`Transport Rules - ${currentTenant}`]});
      onSuccess();
    }
  }, [submitRule.isSuccess, queryClient, ruleId, currentTenant, onSuccess]);

  return (
    <>
      {rowAction === false && !drawerVisible && (
        <PermissionButton
          requiredPermissions={requiredPermissions}
          onClick={() => setDrawerVisible(true)}
          startIcon={isEditMode ? <Edit /> : <RocketLaunch />}
        >
          {buttonText}
        </PermissionButton>
      )}
      <CippOffCanvas
        title={isEditMode ? `Edit Rule: ${rule?.Name || ""}` : "New Transport Rule"}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="xl"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              {submitRule.isLoading
                ? isEditMode ? "Updating..." : "Creating..."
                : isEditMode ? "Update Rule" : "Create Rule"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Cancel
            </Button>
          </div>
        }
      >
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
                  { value: "AuditAndNotify", label: "Test with Policy Tips" },
                  { value: "Audit", label: "Test without Policy Tips" },
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

            <CippApiResults apiObject={submitRule} />
          </Grid>
      </CippOffCanvas>
    </>
  );
};