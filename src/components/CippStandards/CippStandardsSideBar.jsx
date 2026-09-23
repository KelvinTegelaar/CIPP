import PropTypes from "prop-types";
import { CippIcons } from "../../utils/icon-registry";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CippOffCanvas } from "../CippComponents/CippOffCanvas";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab";
import { ActionList } from "../action-list";
import { ActionListItem } from "../action-list-item";
import { useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { get } from "lodash";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormTenantSelector } from "../CippComponents/CippFormTenantSelector";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import ReactTimeAgo from "react-time-ago";
import { Alert } from "@mui/material";
import { ApiGetCall } from "../../api/ApiCall";

// A repo is offered only once the loaded template's source matches one the user can push to.
export const computeCanSaveToGitHub = (source, writableRepos) =>
  !!source && (writableRepos ?? []).some((repo) => repo.FullName === source);

// Mirrors the dialog's removeNulls behaviour the previous data mapping relied on.
const removeNullValues = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== null && value !== undefined));

// Dialog fields for a repo-synced template: a warning while the push is off (or not
// possible), plus the Save to GitHub switch and commit message when the repo is writable.
export const buildSyncedTemplateFields = ({
  source,
  canSaveToGitHub,
  kind = "template",
  hasLocalChanges = null,
}) => {
  if (!source) return undefined;
  const cloneAction = kind === "baseline" ? "Clone & Edit Baseline" : "Clone & Edit Template";
  const list = `${kind}s list`;
  let warning;
  let severity = "warning";
  if (!canSaveToGitHub) {
    warning = `This ${kind} is synchronized from ${source}, which you cannot push to. Saving here keeps your changes in CIPP only, and the next sync will replace them if the repository file changes upstream. To keep a copy that upstream never touches, use ${cloneAction} from the ${list} instead.`;
  } else if (hasLocalChanges) {
    warning = `This ${kind} already has changes that are not in ${source}. Turn on Save to GitHub to push them with this save, or they stay in CIPP only.`;
  } else {
    warning = `This ${kind} is synchronized from ${source}. Saving here does not push your changes upstream; the repository copy stays out of date until you save it to GitHub.`;
    severity = hasLocalChanges === false ? "info" : "warning";
  }
  const fields = [
    {
      type: "alert",
      severity,
      label: warning,
      condition: { field: "saveToGitHub", compareType: "isNot", compareValue: true },
    },
  ];
  if (canSaveToGitHub) {
    fields.push(
      { type: "switch", name: "saveToGitHub", label: "Save to GitHub" },
      {
        type: "textField",
        name: "GitHubMessage",
        label: "Commit Message",
        multiline: true,
        rows: 4,
        condition: { field: "saveToGitHub", compareType: "is", compareValue: true },
        validators: {
          validate: (value, formValues) =>
            !formValues.saveToGitHub || !!value || "Commit message is required",
        },
      },
    );
  }
  return fields;
};

// Builds the AddStandardsTemplate POST body; keeps saveToGitHub/GitHubMessage out of the
// top-level payload and adds GitHub only when the switch is on.
export const buildStandardsTemplatePayload = ({
  row,
  formData,
  edit,
  savedItem,
  isDriftMode,
  source,
}) => removeNullValues({
  tenantFilter: row.tenantFilter,
  excludedTenants: row.excludedTenants,
  description: row.description,
  templateName: row.templateName,
  standards: row.standards,
  ...(edit ? { GUID: row.GUID } : {}),
  ...(savedItem ? { GUID: savedItem } : {}),
  runManually: isDriftMode ? false : row.runManually,
  isDriftTemplate: row.isDriftTemplate,
  ...(isDriftMode
    ? {
        type: "drift",
        driftAlertWebhook: row.driftAlertWebhook,
        driftAlertEmail: row.driftAlertEmail,
        driftAlertDisableEmail: row.driftAlertDisableEmail,
      }
    : {}),
  ...(formData.saveToGitHub && source
    ? { GitHub: { FullName: source, Message: formData.GitHubMessage } }
    : {}),
});

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
      <SvgIcon fontSize="small">{complete ? <CippIcons.CheckIcon /> : <CippIcons.Close />}</SvgIcon>
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
  source,
  hasLocalChanges,
  onSaveSuccess,
  onDriftConflictChange,
  isDriftMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [savedItem, setSavedItem] = useState(null);
  const [driftError, setDriftError] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

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

  // Repos the user can push to; shares its queryKey with the templates list's own
  // "Save to GitHub" action so both read the same cached result.
  const writableReposApi = ApiGetCall({
    url: "/api/ListCommunityRepos",
    data: { WriteAccess: true },
    queryKey: "CommunityRepos-Write",
  });
  const canSaveToGitHub = computeCanSaveToGitHub(source, writableReposApi.data?.Results);

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
  const validateDrift = async (tenants, excludedTenants) => {
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
      const existingTemplates = driftValidationApi.data.filter((template) => {
        const shouldInclude =
          edit && watchForm.GUID ? template.standardId !== watchForm.GUID : true;
        return shouldInclude;
      });

      // Get tenant groups data
      const groups = tenantGroupsApi.data?.Results || [];

      // Expand selected tenants (including group members)
      const selectedTenantList = expandGroupsToTenants(tenants, groups);

      // Expand excluded tenants the same way; a tenant excluded here can never overlap
      const excludedTenantSet = new Set(expandGroupsToTenants(excludedTenants || [], groups));

      // Simple conflict check
      const conflicts = [];

      // Filter for drift templates only and group by standardId
      const driftTemplates = existingTemplates.filter(
        (template) => template.standardType === "drift",
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
      for (const templateId in uniqueTemplates) {
        const template = uniqueTemplates[templateId];
        const templateTenants = template.tenants;

        // Template tenants come from ListTenantAlignment rows, which already have that
        // template's own exclusions applied — only this form's exclusions need subtracting
        const selectedHasAllTenants = selectedTenantList.includes("AllTenants");
        const hasConflict = templateTenants.some(
          (templateTenant) =>
            !excludedTenantSet.has(templateTenant) &&
            (selectedHasAllTenants ||
              templateTenant === "AllTenants" ||
              selectedTenantList.some(
                (selectedTenant) =>
                  selectedTenant !== "AllTenants" &&
                  !excludedTenantSet.has(selectedTenant) &&
                  selectedTenant === templateTenant,
              )),
        );

        if (hasConflict) {
          conflicts.push(template.standardName || "Unknown Template");
        }
      }

      if (conflicts.length > 0) {
        setDriftError(
          `This template has tenants that are assigned to another Drift Template. You can only assign one Drift Template to each tenant. Please check the ${conflicts.join(
            ", ",
          )} template.`,
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
      validateDrift(watchForm.tenantFilter, watchForm.excludedTenants);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    watchForm.tenantFilter,
    watchForm.excludedTenants,
    isDriftMode,
    driftValidationApi.data,
    tenantGroupsApi.data,
  ]);

  useEffect(() => {
    const stepsStatus = {
      step1: !!get(watchForm, "templateName"),
      step2: get(watchForm, "tenantFilter", []).length > 0,
      step3: Object.keys(selectedStandards).length > 0,
      step4:
        get(watchForm, "standards") &&
        Object.keys(selectedStandards).length > 0 &&
        Object.keys(selectedStandards).every((standardName) => {
          const standardValues = get(watchForm, `${standardName}`, {});
          const standard = selectedStandards[standardName];
          // Check if this standard requires an action
          const hasRequiredComponents =
            standard?.addedComponent &&
            standard.addedComponent.some(
              (comp) => comp.type !== "switch" && comp.required !== false,
            );
          const actionRequired = standard?.disabledFeatures !== undefined || hasRequiredComponents;
          // Always require an action value which should be an array with at least one element
          const actionValue = get(standardValues, "action");
          return actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);
        }),
    };

    const completedSteps = Object.values(stepsStatus).filter(Boolean).length;
    setCurrentStep(completedSteps);
  }, [selectedStandards, watchForm]);

  // Create a local reference to the stepsStatus from the latest effect run
  const stepsStatus = {
    step1: !!get(watchForm, "templateName"),
    step2: get(watchForm, "tenantFilter", []).length > 0,
    step3: Object.keys(selectedStandards).length > 0,
    step4:
      get(watchForm, "standards") &&
      Object.keys(selectedStandards).length > 0 &&
      Object.keys(selectedStandards).every((standardName) => {
        const standardValues = get(watchForm, `${standardName}`, {});
        const standard = selectedStandards[standardName];
        // Always require an action for all standards (must be an array with at least one element)
        const actionValue = get(standardValues, "action");
        return actionValue && (!Array.isArray(actionValue) || actionValue.length > 0);
      }),
  };

  return (
    <>
      <CippOffCanvas
        title={isDriftMode ? "About Drift Templates" : "About Standard Templates"}
        visible={aboutOpen}
        onClose={() => setAboutOpen(false)}
        size="sm"
      >
        <Box sx={{ p: 2 }}>
          {isDriftMode ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                Drift templates provide continuous monitoring of tenant configurations to detect
                unauthorized changes. Each tenant can only have one drift template applied at a
                time.
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                <strong>Remediation Options:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  ml: 2
                }}>
                • <strong>Automatic Remediation:</strong> Immediately reverts unauthorized changes
                back to the template configuration
                <br />• <strong>Manual Remediation:</strong> Sends email notifications for review,
                allowing you to accept or deny detected changes
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                <strong>Key Features:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  ml: 2
                }}>
                • Monitors all security standards, Conditional Access policies, and Intune policies
                <br />
                • Detects changes made outside of CIPP
                <br />
                • Configurable webhook and email notifications
                <br />• Granular control over deviation acceptance
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                Standard templates can be applied to multiple tenants and allow overlapping
                configurations with intelligent merging based on specificity and timing.
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                <strong>Merge Priority (Specificity):</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  ml: 2
                }}>
                1. <strong>Individual Tenant</strong> - Highest priority, overrides all others
                <br />
                2. <strong>Tenant Group</strong> - Overrides "All Tenants" settings
                <br />
                3. <strong>All Tenants</strong> - Lowest priority, default baseline
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                <strong>Conflict Resolution:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  ml: 2
                }}>
                When multiple standards target the same scope (e.g., two tenant-specific templates),
                the most recently created template takes precedence.
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                <strong>Example:</strong> An "All Tenants" template enables audit log retention for
                90 days, but you need 365 days for one specific tenant. Create a tenant-specific
                template with 365-day retention - it will override the global setting for that
                tenant only.
              </Typography>
            </Stack>
          )}
        </Box>
      </CippOffCanvas>
      <Card>
        <CardHeader
          title={title}
          action={
            <Tooltip
              title={isDriftMode ? "About Drift Templates" : "About Standard Templates"}
              arrow
            >
              <IconButton onClick={() => setAboutOpen(true)} color="primary">
                <CippIcons.InfoOutlined />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
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

            {(watchForm.tenantFilter?.some(
              (tenant) => tenant.value === "AllTenants" || tenant.type === "Group",
            ) ||
              (watchForm.excludedTenants && watchForm.excludedTenants.length > 0)) && (
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
                <CippFormComponent
                  type="switch"
                  name="driftAlertDisableEmail"
                  label="Disable All Notifications"
                  formControl={formControl}
                  fullWidth
                />
                <Typography
                  sx={{
                    color: "text.secondary",
                  }}
                  variant="caption"
                >
                  When enabled, all drift alert notifications (email, webhook, and PSA) will be
                  disabled.
                </Typography>
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
                  This setting allows you to create this template and run it only by using "Run
                  Now".
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
                  // lab 9's `:not(:has(.opposite-content))::before` spacer outranks a bare
                  // `.root:before` override; match its specificity via the missing-opposite class
                  [`& .${timelineItemClasses.root}.${timelineItemClasses.missingOppositeContent}:before`]:
                    {
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
              ? "This template will run automatically every 12 hours to detect drift. Are you sure you want to apply this Drift Template?"
              : watchForm.runManually
                ? "Are you sure you want to apply this standard? This template has been set to never run on a schedule. After saving the template you will have to run it manually."
                : "Are you sure you want to apply this standard? This will apply the template and run every 12 hours.",
            url: "/api/AddStandardsTemplate",
            type: "POST",
            // customDataformatter takes over the whole payload below so the dialog's own
            // saveToGitHub/GitHubMessage fields never leak in as top-level properties.
            customDataformatter: (row, action, formData) =>
              buildStandardsTemplatePayload({ row, formData, edit, savedItem, isDriftMode, source }),
          }}
          fields={buildSyncedTemplateFields({ source, canSaveToGitHub, hasLocalChanges })}
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
    </>
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
    }),
  ).isRequired,
  updatedAt: PropTypes.string,
  source: PropTypes.string,
  hasLocalChanges: PropTypes.bool,
  formControl: PropTypes.object.isRequired,
  onSaveSuccess: PropTypes.func,
  onDriftConflictChange: PropTypes.func,
};

export default CippStandardsSideBar;
