import React, { use, useEffect, useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { CheckCircle, Download, Mail, Fingerprint, Launch } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import CippRemediationCard from "../../../../../components/CippCards/CippRemediationCard";
import CippButtonCard from "../../../../../components/CippCards/CippButtonCard";
import { SvgIcon, Typography, CircularProgress, Button } from "@mui/material";
import { PropertyList } from "../../../../../components/property-list";
import { PropertyListItem } from "../../../../../components/property-list-item";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [restart, setRestart] = useState(false);
  const [initialReady, setInitialReady] = useState(false);
  const [becCheckReady, setBecCheckReady] = useState(false);
  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting: initialReady,
  });

  useEffect(() => {
    if (userId) {
      setInitialReady(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userRequest.isSuccess && userRequest.data?.[0]?.userPrincipalName) {
      setBecCheckReady(true);
    }
  }, [userRequest]);

  const becInitialCall = ApiGetCall({
    url: `/api/execBECCheck`,
    data: {
      userId: userId,
      tenantFilter: userSettingsDefaults.currentTenant,
      username: userRequest.data?.[0]?.userPrincipalName,
      ...(restart && { Overwrite: true }),
    },
    queryKey: `execBECCheck-initial-${userId}-${userSettingsDefaults.currentTenant}-${userRequest.data?.[0]?.userPrincipalName}`,
    waiting: becCheckReady,
  });

  // Fetch BEC Check result using GUID
  const becPollingCall = ApiGetCall({
    url: `/api/execBECCheck`,
    data: {
      GUID: becInitialCall.data?.GUID,
      tenantFilter: userSettingsDefaults.currentTenant,
    },
    queryKey: `execBECCheck-polling-${becInitialCall.data?.GUID}`,
    waiting: false,
  });

  // Effect to monitor becGuid and start polling
  useEffect(() => {
    if (becInitialCall.data?.GUID) {
      setIsLoading(true);
      if (!becPollingCall.data || becPollingCall.data?.Waiting) {
        setTimeout(() => {
          becPollingCall.refetch();
        }, 10000);
      }
    }

    if (becPollingCall.isSuccess && becPollingCall.data && !becPollingCall.data?.Waiting) {
      setIsLoading(false);
    }
  }, [becPollingCall.dataUpdatedAt, becInitialCall]);

  const restartProcess = () => {
    setRestart(true);
    becPollingCall.refetch();
    setTimeout(() => {
      becInitialCall.refetch();
      becPollingCall.refetch();
    }, 500);
  };

  // Combine loading states
  const isFetching =
    userRequest.isLoading || becInitialCall.isLoading || becPollingCall.isLoading || isLoading;

  // Helper functions to determine messages
  const getRuleMessage = () => {
    if (!becPollingCall.data) return null;
    if (becPollingCall.data.NewRules && becPollingCall.data.NewRules.length > 0) {
      // Example condition to check for potential breach
      const hasPotentialBreach = becPollingCall.data.NewRules.some((rule) =>
        rule.MoveToFolder?.includes("RSS")
      );
      if (hasPotentialBreach) {
        return "Potential Breach found. The rules for this user contain classic signs of a breach.";
      }
      return "Rules have been found. Please review the list below and take action as needed.";
    }
    return "No new rules found.";
  };

  const getUserMessage = () => {
    if (!becPollingCall.data) return null;
    if (becPollingCall.data.NewUsers && becPollingCall.data.NewUsers.length > 0) {
      return "New users have been found in the last 14 days. Please review the list below and take action as needed.";
    }
    return "No new users found.";
  };

  const getAppMessage = () => {
    if (!becPollingCall.data) return null;
    if (becPollingCall.data.AddedApps && becPollingCall.data.AddedApps.length > 0) {
      // Example condition to check for potential breach
      const hasPotentialBreach = becPollingCall.data.AddedApps.some(
        (app) => /* your condition here */ false
      );
      if (hasPotentialBreach) {
        return "Potential Breach found.";
      }
      return "New applications have been found. Please review the list below and take action as needed.";
    }
    return "No new applications found.";
  };

  const getMailboxPermissionMessage = () => {
    if (!becPollingCall.data) return null;
    if (
      becPollingCall.data.MailboxPermissionChanges &&
      becPollingCall.data.MailboxPermissionChanges.length > 0
    ) {
      return "Mailbox permission changes have been found.";
    }
    return "No mailbox permission changes found.";
  };

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />
            </>
          ),
        },
        {
          icon: <Launch style={{ color: "#667085" }} />,
          text: (
            <Button
                color="muted"
                style={{ paddingLeft: 0 }}
                size="small"
                href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View in Entra
              </Button>
          ),
        },
      ]
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={userRequest.isSuccess ? userRequest.data?.[0]?.displayName : ""}
      subtitle={subtitle}
      isFetching={userRequest.isFetching}
    >
      {/* Loading State: Show only Remediation Card and Check 1 with Loading Skeleton */}
      {isFetching && userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            {/* Remediation Card */}
            <Grid item size={5}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                restartProcess={restartProcess}
                isFetching={false}
              />
            </Grid>
            {/* Check 1 Card with Loading */}
            <Grid item size={7}>
              <CippButtonCard
                variant="outlined"
                isFetching={false}
                title={
                  <Stack direction="row" justifyContent={"space-between"}>
                    <Box>Loading data</Box>
                    <CircularProgress size={20} />
                  </Stack>
                }
              >
                <Typography variant="body2" gutterBottom>
                  This Analysis can take up to 10 minutes to complete depending on the amount of
                  logs. Please wait for the process to finish.
                </Typography>
              </CippButtonCard>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Loaded State: Show all steps */}
      {!isFetching && userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            {/* Remediation Card */}
            <Grid item size={5}>
              <CippRemediationCard
                userPrincipalName={userRequest.data[0].userPrincipalName}
                userId={userRequest.data[0].id}
                tenantFilter={userSettingsDefaults.currentTenant}
                isFetching={false}
                restartProcess={restartProcess}
              />
            </Grid>
            {/* All Steps */}
            <Grid item size={7}>
              <Stack spacing={3}>
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Log information</Box>
                      <Stack direction="row" spacing={2}>
                        <SvgIcon color="success">
                          <CheckCircle />
                        </SvgIcon>
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {becPollingCall.data?.ExtractResult}. The data of this log was extracted at{" "}
                    {new Date(becPollingCall.data?.ExtractedAt).toLocaleString()}. This data might
                    be cached. To get the latest version of the data, click the Refresh Data button.
                  </Typography>
                  {/* Optionally, display list of new rules */}
                  {becPollingCall.data &&
                    becPollingCall.data.NewRules &&
                    becPollingCall.data.NewRules.length > 0 && (
                      <Box mt={2}>
                        {/* Replace with your component to display rules */}
                        {/* Example: <RuleList rules={becPollingCall.data.NewRules} /> */}
                      </Box>
                    )}
                </CippButtonCard>
                {/* Check 1: Recently added rules */}
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 1: Mailbox Rules</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.NewRules &&
                        becPollingCall.data.NewRules.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getRuleMessage()}
                  </Typography>
                  {/* Optionally, display list of new rules */}
                  {becPollingCall.data &&
                    becPollingCall.data.NewRules &&
                    becPollingCall.data.NewRules.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.NewRules.map((rule) => (
                            <PropertyListItem label={rule.Name} value={rule.Description} />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                {/* Check 2: Recently added users */}
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 2: Recently added users</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.NewUsers &&
                        becPollingCall.data.NewUsers.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getUserMessage()}
                  </Typography>
                  {/* Optionally, display list of new users */}
                  {becPollingCall.data &&
                    becPollingCall.data.NewUsers &&
                    becPollingCall.data.NewUsers.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.NewUsers.map((user) => (
                            <PropertyListItem
                              label={user.userPrincipalName}
                              value={user.createdDateTime}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                {/* Check 3: New Applications */}
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 3: New Applications</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.AddedApps &&
                        becPollingCall.data.AddedApps.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getAppMessage()}
                  </Typography>
                  {/* Optionally, display list of added applications */}
                  {becPollingCall.data &&
                    becPollingCall.data.AddedApps &&
                    becPollingCall.data.AddedApps.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.AddedApps.map((app) => (
                            <PropertyListItem
                              label={`${app.displayName} - ${app.appId}`}
                              value={app.createdDateTime}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                {/* Check 4: Mailbox permission changes */}
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 4: Mailbox permission changes</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.MailboxPermissionChanges &&
                        becPollingCall.data.MailboxPermissionChanges.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    {getMailboxPermissionMessage()}
                  </Typography>
                  {/* Optionally, display list of mailbox permission changes */}
                  {becPollingCall.data &&
                    becPollingCall.data.MailboxPermissionChanges &&
                    becPollingCall.data.MailboxPermissionChanges.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.MailboxPermissionChanges.map((permission) => (
                            <PropertyListItem
                              label={permission.UserKey}
                              value={`${permission.Operation} - ${permission.Permissions}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 5: MFA Devices</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.MFADevices &&
                        becPollingCall.data.MFADevices.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    MFA Devices have been found. Please review the list below and take action as
                    required
                  </Typography>
                  {/* Optionally, display list of mailbox permission changes */}
                  {becPollingCall.data &&
                    becPollingCall.data.MFADevices &&
                    becPollingCall.data.MFADevices.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.MFADevices.map((permission) => (
                            <PropertyListItem
                              label={permission["@odata.type"]}
                              value={`${permission.displayName} - Registered at ${permission.createdDateTime}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Check 6: Password Changes</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data &&
                        becPollingCall.data.ChangedPasswords &&
                        becPollingCall.data.ChangedPasswords.length > 0 ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    Latest password changes for the tenant can be seen below
                  </Typography>
                  {/* Optionally, display list of mailbox permission changes */}
                  {becPollingCall.data &&
                    becPollingCall.data.ChangedPasswords &&
                    becPollingCall.data.ChangedPasswords.length > 0 && (
                      <Box mt={2}>
                        <PropertyList>
                          {becPollingCall.data.ChangedPasswords.map((permission) => (
                            <PropertyListItem
                              label={permission.displayName}
                              value={`${permission.lastPasswordChangeDateTime}`}
                            />
                          ))}
                        </PropertyList>
                      </Box>
                    )}
                </CippButtonCard>

                {/* Check 6: Report Data */}
                <CippButtonCard
                  variant="outlined"
                  isFetching={false}
                  title={
                    <Stack direction="row" justifyContent={"space-between"}>
                      <Box>Report</Box>
                      <Stack direction="row" spacing={2}>
                        {becPollingCall.data ? (
                          <SvgIcon color="success">
                            <CheckCircle />
                          </SvgIcon>
                        ) : (
                          <SvgIcon color="disabled">
                            <CheckCircle />
                          </SvgIcon>
                        )}
                      </Stack>
                    </Stack>
                  }
                >
                  <Typography variant="body2" gutterBottom>
                    Click this button to download a report of all the data found during this
                    research to perform your own analysis.
                  </Typography>
                  {/* Implement download functionality */}
                  {becPollingCall.data && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(becPollingCall.data, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `BEC_Report_${userRequest.data[0].userPrincipalName}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        variant="contained"
                        startIcon={
                          <SvgIcon fontSize="small">
                            <Download />
                          </SvgIcon>
                        }
                      >
                        Download Report
                      </Button>
                    </Box>
                  )}
                </CippButtonCard>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
