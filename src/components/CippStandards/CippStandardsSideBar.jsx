import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, Divider, Stack, SvgIcon, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { ActionList } from "/src/components/action-list";
import { ActionListItem } from "/src/components/action-list-item";
import CheckIcon from "@heroicons/react/24/outline/CheckIcon";
import CloseIcon from "@mui/icons-material/Close";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import _ from "lodash";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import ReactTimeAgo from "react-time-ago";
import { Alert } from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";

const StyledTimelineDot = (props) => {
  const { complete } = props;

  return (
    <TimelineDot
      sx={{
        alignSelf: "center",
        boxShadow: "none",
        flexShrink: 0,
        height: 36,
        justifyContent: "center",
        width: 36,
        backgroundColor: complete ? "success.main" : "error.main",
        borderColor: complete ? "success.main" : "error.main",
        color: complete ? "success.contrastText" : "error.contrastText",
      }}
    >
      <SvgIcon fontSize="small">{complete ? <CheckIcon /> : <CloseIcon />}</SvgIcon>
    </TimelineDot>
  );
};

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.neutral[800] : theme.palette.neutral[200],
  height: 24,
}));

const StyledTimelineContent = styled(TimelineContent)(({ theme }) => ({
  padding: "14px 16px",
  ...theme.typography.overline,
}));

const CippStandardsSideBar = ({
  title,
  selectedStandards,
  steps,
  actions,
  updatedAt,
  formControl,
  createDialog,
  edit,
  onSaveSuccess,
  onDriftConflictChange,
  isDriftMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [savedItem, setSavedItem] = useState(null);
  const [driftError, setDriftError] = useState("");

  const dialogAfterEffect = (id) => {
    setSavedItem(id);

    // Reset form's dirty state to prevent unsaved changes warning
    if (formControl && formControl.reset) {
      // Get current values and reset the form with them to clear dirty state
      const currentValues = formControl.getValues();
      formControl.reset(currentValues);
    }

    // Call the onSaveSuccess callback if provided
    if (typeof onSaveSuccess === "function") {
      onSaveSuccess();
    }
  };

  const watchForm = useWatch({ control: formControl.control });

  // Use proper CIPP ApiGetCall for drift validation
  const driftValidationApi = ApiGetCall({
    url: "/api/ListTenantAlignment",
    queryKey: "ListTenantAlignment-drift-validation",
  });

  // Get tenant groups for group membership validation
  const tenantGroupsApi = ApiGetCall({
    url: "/api/ListTenantGroups",
    queryKey: "ListTenantGroups-drift-validation",
  });

  // Helper function to expand groups to their member tenants
  const expandGroupsToTenants = (tenants, groups) => {
    const expandedTenants = [];

    tenants.forEach((tenant) => {
      const tenantValue = typeof tenant === "object" ? tenant.value : tenant;
      const tenantType = typeof tenant === "object" ? tenant.type : null;

      if (tenantType === "Group") {
        // Find the group and add all its members
        const group = groups?.find((g) => g.Id === tenantValue);
        if (group && group.Members) {
          group.Members.forEach((member) => {
            expandedTenants.push(member.defaultDomainName);
          });
        }
      } else {
        // Regular tenant
        expandedTenants.push(tenantValue);
      }
    });

    return expandedTenants;
  };

  // Enhanced drift validation using CIPP patterns with group support
  const validateDrift = async (tenants) => {
    if (!isDriftMode || !tenants || tenants.length === 0) {
      setDriftError("");
      onDriftConflictChange?.(false);
      return;
    }

    try {
      // Wait for both APIs to load
      if (!driftValidationApi.data || !tenantGroupsApi.data) {
        return;
      }

      // Filter out current template if editing
      console.log("Duplicate detection debug:", {
        edit,
        currentGUID: watchForm.GUID,
        allTemplates: driftValidationApi.data?.map((t) => ({
          GUID: t.GUID,
          standardId: t.standardId,
          standardName: t.standardName,
        })),
      });

      const existingTemplates = driftValidationApi.data.filter((template) => {
        const shouldInclude =
          edit && watchForm.GUID ? template.standardId !== watchForm.GUID : true;
        console.log(
          `Template ${template.standardId} (${template.standardName}): shouldInclude=${shouldInclude}, currentGUID=${watchForm.GUID}`
        );
        return shouldInclude;
      });

      console.log(
        "Filtered templates:",
        existingTemplates?.map((t) => ({
          GUID: t.GUID,
          standardId: t.standardId,
          standardName: t.standardName,
        }))
      );

      // Get tenant groups data
      const groups = tenantGroupsApi.data?.Results || [];

      // Expand selected tenants (including group members)
      const selectedTenantList = expandGroupsToTenants(tenants, groups);

      // Simple conflict check
      const conflicts = [];

      // Filter for drift templates only and group by standardId
      const driftTemplates = existingTemplates.filter(
        (template) => template.standardType === "drift"
      );
      const uniqueTemplates = {};

      driftTemplates.forEach((template) => {
        if (!uniqueTemplates[template.standardId]) {
          uniqueTemplates[template.standardId] = {
            standardName: template.standardName,
            tenants: [],
          };
        }
        uniqueTemplates[template.standardId].tenants.push(template.tenantFilter);
      });

      // Check for conflicts with unique templates
      console.log("Checking conflicts with unique templates:", uniqueTemplates);
      console.log("Selected tenant list:", selectedTenantList);

      for (const templateId in uniqueTemplates) {
        const template = uniqueTemplates[templateId];
        const templateTenants = template.tenants;

        console.log(
          `Checking template ${templateId} (${template.standardName}) with tenants:`,
          templateTenants
        );

        const hasConflict = selectedTenantList.some((selectedTenant) => {
          // Check if any template tenant matches the selected tenant
          const conflict = templateTenants.some((templateTenant) => {
            if (selectedTenant === "AllTenants" || templateTenant === "AllTenants") {
              console.log(
                `Conflict found: ${selectedTenant} vs ${templateTenant} (AllTenants match)`
              );
              return true;
            }
            const match = selectedTenant === templateTenant;
            if (match) {
              console.log(`Conflict found: ${selectedTenant} vs ${templateTenant} (exact match)`);
            }
            return match;
          });
          return conflict;
        });

        console.log(`Template ${templateId} has conflict: ${hasConflict}`);

        if (hasConflict) {
          conflicts.push(template.standardName || "Unknown Template");
        }
      }

      console.log("Final conflicts:", conflicts);

      if (conflicts.length > 0) {
        setDriftError(
          `This template has tenants that are assigned to another Drift Template. You can only assign one Drift Template to each tenant. Please check the ${conflicts.join(
            ", "
          )} template.`
        );
        onDriftConflictChange?.(true);
      } else {
        setDriftError("");
        onDriftConflictChange?.(false);
      }
    } catch (error) {
      setDriftError("Error checking for conflicts" + (error.message ? `: ${error.message}` : ""));
      onDriftConflictChange?.(true);
    }
  };

  // Watch tenant changes
  useEffect(() => {
    if (!isDriftMode) return;

    const timeoutId = setTimeout(() => {
      validateDrift(watchForm.tenantFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchForm.tenantFilter, isDriftMode, driftValidationApi.data, tenantGroupsApi.data]);

  useEffect(() => {
    const stepsStatus = {
      step1: !!_.get(watchForm, "templateName"),
      step2: _.get(watchForm, "tenantFilter", []).length > 0,
      step3: Object.keys(selectedStandards).length > 0,
      step4:
        _.get(watchForm, "standards") &&
        Object.keys(selectedStandards).length > 0 &&
        Object.keys(selectedStandards).every((standardName) => {
          const standardValues = _.get(watchForm, `${standardName}`, {});
          const standard = selectedStandards[standardName];
          // Check if this standard requires an action
          const hasRequiredComponents =
            standard?.addedComponent &&
            standard.addedComponent.some(
              (comp) => comp.type !== "switch" && comp.required !== false
            );
          const actionRequired = standard?.disabledFeatures !== undefined || hasRequiredComponents;
          // Always require an action value which should be an array with at least one element
          const actionValue = _.get(standardValues, "action");
          return actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);
        }),
    };

    const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
    setCurrentStep(completedSteps);
  }, [selectedStandards, watchForm]);

  // Create a local reference to the stepsStatus from the latest effect run
  const stepsStatus = {
    step1: !!_.get(watchForm, "templateName"),
    step2: _.get(watchForm, "tenantFilter", []).length > 0,
    step3: Object.keys(selectedStandards).length > 0,
    step4:
      _.get(watchForm, "standards") &&
      Object.keys(selectedStandards).length > 0 &&
      Object.keys(selectedStandards).every((standardName) => {
        const standardValues = _.get(watchForm, `${standardName}`, {});
        const standard = selectedStandards[standardName];
        // Always require an action for all standards (must be an array with at least one element)
        const actionValue = _.get(standardValues, "action");
        return actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);
      }),
  };

  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isDriftMode ? "About Drift Templates" : "About Standard Templates"}
        </Typography>
        {isDriftMode ? (
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Drift templates provide continuous monitoring of tenant configurations to detect
              unauthorized changes. Each tenant can only have one drift template applied at a time.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Remediation Options:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              • <strong>Automatic Remediation:</strong> Immediately reverts unauthorized changes
              back to the template configuration
              <br />• <strong>Manual Remediation:</strong> Sends email notifications for review,
              allowing you to accept or deny detected changes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Key Features:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              • Monitors all security standards, Conditional Access policies, and Intune policies
              <br />
              • Detects changes made outside of CIPP
              <br />
              • Configurable webhook and email notifications
              <br />• Granular control over deviation acceptance
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Standard templates can be applied to multiple tenants and allow overlapping
              configurations with intelligent merging based on specificity and timing.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Merge Priority (Specificity):</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              1. <strong>Individual Tenant</strong> - Highest priority, overrides all others
              <br />
              2. <strong>Tenant Group</strong> - Overrides "All Tenants" settings
              <br />
              3. <strong>All Tenants</strong> - Lowest priority, default baseline
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Conflict Resolution:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              When multiple standards target the same scope (e.g., two tenant-specific templates),
              the most recently created template takes precedence.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Example:</strong> An "All Tenants" template enables audit log retention for 90
              days, but you need 365 days for one specific tenant. Create a tenant-specific template
              with 365-day retention - it will override the global setting for that tenant only.
            </Typography>
          </Stack>
        )}
        <Divider />
        <Stack spacing={2}>
          {/* Hidden field to mark drift templates */}
          {isDriftMode && (
            <CippFormComponent
              type="hidden"
              name="isDriftTemplate"
              formControl={formControl}
              defaultValue={true}
            />
          )}
          <CippFormComponent
            type="textField"
            name="templateName"
            label="Template Name"
            formControl={formControl}
            placeholder="Enter a name for the template"
            fullWidth
          />
          <Divider />
          <CippFormComponent
            type="richText"
            name="description"
            label="Description"
            formControl={formControl}
            placeholder="Enter a description for the template"
            fullWidth
          />
          <Divider />
          <CippFormTenantSelector
            allTenants={true}
            label="Included Tenants"
            formControl={formControl}
            required={true}
            includeGroups={true}
          />

          {/* Show drift error */}
          {isDriftMode && driftError && <Alert severity="error">{driftError}</Alert>}

          {watchForm.tenantFilter?.some(
            (tenant) => tenant.value === "AllTenants" || tenant.type === "Group"
          ) && (
            <>
              <Divider />
              <CippFormTenantSelector
                label="Excluded Tenants"
                name="excludedTenants"
                allTenants={false}
                formControl={formControl}
                includeGroups={true}
              />
            </>
          )}
          {/* Drift-specific fields */}
          {isDriftMode && (
            <>
              <Divider />
              <CippFormComponent
                type="textField"
                name="driftAlertWebhook"
                label="Drift Alert Webhook"
                formControl={formControl}
                placeholder="Enter webhook URL for drift alerts. Leave blank to use the default webhook URL."
                fullWidth
              />
              <CippFormComponent
                type="textField"
                name="driftAlertEmail"
                label="Drift Alert Email"
                formControl={formControl}
                placeholder="Enter email address for drift alerts. Leave blank to use the default email address."
                fullWidth
              />
            </>
          )}
          {/* Hide schedule options in drift mode */}
          {!isDriftMode && (
            <>
              {updatedAt.date && (
                <>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      display: "block",
                    }}
                    variant="caption"
                  >
                    Last Updated <ReactTimeAgo date={updatedAt?.date} /> by {updatedAt?.user}
                  </Typography>
                </>
              )}
              <CippFormComponent
                type="switch"
                name="runManually"
                label="Do not run on schedule"
                formControl={formControl}
                placeholder="Enter a name for the template"
                fullWidth
              />
              <Typography
                sx={{
                  color: "text.secondary",
                }}
                variant="caption"
              >
                This setting allows you to create this template and run it only by using "Run Now".
              </Typography>
            </>
          )}
        </Stack>
      </CardContent>
      {/* Hide timeline/ticker in drift mode */}
      {!isDriftMode && (
        <>
          <Divider />
          <CardContent>
            <Timeline
              sx={{
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  p: 0,
                },
              }}
            >
              {steps.map((step, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <StyledTimelineDot complete={stepsStatus[`step${index + 1}`]} />
                    {index < steps.length - 1 && <StyledTimelineConnector />}
                  </TimelineSeparator>
                  <StyledTimelineContent>{step}</StyledTimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </>
      )}
      <Divider />
      <ActionList>
        {actions.map((action, index) => (
          <ActionListItem
            key={index}
            icon={<SvgIcon fontSize="small">{action.icon}</SvgIcon>}
            label={action.label}
            onClick={action.handler}
            disabled={
              !(watchForm.tenantFilter && watchForm.tenantFilter.length > 0) ||
              currentStep < 3 ||
              (isDriftMode && driftError)
            }
          />
        ))}
      </ActionList>
      <Divider />
      <CippApiDialog
        dialogAfterEffect={(data) => dialogAfterEffect(data.id)}
        createDialog={createDialog}
        title="Add Standard"
        api={{
          confirmText: isDriftMode
            ? "This template will automatically every hour to detect drift. Are you sure you want to apply this Drift Template?"
            : watchForm.runManually
            ? "Are you sure you want to apply this standard? This template has been set to never run on a schedule. After saving the template you will have to run it manually."
            : "Are you sure you want to apply this standard? This will apply the template and run every 3 hours.",
          url: "/api/AddStandardsTemplate",
          type: "POST",
          replacementBehaviour: "removeNulls",
          data: {
            tenantFilter: "tenantFilter",
            excludedTenants: "excludedTenants",
            description: "description",
            templateName: "templateName",
            standards: "standards",
            ...(edit ? { GUID: "GUID" } : {}),
            ...(savedItem ? { GUID: savedItem } : {}),
            runManually: isDriftMode ? false : "runManually",
            isDriftTemplate: "isDriftTemplate",
            ...(isDriftMode
              ? {
                  type: "drift",
                  driftAlertWebhook: "driftAlertWebhook",
                  driftAlertEmail: "driftAlertEmail",
                }
              : {}),
          },
        }}
        row={formControl.getValues()}
        formControl={formControl}
        relatedQueryKeys={[
          "listStandardTemplates",
          "listStandards",
          `listStandardTemplates-${watchForm.GUID}`,
          "ListTenantAlignment-drift-validation",
          "ListTenantGroups-drift-validation",
        ]}
      />
    </Card>
  );
};

CippStandardsSideBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
      icon: PropTypes.element.isRequired,
    })
  ).isRequired,
  updatedAt: PropTypes.string,
  formControl: PropTypes.object.isRequired,
  onSaveSuccess: PropTypes.func,
  onDriftConflictChange: PropTypes.func,
};

export default CippStandardsSideBar;
