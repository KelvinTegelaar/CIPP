import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Check, Error, Mail, Fingerprint, Launch, Delete, Star, Close } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippExchangeInfoCard } from "../../../../../components/CippCards/CippExchangeInfoCard";
import { useEffect, useState } from "react";
import CippExchangeSettingsForm from "../../../../../components/CippFormPages/CippExchangeSettingsForm";
import { useForm } from "react-hook-form";
import { Alert, Button, Collapse, CircularProgress, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { CippApiResults } from "../../../../../components/CippComponents/CippApiResults";
import { Block, PlayArrow } from "@mui/icons-material";
import { CippPropertyListCard } from "../../../../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import CippExchangeActions from "../../../../../components/CippComponents/CippExchangeActions";
import { CippApiDialog } from "../../../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../../../hooks/use-dialog";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const [waiting, setWaiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [actionData, setActionData] = useState({ ready: false });
  const [showAddAliasDialog, setShowAddAliasDialog] = useState(false);
  const [newAliases, setNewAliases] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const createDialog = useDialog();
  const router = useRouter();
  const { userId } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });
  const graphUserRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting: waiting,
  });
  const userRequest = ApiGetCall({
    url: `/api/ListUserMailboxDetails?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `Mailbox-${userId}`,
    waiting: waiting,
  });

  const oooRequest = ApiGetCall({
    url: `/api/ListOoO?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ooo-${userId}`,
    waiting: waiting,
  });

  const calPermissions = ApiGetCall({
    url: `/api/ListCalendarPermissions?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `CalendarPermissions-${userId}`,
    waiting: waiting,
  });

  const mailboxRulesRequest = ApiGetCall({
    url: `/api/ListUserMailboxRules?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `MailboxRules-${userId}`,
    waiting: waiting,
  });

  useEffect(() => {
    if (oooRequest.isSuccess) {
      formControl.setValue("ooo.ExternalMessage", oooRequest.data?.ExternalMessage);
      formControl.setValue("ooo.InternalMessage", oooRequest.data?.InternalMessage);
      formControl.setValue("ooo.AutoReplyState", {
        value: oooRequest.data?.AutoReplyState,
        label: oooRequest.data?.AutoReplyState,
      });
      formControl.setValue(
        "ooo.StartTime",
        new Date(oooRequest.data?.StartTime).getTime() / 1000 || null
      );
      formControl.setValue(
        "ooo.EndTime",
        new Date(oooRequest.data?.EndTime).getTime() / 1000 || null
      );
    }
  }, [oooRequest.isSuccess]);

  useEffect(() => {
    //if userId is defined, we can fetch the user data
    if (userId) {
      setWaiting(true);
    }
  }, [userId]);

  const title = graphUserRequest.isSuccess ? graphUserRequest.data?.[0]?.displayName : "Loading...";

  const subtitle = graphUserRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: (
            <CippCopyToClipBoard type="chip" text={graphUserRequest.data?.[0]?.userPrincipalName} />
          ),
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={graphUserRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <CippTimeAgo data={graphUserRequest.data?.[0]?.createdDateTime} />
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

  const data = userRequest.data?.[0];

  const permissions = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: userRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : userRequest.data?.[0]?.Permissions?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Current mailbox permissions",
      subtext:
        userRequest.data?.[0]?.Permissions?.length !== 0
          ? "Other users have access to this mailbox"
          : "No other users have access to this mailbox",
      statusColor: "green.main",
      //map each of the permissions to a label/value pair, where the label is the user's name and the value is the permission level
      propertyItems:
        userRequest.data?.[0]?.Permissions?.map((permission) => ({
          label: permission.User,
          value: permission.AccessRights,
        })) || [],
    },
  ];

  const calCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: calPermissions.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : calPermissions.data?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Current Calendar permissions",
      subtext: calPermissions.data?.length
        ? "Other users have access to this users calendar"
        : "No other users have access to this users calendar",
      statusColor: "green.main",
      //map each of the permissions to a label/value pair, where the label is the user's name and the value is the permission level
      propertyItems:
        calPermissions.data?.map((permission) => ({
          label: `${permission.User} - ${permission.FolderName}`,
          value: permission.AccessRights.join(", "),
        })) || [],
    },
  ];

  const mailboxRuleActions = [
    {
      label: "Enable Mailbox Rule",
      type: "POST",
      icon: <PlayArrow />,
      url: "/api/ExecSetMailboxRule",
      data: {
        ruleId: "Identity",
        userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
        ruleName: "Name",
        Enable: true,
      },
      condition: (row) => !row.Enabled,
      confirmText: "Are you sure you want to enable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Disable Mailbox Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetMailboxRule",
      data: {
        ruleId: "Identity",
        userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
        ruleName: "Name",
        Disable: true,
      },
      condition: (row) => row.Enabled,
      confirmText: "Are you sure you want to disable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Remove Mailbox Rule",
      type: "POST",
      icon: <Delete />,
      url: "/api/ExecRemoveMailboxRule",
      data: {
        ruleId: "Identity",
        ruleName: "Name",
        userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
      },
      confirmText: "Are you sure you want to remove this mailbox rule?",
      multiPost: false,
      relatedQueryKeys: `MailboxRules-${userId}`,
    },
  ];

  const mailboxRulesCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: mailboxRulesRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : mailboxRulesRequest.data?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Current Mailbox Rules",
      subtext: mailboxRulesRequest.data?.length
        ? "Mailbox rules are configured for this user"
        : "No mailbox rules configured for this user",
      statusColor: "green.main",
      table: {
        title: "Mailbox Rules",
        hideTitle: true,
        data: mailboxRulesRequest.data || [],
        refreshFunction: () => mailboxRulesRequest.refetch(),
        isFetching: mailboxRulesRequest.isFetching,
        simpleColumns: ["Enabled", "Name", "Description", "Priority"],
        actions: mailboxRuleActions,
        offCanvas: {
          children: (data) => {
            const keys = Object.keys(data).filter(
              (key) => !key.includes("@odata") && !key.includes("@data")
            );
            const properties = [];
            keys.forEach((key) => {
              if (data[key] && data[key].length > 0) {
                properties.push({
                  label: getCippTranslation(key),
                  value: getCippFormatting(data[key], key),
                });
              }
            });
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Rule Details"
                propertyItems={properties}
                actionItems={mailboxRuleActions}
              />
            );
          },
        },
      },
    },
  ];

  const proxyAddressActions = [
    {
      label: "Make Primary",
      type: "POST",
      icon: <Star />,
      url: "/api/SetUserAliases",
      data: {
        id: userId,
        tenantFilter: userSettingsDefaults.currentTenant,
        MakePrimary: "Address",
      },
      confirmText: "Are you sure you want to make this the primary proxy address?",
      multiPost: false,
      relatedQueryKeys: `ListUsers-${userId}`,
    },
    {
      label: "Remove Proxy Address",
      type: "POST",
      icon: <Delete />,
      url: "/api/SetUserAliases",
      data: {
        id: userId,
        tenantFilter: userSettingsDefaults.currentTenant,
        RemovedAliases: "Address",
      },
      confirmText: "Are you sure you want to remove this proxy address?",
      multiPost: false,
      relatedQueryKeys: `ListUsers-${userId}`,
    },
  ];

  const handleAddAliases = () => {
    const aliases = newAliases
      .split('\n')
      .map(alias => alias.trim())
      .filter(alias => alias);
    if (aliases.length > 0) {
      setIsSubmitting(true);
      setSubmitResult(null);
      fetch('/api/SetUserAliases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          tenantFilter: userSettingsDefaults.currentTenant,
          AddedAliases: aliases.join(','),
          userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
        }),
      })
        .then(response => response.json())
        .then(data => {
          setSubmitResult({ success: true, message: 'Aliases added successfully' });
          graphUserRequest.refetch();
          setTimeout(() => {
            setShowAddAliasDialog(false);
            setNewAliases('');
            setSubmitResult(null);
          }, 1500);
        })
        .catch(error => {
          setSubmitResult({ success: false, message: 'Failed to add aliases' });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const proxyAddressesCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: graphUserRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : graphUserRequest.data?.[0]?.proxyAddresses?.length > 1 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Current Proxy Addresses",
      subtext: graphUserRequest.data?.[0]?.proxyAddresses?.length > 1
        ? "Proxy addresses are configured for this user"
        : "No proxy addresses configured for this user",
      statusColor: "green.main",
      table: {
        title: "Proxy Addresses",
        hideTitle: true,
        data: graphUserRequest.data?.[0]?.proxyAddresses?.map(address => ({
          Address: address,
          Type: address.startsWith('SMTP:') ? 'Primary' : 'Alias',
        })) || [],
        refreshFunction: () => graphUserRequest.refetch(),
        isFetching: graphUserRequest.isFetching,
        simpleColumns: ["Address", "Type"],
        actions: proxyAddressActions,
        offCanvas: {
          children: (data) => {
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Address Details"
                propertyItems={[
                  {
                    label: "Address",
                    value: data.Address,
                  },
                  {
                    label: "Type",
                    value: data.Type,
                  },
                ]}
                actionItems={proxyAddressActions}
              />
            );
          },
        },
      },
      children: (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2, px: 2 }}>
          <Button
            startIcon={<Mail />}
            onClick={() => setShowAddAliasDialog(true)}
            variant="contained"
            color="primary"
            size="small"
          >
            Add Alias
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={CippExchangeActions()}
      actionsData={userRequest.data?.[0]?.MailboxActionsData}
      isFetching={graphUserRequest.isLoading}
    >
      <CippApiResults apiObject={userRequest} errorsOnly={true} />
      {graphUserRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {graphUserRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            {userRequest?.data?.[0]?.Mailbox?.[0]?.error && (
              <Grid item size={12}>
                <Alert severity="error">
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">
                      {userRequest?.data?.[0]?.Mailbox?.[0]?.error.includes(
                        "Microsoft.Exchange.Configuration.Tasks.ManagementObjectNotFoundException"
                      )
                        ? "This user does not have a mailbox, make sure they are licensed for Exchange."
                        : "An error occurred while fetching the mailbox details."}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowDetails(!showDetails)}
                      sx={{ mr: 1 }}
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </Button>
                  </Box>
                  <Collapse in={showDetails}>
                    <Box mt={2}>{userRequest?.data?.[0]?.Mailbox?.[0]?.error}</Box>
                  </Collapse>
                </Alert>
              </Grid>
            )}
            {!userRequest?.data?.[0]?.Mailbox?.[0]?.error?.includes(
              "Microsoft.Exchange.Configuration.Tasks.ManagementObjectNotFoundException"
            ) && (
              <>
                <Grid item size={4}>
                  <CippExchangeInfoCard
                    exchangeData={data}
                    isLoading={userRequest.isLoading}
                    isFetching={userRequest.isFetching}
                    handleRefresh={() => userRequest.refetch()}
                  />
                </Grid>
                <Grid item size={8}>
                  <Stack spacing={3}>
                    <CippBannerListCard
                      isFetching={graphUserRequest.isLoading}
                      items={proxyAddressesCard}
                      isCollapsible={graphUserRequest.data?.[0]?.proxyAddresses?.length !== 0}
                    />
                    <CippBannerListCard
                      isFetching={userRequest.isLoading}
                      items={permissions}
                      isCollapsible={userRequest.data?.[0]?.Permissions?.length !== 0}
                    />
                    <CippBannerListCard
                      isFetching={calPermissions.isLoading}
                      items={calCard}
                      isCollapsible={calPermissions.data?.length !== 0}
                    />
                    <CippBannerListCard
                      isFetching={mailboxRulesRequest.isLoading}
                      items={mailboxRulesCard}
                      isCollapsible={mailboxRulesRequest.data?.length !== 0}
                    />
                    <CippExchangeSettingsForm
                      userId={userId}
                      calPermissions={calPermissions.data}
                      currentSettings={userRequest.data?.[0]}
                      isFetching={userRequest.isFetching}
                      formControl={formControl}
                    />
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          api={actionData.action}
          row={actionData.data}
        />
      )}
      <Dialog 
        open={showAddAliasDialog} 
        onClose={() => setShowAddAliasDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add Proxy Addresses
            <IconButton onClick={() => setShowAddAliasDialog(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={6}
              value={newAliases}
              onChange={(e) => setNewAliases(e.target.value)}
              placeholder="One alias per line"
              variant="outlined"
              disabled={isSubmitting}
            />
            {submitResult && (
              <Alert 
                severity={submitResult.success ? "success" : "error"}
                sx={{ mt: 2 }}
              >
                {submitResult.message}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShowAddAliasDialog(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddAliases} 
            variant="contained" 
            color="primary"
            disabled={!newAliases.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? 'Adding...' : 'Add Aliases'}
          </Button>
        </DialogActions>
      </Dialog>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
