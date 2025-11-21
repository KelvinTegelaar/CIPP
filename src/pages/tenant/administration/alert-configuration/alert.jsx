import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  SvgIcon,
  IconButton,
  Skeleton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Grid } from "@mui/system";
import { ArrowLeftIcon } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import { useForm, useFormState, useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import alertList from "/src/data/alerts.json";
import auditLogTemplates from "/src/data/AuditLogTemplates";
import auditLogSchema from "/src/data/AuditLogSchema.json";
import { Save, Delete } from "@mui/icons-material";

import { Layout as DashboardLayout } from "/src/layouts/index.js"; // Dashboard layout
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";

const AlertWizard = () => {
  const apiRequest = ApiPostCall({
    relatedQueryKeys: ["ListAlertsQueue", "ListCurrentAlerts"],
  });
  const router = useRouter();
  const [editAlert, setAlertEdit] = useState(false);
  useEffect(() => {
    if (router.query.id) {
      setAlertEdit(true);
    }
  }, [router]);

  const existingAlert = ApiGetCall({
    url: "/api/ListAlertsQueue",
    relatedQueryKeys: "ListAlertsQueue",
    queryKey: "ListCurrentAlerts",
  });
  const [recurrenceOptions, setRecurrenceOptions] = useState([
    { value: "30m", label: "Every 30 minutes" },
    { value: "1h", label: "Every hour" },
    { value: "4h", label: "Every 4 hours" },
    { value: "1d", label: "Every 1 day" },
    { value: "7d", label: "Every 7 days" },
    { value: "30d", label: "Every 30 days" },
    { value: "365d", label: "Every 365 days" },
  ]);

  const postExecutionOptions = [
    { label: "Webhook", value: "Webhook" },
    { label: "Email", value: "Email" },
    { label: "PSA", value: "PSA" },
  ];
  const actionsToTake = [
    //{ value: 'cippcommand', label: 'Execute a CIPP Command' },
    { value: "becremediate", label: "Execute a BEC Remediate" },
    { value: "disableuser", label: "Disable the user in the log entry" },
    // { value: 'generatelog', label: 'Generate a log entry' },
    { value: "generatemail", label: "Generate an email" },
    { value: "generatePSA", label: "Generate a PSA ticket" },
    { value: "generateWebhook", label: "Generate a webhook" },
  ];

  const logbookOptions = [
    { value: "Audit.AzureActiveDirectory", label: "Azure AD" },
    { value: "Audit.Exchange", label: "Exchange" },
  ];

  // Existing alert load effect moved below state declarations for guard usage

  const [alertType, setAlertType] = useState("none");
  // Track condition row indices; start empty to avoid off-by-one when loading presets
  const [addedEvent, setAddedEvent] = useState([]);
  const [isLoadingPreset, setIsLoadingPreset] = useState(false); // Guard against clearing during preset load
  const [isLoadingExistingAlert, setIsLoadingExistingAlert] = useState(false); // Guard during existing alert load
  const [hasLoadedExistingAlert, setHasLoadedExistingAlert] = useState(false); // Prevent double-load
  const prevOperatorValuesRef = useRef([]); // Track previous operator values
  const originalMembershipInputsRef = useRef({}); // Preserve original in/notIn arrays for rehydration

  const formControl = useForm({ mode: "onChange" });
  const selectedPreset = useWatch({ control: formControl.control, name: "preset" }); // Watch the preset
  const commandValue = useWatch({ control: formControl.control, name: "command" });
  const logbookWatcher = useWatch({ control: formControl.control, name: "logbook" });
  const propertyWatcher = useWatch({ control: formControl.control, name: "conditions" });

  // Clear input value only on actual operator transitions, skip while preset loading
  useEffect(() => {
    if (!propertyWatcher || isLoadingPreset || isLoadingExistingAlert) return;
    propertyWatcher.forEach((condition, index) => {
      const currentOp = condition?.Operator?.value?.toLowerCase();
      if (!currentOp) return;
      const prevOp = prevOperatorValuesRef.current[index];
      if (currentOp !== prevOp) {
        const isInOrNotIn = currentOp === "in" || currentOp === "notin";
        const isStringProperty = condition?.Property?.value === "String";
        if (isInOrNotIn) {
          formControl.setValue(`conditions.${index}.Input`, [], { shouldValidate: false });
        } else {
          if (isStringProperty) {
            formControl.setValue(
              `conditions.${index}.Input`,
              { value: "" },
              { shouldValidate: false }
            );
          } else {
            formControl.setValue(`conditions.${index}.Input`, "", { shouldValidate: false });
          }
        }
        prevOperatorValuesRef.current[index] = currentOp;
      }
    });
  }, [propertyWatcher, isLoadingPreset, isLoadingExistingAlert]);
  // Load existing alert (edit mode) with guarded batching similar to preset loading
  useEffect(() => {
    if (existingAlert.isSuccess && editAlert && !hasLoadedExistingAlert) {
      const alert = existingAlert?.data?.find((a) => a.RowKey === router.query.id);
      if (!alert) return;
      setHasLoadedExistingAlert(true); // Mark as loaded to prevent re-execution
      // Scripted alert path (no conditions operator clearing needed)
      if (alert?.LogType === "Scripted") {
        setAlertType("script");
        const excludedTenantsFormatted = Array.isArray(alert.excludedTenants)
          ? alert.excludedTenants.map((tenant) => ({ value: tenant, label: tenant }))
          : [];
        const usedCommand = alertList?.find(
          (cmd) => cmd.name === alert.RawAlert.Command.replace("Get-CIPPAlert", "")
        );
        const recurrenceOption = recurrenceOptions?.find(
          (opt) => opt.value === alert.RawAlert.Recurrence
        );
        const postExecutionValue = postExecutionOptions.filter((opt) =>
          alert.RawAlert.PostExecution.split(",").includes(opt.value)
        );
        let tenantFilterForForm;
        if (alert.RawAlert.TenantGroup) {
          try {
            const tenantGroupObject = JSON.parse(alert.RawAlert.TenantGroup);
            tenantFilterForForm = {
              value: tenantGroupObject.value,
              label: tenantGroupObject.label,
              type: "Group",
              addedFields: tenantGroupObject,
            };
          } catch (error) {
            console.error("Error parsing tenant group:", error);
            tenantFilterForForm = {
              value: alert.RawAlert.Tenant,
              label: alert.RawAlert.Tenant,
              type: "Tenant",
            };
          }
        } else {
          tenantFilterForForm = {
            value: alert.RawAlert.Tenant,
            label: alert.RawAlert.Tenant,
            type: "Tenant",
          };
        }
        let startDateTimeForForm = null;
        if (alert.RawAlert.DesiredStartTime && alert.RawAlert.DesiredStartTime !== "0") {
          const desiredStartEpoch = parseInt(alert.RawAlert.DesiredStartTime);
          startDateTimeForForm = desiredStartEpoch;
        }
        const resetObject = {
          tenantFilter: tenantFilterForForm,
          excludedTenants: excludedTenantsFormatted,
          command: { value: usedCommand, label: usedCommand.label },
          recurrence: recurrenceOption,
          postExecution: postExecutionValue,
          startDateTime: startDateTimeForForm,
          AlertComment: alert.RawAlert.AlertComment || "",
        };
        if (usedCommand?.requiresInput && alert.RawAlert.Parameters) {
          try {
            const params =
              typeof alert.RawAlert.Parameters === "string"
                ? JSON.parse(alert.RawAlert.Parameters)
                : alert.RawAlert.Parameters;
            if (params.InputValue) {
              resetObject[usedCommand.inputName] = params.InputValue;
            }
          } catch (error) {
            console.error("Error parsing parameters:", error);
          }
        }
        formControl.reset(resetObject, { keepDirty: false });
      }
      // Audit alert path
      if (alert?.PartitionKey === "Webhookv2") {
        setAlertType("audit");
        setIsLoadingExistingAlert(true);
        const foundLogbook = logbookOptions?.find(
          (logbook) => logbook.value === alert.RawAlert.type
        );
        const rawConditions = alert.RawAlert.Conditions || [];
        const formattedConditions = rawConditions.map((cond) => {
          const opVal = cond?.Operator?.value || "";
          const lower = opVal.toLowerCase();
          const mappedOp = lower === "notin" ? "notIn" : lower; // keep UI canonical value
          const normalizedOperator = { ...cond.Operator, value: mappedOp };
          const isString = cond?.Property?.value === "String";
          const isList = cond?.Property?.value?.startsWith("List:");
          const isInSet = mappedOp === "in" || mappedOp === "notIn";
          let Input;
          // For in/notIn operators, always treat Input as array regardless of Property type
          if (isInSet) {
            Input = Array.isArray(cond.Input) ? cond.Input : [];
            // Normalize items to {value, label} consistently and store original
            Input = Input.map((item) => {
              if (typeof item === "string") return { value: item, label: item };
              if (item && typeof item === "object") {
                return {
                  value: item.value ?? item.label ?? "",
                  label: item.label ?? item.value ?? "",
                };
              }
              return { value: "", label: "" };
            });
          } else if (isString) {
            Input = { value: cond.Input?.value ?? "" };
          } else {
            Input = cond.Input ?? (isList ? [] : "");
          }
          return { Property: cond.Property, Operator: normalizedOperator, Input };
        });
        const resetData = {
          RowKey: router.query.clone ? undefined : router.query.id ? router.query.id : undefined,
          tenantFilter: alert.RawAlert.Tenants,
          excludedTenants: alert.excludedTenants?.filter((t) => t !== null) || [],
          Actions: alert.RawAlert.Actions,
          logbook: foundLogbook,
          AlertComment: alert.RawAlert.AlertComment || "",
          conditions: [], // Include empty array to register field structure
        };
        // Reset first without spawning rows to avoid rendering empty operator fields
        formControl.reset(resetData);
        // Set conditions in timeout to ensure proper registration after reset
        setTimeout(() => {
          // Seed previous operator values BEFORE setting conditions to prevent clearing
          prevOperatorValuesRef.current = formattedConditions.map((c) =>
            (c.Operator?.value || "").toLowerCase()
          );

          // Process each condition with proper normalization
          const processedConditions = formattedConditions.map((cond, idx) => {
            let finalInput = cond.Input;
            const isList = cond.Property?.value?.startsWith("List:");
            const operatorVal = cond.Operator?.value;
            const isMembership = operatorVal === "in" || operatorVal === "notIn";

            // Normalize based on operator and property type
            if (Array.isArray(finalInput)) {
              finalInput = finalInput.map((item) =>
                typeof item === "string" ? { label: item, value: item } : item
              );
              // Further ensure label/value presence and rebuild from schema if possible
              const schemaOptions = auditLogSchema[cond.Property?.value] || [];
              finalInput = finalInput.map((item) => {
                const match = schemaOptions.find((opt) => opt.value === item.value);
                return {
                  value: item.value,
                  label: item.label || match?.label || item.value,
                };
              });
              originalMembershipInputsRef.current[idx] = finalInput;
            } else if (isList && !isMembership) {
              // Single selection list value
              if (typeof finalInput === "string") {
                finalInput = { label: finalInput, value: finalInput };
              } else if (
                finalInput &&
                typeof finalInput === "object" &&
                !finalInput.label &&
                finalInput.value
              ) {
                finalInput = { label: finalInput.value, value: finalInput.value };
              }
            }

            return {
              Property: cond.Property,
              Operator: cond.Operator,
              Input: finalInput,
            };
          });

          // Set the entire conditions array at once with processed values
          formControl.setValue("conditions", processedConditions, {
            shouldValidate: false,
            shouldDirty: true,
            shouldTouch: false,
          });

          // Try setting individual paths as backup
          processedConditions.forEach((cond, idx) => {
            formControl.setValue(`conditions.${idx}`, cond, { shouldValidate: false });
          });

          // Spawn condition rows only after conditions exist to ensure autocomplete visibility
          setAddedEvent(processedConditions.map((_, i) => ({ id: i })));
          formControl.trigger();
          // Defer another snapshot to catch any async UI transformations
          setTimeout(() => {
            const deferredSnapshot = formControl.getValues("conditions") || [];
            // Rehydrate membership arrays if they were nulled out by Autocomplete uncontrolled clears
            deferredSnapshot.forEach((cond, idx) => {
              const op = cond?.Operator?.value;
              if (
                (op === "in" || op === "notIn") &&
                (cond.Input === null || cond.Input === undefined)
              ) {
                const original = originalMembershipInputsRef.current[idx];
                if (original && Array.isArray(original) && original.length > 0) {
                  formControl.setValue(`conditions.${idx}.Input`, original, {
                    shouldValidate: false,
                  });
                }
              }
            });
          }, 150);
          setIsLoadingExistingAlert(false);
        }, 100);
      }
    }
  }, [existingAlert.isSuccess, router, editAlert]);

  useEffect(() => {
    formControl.reset();
  }, [alertType]);

  useEffect(() => {
    if (commandValue && commandValue.value?.recommendedRunInterval) {
      const updatedRecurrenceOptions = recurrenceOptions.map((opt) => ({
        ...opt,
        label: opt.label.replace(" (Recommended)", ""), // Clear any previous "Recommended" text
      }));

      const recommendedOption = updatedRecurrenceOptions?.find(
        (opt) => opt.value === commandValue.value.recommendedRunInterval
      );

      if (recommendedOption) {
        recommendedOption.label += " (Recommended)";
      }
      setRecurrenceOptions(updatedRecurrenceOptions);

      // Only set the recommended recurrence if we're NOT editing an existing alert
      if (!editAlert) {
        formControl.setValue("recurrence", recommendedOption);
      }
    }
  }, [commandValue, editAlert]);

  useEffect(() => {
    if (!selectedPreset) return;
    setIsLoadingPreset(true);
    const selectedTemplate = auditLogTemplates?.find(
      (template) => template.value === selectedPreset.value
    );
    if (!selectedTemplate) {
      setIsLoadingPreset(false);
      return;
    }
    const rawConditions = selectedTemplate.template.conditions || [];
    const formattedConditions = rawConditions.map((condition) => {
      const opVal = condition.Operator?.value || "";
      const lower = opVal.toLowerCase();
      const mappedOp = lower === "notin" ? "notIn" : lower; // keep UI canonical value for notIn
      const normalizedOp = { ...condition.Operator, value: mappedOp };
      const isString = condition.Property?.value === "String";
      const isList = condition.Property?.value?.startsWith("List:");
      const isInSet = mappedOp === "in" || mappedOp === "notIn";
      let Input;
      if (isString) {
        Input = { value: condition.Input?.value ?? "" };
      } else if (isList && isInSet) {
        Input = Array.isArray(condition.Input) ? condition.Input : [];
      } else {
        Input = condition.Input ?? (isList ? [] : "");
      }
      return { Property: condition.Property, Operator: normalizedOp, Input };
    });
    formControl.setValue("conditions", formattedConditions);
    if (selectedTemplate.template.logbook) {
      formControl.setValue("logbook", selectedTemplate.template.logbook);
    }
    setAddedEvent(formattedConditions.map((_, i) => ({ id: i })));
    prevOperatorValuesRef.current = formattedConditions.map((c) =>
      (c.Operator?.value || "").toLowerCase()
    );
    // Ensure React Hook Form registers nested fields before releasing the guard
    setTimeout(() => {
      formattedConditions.forEach((cond, idx) => {
        if (cond.Property?.value === "String") {
          formControl.setValue(`conditions.${idx}.Input.value`, cond.Input?.value ?? "", {
            shouldValidate: false,
          });
        } else {
          formControl.setValue(`conditions.${idx}.Input`, cond.Input, { shouldValidate: false });
        }
      });
      setIsLoadingPreset(false);
    }, 75);
  }, [selectedPreset]);

  const getAuditLogSchema = (logbook) => {
    const common = auditLogSchema.Common;
    const log = auditLogSchema[logbook];
    const combined = { ...common, ...log };
    return Object.keys(combined).map((key) => ({
      label: key,
      value: combined[key],
    }));
  };

  const handleAuditSubmit = (values) => {
    values.conditions = values.conditions.filter((condition) => condition?.Property);
    apiRequest.mutate(
      { url: "/api/AddAlert", data: values },
      {
        onSuccess: () => {
          // Prevent form reload after successful save
          setHasLoadedExistingAlert(true);
        },
      }
    );
  };

  const handleScriptSubmit = (values) => {
    const getInputParams = () => {
      if (values.command.value.requiresInput) {
        return {
          InputValue: values[values.command.value.inputName],
        };
      }
      return {};
    };

    const postObject = {
      RowKey: router.query.clone ? undefined : router.query.id ? router.query.id : undefined,
      tenantFilter: values.tenantFilter,
      excludedTenants: values.excludedTenants,
      Name: `${values.tenantFilter?.label || values.tenantFilter?.value}: ${values.command.label}`,
      Command: { value: `Get-CIPPAlert${values.command.value.name}` },
      Parameters: getInputParams(),
      ScheduledTime: Math.floor(new Date().getTime() / 1000) + 60,
      DesiredStartTime: values.startDateTime ? values.startDateTime.toString() : null,
      Recurrence: values.recurrence,
      PostExecution: values.postExecution,
      AlertComment: values.AlertComment,
    };
    apiRequest.mutate(
      { url: "/api/AddScheduledItem?hidden=true", data: postObject },
      {
        onSuccess: () => {
          // Prevent form reload after successful save
          setHasLoadedExistingAlert(true);
        },
      }
    );
  };

  const handleAddCondition = () => {
    const currentConditions = formControl.getValues("conditions") || [];
    // Append a blank condition placeholder so indices align immediately
    currentConditions.push({ Property: null, Operator: null, Input: null });
    formControl.setValue("conditions", currentConditions, { shouldValidate: false });
    setAddedEvent(currentConditions.map((_, idx) => ({ id: idx })));
  };

  const handleRemoveCondition = (id) => {
    const currentConditions = formControl.getValues("conditions") || [];
    const updatedConditions = currentConditions.filter((_, index) => index !== id);
    formControl.setValue("conditions", updatedConditions, { shouldValidate: false });
    // Rebuild addedEvent to keep ids aligned with new indices
    setAddedEvent(updatedConditions.map((_, idx) => ({ id: idx })));
  };

  const { isValid } = useFormState({ control: formControl.control });
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth={"xl"}>
        <Stack spacing={4}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              color="inherit"
              onClick={() => router.back()}
              startIcon={
                <SvgIcon fontSize="small">
                  <ArrowLeftIcon />
                </SvgIcon>
              }
            >
              Back to Alerts
            </Button>
          </Stack>
          {existingAlert.isLoading && <Skeleton />}
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="h4">{editAlert ? "Edit" : "Add"} Alert</Typography>
          </Stack>

          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardActionArea onClick={() => setAlertType("audit")}>
                  <CardContent>
                    <Typography variant="h6">Audit Log Alert</Typography>
                    <Typography variant="body2">
                      Select this option to create an alert based on a received Microsoft Audit log.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardActionArea onClick={() => setAlertType("script")}>
                  <CardContent>
                    <Typography variant="h6">Scripted CIPP Alert</Typography>
                    <Typography variant="body2">
                      Select this option to set up an alert based on data processed by CIPP.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Audit Log Form */}
            {alertType === "audit" && (
              <Grid
                container
                spacing={4}
                sx={{ mt: 2, width: "100%" }}
                justifyContent="space-around"
              >
                <Grid size={12}>
                  <form id="auditAlertForm" onSubmit={formControl.handleSubmit(handleAuditSubmit)}>
                    <Grid container spacing={3} justifyContent="space-around">
                      <Grid size={12}>
                        <CippButtonCard title="Tenant Selector" sx={{ mb: 3 }}>
                          <Grid container spacing={3}>
                            <Grid size={12}>
                              <CippFormTenantSelector
                                multiple={true}
                                formControl={formControl}
                                allTenants={true}
                                label="Included Tenants for alert"
                                includeGroups={true}
                                required={true}
                                validators={{
                                  validate: (value) =>
                                    value?.length > 0 || "At least one tenant must be selected",
                                }}
                              />
                            </Grid>
                            <CippFormCondition
                              field="tenantFilter"
                              formControl={formControl}
                              compareType="valueContains"
                              compareValue="AllTenants"
                              clearOnHide={false}
                            >
                              <Grid size={12}>
                                <CippFormTenantSelector
                                  multiple={true}
                                  label="Excluded Tenants for alert"
                                  formControl={formControl}
                                  allTenants={false}
                                  name="excludedTenants"
                                />
                              </Grid>
                            </CippFormCondition>
                          </Grid>
                        </CippButtonCard>
                      </Grid>

                      <Grid size={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={
                            <Button
                              disabled={isValid ? false : true}
                              type="submit"
                              startIcon={<Save />}
                            >
                              Save Alert
                            </Button>
                          }
                          sx={{ mb: 3 }}
                        >
                          <Grid container spacing={3} sx={{ mb: 2 }}>
                            <Grid size={12}>
                              <CippFormComponent
                                type="autoComplete"
                                multiple={false}
                                name="preset"
                                formControl={formControl}
                                label="Select an alert preset, or customize your own"
                                options={auditLogTemplates.map((template) => ({
                                  value: template.value,
                                  label: template.name,
                                }))}
                              />
                            </Grid>

                            <Grid size={12}>
                              <CippFormComponent
                                type="autoComplete"
                                name="logbook"
                                multiple={false}
                                creatable={false}
                                formControl={formControl}
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                label="Select the log source"
                                options={logbookOptions}
                              />
                            </Grid>
                          </Grid>
                          <Grid size={12} sx={{ mb: 2 }}>
                            <Button
                              color="primary"
                              onClick={() => handleAddCondition()}
                              startIcon={
                                <SvgIcon>
                                  <PlusIcon />
                                </SvgIcon>
                              }
                            >
                              Add a condition
                            </Button>
                          </Grid>
                          {addedEvent.map((event) => (
                            <Grid
                              container
                              spacing={2}
                              justifyContent="space-around"
                              sx={{ mb: 2 }}
                              key={event.id}
                            >
                              <Grid size={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  label="Select property"
                                  options={getAuditLogSchema(logbookWatcher?.value)}
                                  creatable={true}
                                  onCreateOption={(option) => {
                                    const propertyName = option.label || option;

                                    // Return the option with String type for immediate use
                                    const newOption = {
                                      label: propertyName,
                                      value: "String", // Always set to String for custom properties
                                    };

                                    return newOption;
                                  }}
                                />
                              </Grid>
                              <Grid size={4}>
                                <CippFormComponent
                                  type="autoComplete"
                                  multiple={false}
                                  name={`conditions.${event.id}.Operator`}
                                  formControl={formControl}
                                  label="is"
                                  options={[
                                    { value: "eq", label: "Equals to" },
                                    { value: "ne", label: "Not Equals to" },
                                    { value: "like", label: "Like" },
                                    { value: "notlike", label: "Not like" },
                                    { value: "notmatch", label: "Does not match" },
                                    { value: "gt", label: "Greater than" },
                                    { value: "lt", label: "Less than" },
                                    { value: "in", label: "In" },
                                    { value: "notIn", label: "Not In" },
                                  ]}
                                />
                              </Grid>
                              <Grid size={3}>
                                {/* Show textField for String properties when NOT using in/notIn operators */}
                                <CippFormCondition
                                  field={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  compareType="contains"
                                  compareValue={"String"}
                                  clearOnHide={false}
                                >
                                  <CippFormCondition
                                    field={`conditions.${event.id}.Operator`}
                                    formControl={formControl}
                                    compareType="isNotOneOf"
                                    compareValue={[
                                      { value: "in", label: "In" },
                                      { value: "notIn", label: "Not In" },
                                    ]}
                                  >
                                    <CippFormComponent
                                      type="textField"
                                      name={`conditions.${event.id}.Input.value`}
                                      formControl={formControl}
                                      label="Input"
                                    />
                                  </CippFormCondition>
                                </CippFormCondition>

                                {/* Show autocomplete with creatable for in/notIn operators (any property type) */}
                                <CippFormCondition
                                  field={`conditions.${event.id}.Operator`}
                                  formControl={formControl}
                                  compareType="isOneOf"
                                  compareValue={[
                                    { value: "in", label: "In" },
                                    { value: "notIn", label: "Not In" },
                                  ]}
                                  clearOnHide={false}
                                >
                                  <CippFormComponent
                                    type="autoComplete"
                                    multiple={true}
                                    name={`conditions.${event.id}.Input`}
                                    formControl={formControl}
                                    label="Input"
                                    creatable={true}
                                    options={
                                      propertyWatcher?.[event.id]?.Property?.value?.startsWith(
                                        "List:"
                                      )
                                        ? auditLogSchema[
                                            propertyWatcher?.[event.id]?.Property?.value
                                          ]
                                        : []
                                    }
                                    onCreateOption={(inputValue) => {
                                      if (typeof inputValue === "string") {
                                        return { label: inputValue, value: inputValue };
                                      }
                                      return inputValue;
                                    }}
                                  />
                                </CippFormCondition>

                                {/* Show autocomplete for List properties when NOT using in/notIn operators */}
                                <CippFormCondition
                                  field={`conditions.${event.id}.Property`}
                                  formControl={formControl}
                                  compareType="contains"
                                  compareValue="List:"
                                  clearOnHide={false}
                                >
                                  <CippFormCondition
                                    field={`conditions.${event.id}.Operator`}
                                    formControl={formControl}
                                    compareType="isNotOneOf"
                                    compareValue={[
                                      { value: "in", label: "In" },
                                      { value: "notIn", label: "Not In" },
                                    ]}
                                  >
                                    <CippFormComponent
                                      type="autoComplete"
                                      multiple={
                                        propertyWatcher?.[event.id]?.Property?.multi ?? false
                                      }
                                      name={`conditions.${event.id}.Input`}
                                      formControl={formControl}
                                      label="Input"
                                      options={
                                        auditLogSchema[propertyWatcher?.[event.id]?.Property?.value]
                                      }
                                    />
                                  </CippFormCondition>
                                </CippFormCondition>
                              </Grid>
                              <Grid size={1}>
                                <Tooltip title="Remove condition">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRemoveCondition(event.id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          ))}

                          <Grid size={12} sx={{ mt: 2 }}>
                            <CippFormComponent
                              type="autoComplete"
                              name="Actions"
                              label="Actions to take"
                              validators={{
                                required: { value: true, message: "This field is required" },
                              }}
                              formControl={formControl}
                              multiple={true}
                              creatable={false}
                              options={actionsToTake}
                            />
                          </Grid>
                          <Grid size={12} sx={{ mt: 2 }}>
                            <CippFormComponent
                              type="textField"
                              name="AlertComment"
                              label="Alert Comment"
                              formControl={formControl}
                              multiline={true}
                              rows={3}
                              placeholder="Add documentation, FAQ links, or instructions for when this alert triggers..."
                            />
                          </Grid>
                          <Grid size={12} sx={{ mt: 2 }}>
                            <CippApiResults apiObject={apiRequest} />
                          </Grid>
                        </CippButtonCard>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            )}

            {/* Scripted CIPP Alert Form */}
            {alertType === "script" && (
              <Grid container spacing={3} sx={{ mt: 2, width: "100%" }}>
                <Grid size={12}>
                  <form
                    id="scriptAlertForm"
                    onSubmit={formControl.handleSubmit(handleScriptSubmit)}
                    disabled={isValid === false}
                  >
                    <Grid container spacing={3}>
                      <Grid size={12}>
                        <CippButtonCard title="Tenant Selector">
                          <Grid container spacing={3}>
                            <Grid size={12}>
                              <CippFormTenantSelector
                                allTenants={true}
                                multiple={false}
                                formControl={formControl}
                                label="Included Tenants for alert"
                                includeGroups={true}
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                              />
                            </Grid>
                            <CippFormCondition
                              field="tenantFilter"
                              formControl={formControl}
                              compareType="contains"
                              compareValue="AllTenants"
                              clearOnHide={false}
                            >
                              <Grid size={12}>
                                <CippFormTenantSelector
                                  multiple={true}
                                  label="Excluded Tenants for alert"
                                  formControl={formControl}
                                  allTenants={false}
                                  name="excludedTenants"
                                />
                              </Grid>
                            </CippFormCondition>
                          </Grid>
                        </CippButtonCard>
                      </Grid>

                      <Grid size={12}>
                        <CippButtonCard
                          title="Alert Criteria"
                          CardButton={
                            <Button
                              variant="contained"
                              disabled={isValid ? false : true}
                              type="submit"
                              startIcon={<Save />}
                            >
                              Save Alert
                            </Button>
                          }
                        >
                          <Grid spacing={2} container>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CippFormComponent
                                type="autoComplete"
                                validators={{ required: true }}
                                multiple={false}
                                creatable={false}
                                name="command"
                                formControl={formControl}
                                label="What alerting script should run"
                                validation={{ required: "This field is required" }}
                                options={alertList.map((cmd) => ({
                                  value: cmd,
                                  label: cmd.label,
                                }))}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <CippFormComponent
                                type="autoComplete"
                                multiple={false}
                                creatable={false}
                                name="recurrence"
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                formControl={formControl}
                                label="When should the alert run"
                                options={recurrenceOptions} // Use the state-managed recurrenceOptions here
                              />
                            </Grid>
                            <Grid size={12}>
                              <CippFormComponent
                                type="datePicker"
                                name="startDateTime"
                                formControl={formControl}
                                label="When should the first alert run?"
                                dateTimeType="datetime"
                              />
                            </Grid>
                            <Grid size={12}>
                              {commandValue?.value?.requiresInput && (
                                <CippFormComponent
                                  type={commandValue.value?.inputType}
                                  name={commandValue.value?.inputName}
                                  formControl={formControl}
                                  label={commandValue.value?.inputLabel}
                                />
                              )}
                            </Grid>
                            <Grid size={12}>
                              <CippFormComponent
                                type="autoComplete"
                                name="postExecution"
                                label="Alert via"
                                validators={{
                                  required: { value: true, message: "This field is required" },
                                }}
                                formControl={formControl}
                                multiple={true}
                                creatable={false}
                                options={postExecutionOptions}
                              />
                            </Grid>
                            <Grid size={12}>
                              <CippFormComponent
                                type="textField"
                                name="AlertComment"
                                label="Alert Comment"
                                formControl={formControl}
                                multiline={true}
                                rows={3}
                                placeholder="Add documentation, FAQ links, or instructions for when this alert triggers..."
                              />
                            </Grid>
                            <Grid size={12}>
                              <CippApiResults apiObject={apiRequest} />
                            </Grid>
                          </Grid>
                        </CippButtonCard>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
};

AlertWizard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AlertWizard;
