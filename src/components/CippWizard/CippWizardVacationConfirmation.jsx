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
  const forwardingVacation = ApiPostCall({ relatedQueryKeys: ["VacationMode"] });
  const oooVacation = ApiPostCall({ relatedQueryKeys: ["VacationMode"] });

  const tenantFilter = values.tenantFilter?.value || values.tenantFilter;
  const isSubmitting =
    caExclusion.isPending ||
    mailboxVacation.isPending ||
    forwardingVacation.isPending ||
    oooVacation.isPending;
  const hasSubmitted =
    caExclusion.isSuccess ||
    mailboxVacation.isSuccess ||
    forwardingVacation.isSuccess ||
    oooVacation.isSuccess;

    const toLocalDateStr = (epoch) => {
  if (!epoch) return null;
  const d = new Date(epoch * 1000);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};
  const handleSubmit = () => {

    if (values.enableCAExclusion) {
      caExclusion.mutate({
  url: "/api/ExecTravelCAPolicy",
  data: {
    tenantFilter,
    Users: values.Users,
    BlockPolicies: values.BlockPolicies,
    NamedLocations: values.NamedLocations || [],
    CountryCodes: (values.CountryCodes || []).map((c) => c.value || c),
    IncludeTrusted: values.IncludeTrusted || false,
    StartDate: values.startDate,
    EndDate: values.endDate,
    StartDateStr: toLocalDateStr(values.startDate),
    EndDateStr: toLocalDateStr(values.endDate),
    vacation: true,
    reference: values.reference || null,
    postExecution: values.postExecution || [],
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

    if (values.enableForwarding) {
      const forwardingData = {
        tenantFilter,
        Users: values.Users,
        forwardOption: values.forwardOption,
        KeepCopy: values.forwardKeepCopy || false,
        startDate: values.startDate,
        endDate: values.endDate,
        reference: values.reference || null,
        postExecution: values.postExecution || [],
      };

      if (values.forwardOption === "internalAddress") {
        forwardingData.ForwardInternal = values.forwardInternal;
      }
      if (values.forwardOption === "ExternalAddress") {
        forwardingData.ForwardExternal = values.forwardExternal;
      }

      forwardingVacation.mutate({
        url: "/api/ExecScheduleForwardingVacation",
        data: forwardingData,
      });
    }

    if (values.enableOOO) {
      const oooData = {
        tenantFilter,
        Users: values.Users,
        internalMessage: values.oooInternalMessage,
        externalMessage: values.oooExternalMessage,
        startDate: values.startDate,
        endDate: values.endDate,
        reference: values.reference || null,
        postExecution: values.postExecution || [],
      };
      if (values.oooCreateOOFEvent) {
        oooData.CreateOOFEvent = true;
        if (values.oooOOFEventSubject) oooData.OOFEventSubject = values.oooOOFEventSubject;
      }
      if (values.oooAutoDeclineFutureRequests) {
        oooData.AutoDeclineFutureRequestsWhenOOF = true;
      }
      if (values.oooDeclineEvents) {
        oooData.DeclineEventsForScheduledOOF = true;
        if (values.oooDeclineMeetingMessage) oooData.DeclineMeetingMessage = values.oooDeclineMeetingMessage;
      }
      oooVacation.mutate({
        url: "/api/ExecScheduleOOOVacation",
        data: oooData,
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

  const formatForwardingTarget = () => {
    if (values.forwardOption === "internalAddress") {
      return values.forwardInternal?.label || values.forwardInternal?.value || values.forwardInternal || "Not set";
    }
    if (values.forwardOption === "ExternalAddress") {
      return values.forwardExternal || "Not set";
    }
    return "Not set";
  };

  return (
    <Stack spacing={3}>
      {/* General Summary */}
      <Card variant="outlined">
        <CardHeader title="Vacation Mode Summary" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
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
        const enabledCount = [
          values.enableCAExclusion,
          values.enableMailboxPermissions,
          values.enableForwarding,
          values.enableOOO,
        ].filter(Boolean).length;
        const mdSize = enabledCount >= 4 ? 3 : enabledCount === 3 ? 4 : enabledCount === 2 ? 6 : 12;
        return (
          <Grid container spacing={3}>
            {values.enableCAExclusion && (
              <Grid size={{ md: mdSize, xs: 12 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardHeader
                    title="Travel CA Policy"
                    action={<Chip label="Enabled" color="primary" size="small" />}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Blocking Policies
                        </Typography>
                        <Typography variant="body2">
                          {Array.isArray(values.BlockPolicies) && values.BlockPolicies.length > 0
                            ? values.BlockPolicies.map((p) => p?.label || p?.value).join(", ")
                            : "Not selected"}
                        </Typography>
                      </div>
                      {Array.isArray(values.NamedLocations) && values.NamedLocations.length > 0 && (
                        <div>
                          <Typography variant="subtitle2" color="text.secondary">
                            Named Locations
                          </Typography>
                          <Typography variant="body2">
                            {values.NamedLocations.map((l) => l?.label || l?.value).join(", ")}
                          </Typography>
                        </div>
                      )}
                      {Array.isArray(values.CountryCodes) && values.CountryCodes.length > 0 && (
                        <div>
                          <Typography variant="subtitle2" color="text.secondary">
                            Additional Countries
                          </Typography>
                          <Typography variant="body2">
                            {values.CountryCodes.map((c) => c?.label || c?.value).join(", ")}
                          </Typography>
                        </div>
                      )}
                      {values.IncludeTrusted && (
                        <Typography variant="body2" color="info.main">
                          All Trusted Locations will be included
                        </Typography>
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
                          {(values.permissionTypes || []).map((p) => p.label || p.value).join(", ") || "None"}
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

            {values.enableForwarding && (
              <Grid size={{ md: mdSize, xs: 12 }}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardHeader
                    title="Mail Forwarding"
                    action={<Chip label="Enabled" color="primary" size="small" />}
                  />
                  <Divider />
                  <CardContent>
                    <Stack spacing={1}>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Destination
                        </Typography>
                        <Typography variant="body2">{formatForwardingTarget()}</Typography>
                      </div>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Forwarding Type
                        </Typography>
                        <Typography variant="body2">
                          {values.forwardOption === "ExternalAddress" ? "External Address" : "Internal Address"}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="subtitle2" color="text.secondary">
                          Keep Copy
                        </Typography>
                        <Typography variant="body2">{values.forwardKeepCopy ? "Yes" : "No"}</Typography>
                      </div>
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
                      {(values.oooCreateOOFEvent || values.oooAutoDeclineFutureRequests || values.oooDeclineEvents) && (
                        <div>
                          <Typography variant="subtitle2" color="text.secondary">
                            Calendar Options
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {values.oooCreateOOFEvent && (
                              <Chip label="Block Calendar" size="small" color="info" />
                            )}
                            {values.oooAutoDeclineFutureRequests && (
                              <Chip label="Decline New Invitations" size="small" color="info" />
                            )}
                            {values.oooDeclineEvents && (
                              <Chip label="Decline & Cancel Meetings" size="small" color="info" />
                            )}
                          </Stack>
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
      {values.enableForwarding && <CippApiResults apiObject={forwardingVacation} />}
      {values.enableOOO && <CippApiResults apiObject={oooVacation} />}

      {/* Navigation and Submit */}
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
