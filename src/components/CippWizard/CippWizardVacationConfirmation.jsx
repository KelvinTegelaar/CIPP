import { Alert, Button, Card, CardContent, CardHeader, Chip, Divider, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { CippWizardStepButtons } from "./CippWizardStepButtons";
import { CippApiResults } from "../CippComponents/CippApiResults";
import { ApiPostCall } from "../../api/ApiCall";
import { useWatch } from "react-hook-form";
import Link from "next/link";

export const CippWizardVacationConfirmation = (props) => {
  const { formControl, onPreviousStep, currentStep, lastStep } = props;

  const values = useWatch({ control: formControl.control });

  const caExclusion = ApiPostCall({ relatedQueryKeys: ["VacationMode"] });
  const mailboxVacation = ApiPostCall({ relatedQueryKeys: ["VacationMode"] });
  const oooVacation = ApiPostCall({ relatedQueryKeys: ["VacationMode"] });

  const tenantFilter = values.tenantFilter?.value || values.tenantFilter;
  const isSubmitting = caExclusion.isPending || mailboxVacation.isPending || oooVacation.isPending;
  const hasSubmitted = caExclusion.isSuccess || mailboxVacation.isSuccess || oooVacation.isSuccess;

  const handleSubmit = () => {
    if (values.enableCAExclusion) {
      caExclusion.mutate({
        url: "/api/ExecCAExclusion",
        data: {
          tenantFilter,
          Users: values.Users,
          PolicyId: values.PolicyId?.value,
          StartDate: values.startDate,
          EndDate: values.endDate,
          vacation: true,
          reference: values.reference || null,
          postExecution: values.postExecution || [],
          excludeLocationAuditAlerts: values.excludeLocationAuditAlerts || false,
        },
      });
    }

    if (values.enableMailboxPermissions) {
      mailboxVacation.mutate({
        url: "/api/ExecScheduleMailboxVacation",
        data: {
          tenantFilter,
          mailboxOwners: values.Users,
          delegates: values.delegates,
          permissionTypes: values.permissionTypes,
          autoMap: values.autoMap,
          includeCalendar: values.includeCalendar,
          calendarPermission: values.calendarPermission,
          canViewPrivateItems: values.canViewPrivateItems,
          startDate: values.startDate,
          endDate: values.endDate,
          reference: values.reference || null,
          postExecution: values.postExecution || [],
        },
      });
    }

    if (values.enableOOO) {
      oooVacation.mutate({
        url: "/api/ExecScheduleOOOVacation",
        data: {
          tenantFilter,
          Users: values.Users,
          internalMessage: values.oooInternalMessage,
          externalMessage: values.oooExternalMessage,
          startDate: values.startDate,
          endDate: values.endDate,
          reference: values.reference || null,
          postExecution: values.postExecution || [],
        },
      });
    }
  };

  const formatDate = (epoch) => {
    if (!epoch) return "Not set";
    return new Date(epoch * 1000).toLocaleString();
  };

  const formatUsers = (users) => {
    if (!users || users.length === 0) return "None";
    return users.map((u) => u.label || u.value || u).join(", ");
  };

  return (
    <Stack spacing={3}>
      {/* Summary */}
      <Card variant="outlined">
        <CardHeader title="Vacation Mode Summary" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* General Info */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Tenant
              </Typography>
              <Typography variant="body1">{tenantFilter || "Not selected"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Users Going on Vacation
              </Typography>
              <Typography variant="body1">{formatUsers(values.Users)}</Typography>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body1">{formatDate(values.startDate)}</Typography>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body1">{formatDate(values.endDate)}</Typography>
            </Grid>

            {values.reference && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reference
                </Typography>
                <Typography variant="body1">{values.reference}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Enabled Actions */}
      {(() => {
        const enabledCount = [values.enableCAExclusion, values.enableMailboxPermissions, values.enableOOO].filter(Boolean).length;
        const mdSize = enabledCount >= 3 ? 4 : enabledCount === 2 ? 6 : 12;
        return (
          <Grid container spacing={3}>
            {values.enableCAExclusion && (
              <Grid size={{ md: mdSize, xs: 12 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardHeader
                    title="CA Policy Exclusion"
                    action={<Chip label="Enabled" color="primary" size="small" />}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Policy
                        </Typography>
                        <Typography variant="body2">
                          {values.PolicyId?.label || "Not selected"}
                        </Typography>
                      </div>
                      {values.excludeLocationAuditAlerts && (
                        <div>
                          <Typography variant="body2" color="warning.main">
                            Location-based audit log alerts will be excluded
                          </Typography>
                        </div>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {values.enableMailboxPermissions && (
              <Grid size={{ md: mdSize, xs: 12 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardHeader
                    title="Mailbox Permissions"
                    action={<Chip label="Enabled" color="primary" size="small" />}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delegates
                        </Typography>
                        <Typography variant="body2">{formatUsers(values.delegates)}</Typography>
                      </div>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Permission Types
                        </Typography>
                        <Typography variant="body2">
                          {(values.permissionTypes || []).map((p) => p.label || p.value).join(", ") ||
                            "None"}
                        </Typography>
                      </div>
                      {values.includeCalendar && (
                        <div>
                          <Typography variant="subtitle2" color="text.secondary">
                            Calendar
                          </Typography>
                          <Typography variant="body2">
                            {values.calendarPermission?.label || "Not set"}
                            {values.canViewPrivateItems ? " (Can view private items)" : ""}
                          </Typography>
                        </div>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {values.enableOOO && (
              <Grid size={{ md: mdSize, xs: 12 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardHeader
                    title="Out of Office"
                    action={<Chip label="Enabled" color="primary" size="small" />}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Internal Message
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {values.oooInternalMessage
                            ? String(values.oooInternalMessage).replace(/[<>]/g, "").slice(0, 120) +
                              (String(values.oooInternalMessage).replace(/[<>]/g, "").length > 120 ? "…" : "")
                            : "Not set"}
                        </Typography>
                      </div>
                      {values.oooExternalMessage && (
                        <div>
                          <Typography variant="subtitle2" color="text.secondary">
                            External Message
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {String(values.oooExternalMessage).replace(/[<>]/g, "").slice(0, 120) +
                              (String(values.oooExternalMessage).replace(/[<>]/g, "").length > 120 ? "…" : "")}
                          </Typography>
                        </div>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        );
      })()}

      {/* API Results */}
      {values.enableCAExclusion && <CippApiResults apiObject={caExclusion} />}
      {values.enableMailboxPermissions && <CippApiResults apiObject={mailboxVacation} />}
      {values.enableOOO && <CippApiResults apiObject={oooVacation} />}

      {/* Navigation + Custom Submit */}
      <Stack alignItems="center" direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        {currentStep > 0 && (
          <Button color="inherit" onClick={onPreviousStep} size="large" type="button">
            Back
          </Button>
        )}
        {hasSubmitted ? (
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/identity/administration/vacation-mode"
          >
            View Vacation Schedules
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
