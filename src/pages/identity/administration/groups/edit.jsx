import { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
  Tooltip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack, Container, Grid } from "@mui/system";
import {
  Groups,
  Public,
  PublicOff,
  PersonAdd,
  PersonRemove,
  SupervisorAccount,
  ArrowBack,
  Settings,
  CheckCircle,
  Cancel,
  People,
  Security,
  Email,
  GroupSharp,
  DynamicFeed,
  Sync,
  ContactMail,
  Edit,
  Save,
  VpnKey,
  DevicesOther,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../../hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../../hooks/use-dialog";
import { showToast } from "../../../../store/toasts";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormLicenseSelector } from "../../../../components/CippComponents/CippFormLicenseSelector";
import { getCippLicenseTranslation } from "../../../../utils/get-cipp-license-translation";

const StatBox = ({ value, label, color }) => (
  <Box sx={{ textAlign: "center", px: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700, color: `${color}.main`, lineHeight: 1.2 }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const EditGroup = () => {
  const router = useRouter();
  const { groupId } = router.query;
  const tenantFilter = useSettings().currentTenant;
  const theme = useTheme();
  const dispatch = useDispatch();

  const groupInfo = ApiGetCall({
    url: "/api/ListGroups",
    data: {
      groupID: groupId,
      tenantFilter: tenantFilter,
      members: true,
      owners: true,
      groupType: router.query.groupType,
    },
    queryKey: `ListGroups-${groupId}`,
    waiting: !!(groupId && tenantFilter),
  });

  // Extract data
  const group = groupInfo.data?.groupInfo;
  const owners = Array.isArray(groupInfo.data?.owners) ? groupInfo.data.owners : [];
  const rawMembers = Array.isArray(groupInfo.data?.members) ? groupInfo.data.members : [];
  const members = rawMembers.filter((m) => m?.["@odata.type"] !== "#microsoft.graph.orgContact");
  const contacts = rawMembers.filter((m) => m?.["@odata.type"] === "#microsoft.graph.orgContact");
  const groupName = group?.displayName || "";

  const computedGroupType = (() => {
    if (!group) return router.query.groupType || null;
    if (group.groupTypes?.includes("Unified")) return "Microsoft 365";
    if (!group.mailEnabled && group.securityEnabled) return "Security";
    if (group.mailEnabled && group.securityEnabled) return "Mail-Enabled Security";
    if (
      (!group.groupTypes || group.groupTypes.length === 0) &&
      group.mailEnabled &&
      !group.securityEnabled
    )
      return "Distribution List";
    return router.query.groupType || null;
  })();

  const isDynamic = group?.membershipRule || group?.groupTypes?.includes("DynamicMembership");
  const isOnPrem = group?.onPremisesSyncEnabled;
  const isM365 = computedGroupType === "Microsoft 365";
  const isDistribution = computedGroupType === "Distribution List";
  const isMailEnabledSecurity = computedGroupType === "Mail-Enabled Security";
  const isSecurityGroup = computedGroupType === "Security";
  const showContacts = isDistribution || isMailEnabledSecurity;
  const showDevices = !isDistribution && !isMailEnabledSecurity;
  const hasSettings = isM365 || isDistribution || isMailEnabledSecurity;
  const showLicenseManagement = isSecurityGroup && !isOnPrem;

  const getGroupTypeStyle = () => {
    switch (computedGroupType) {
      case "Microsoft 365":
        return {
          label: "Microsoft 365",
          color: theme.palette.primary.main,
          icon: <GroupSharp fontSize="small" />,
        };
      case "Distribution List":
        return {
          label: "Distribution List",
          color: theme.palette.info.main,
          icon: <Email fontSize="small" />,
        };
      case "Mail-Enabled Security":
        return {
          label: "Mail-Enabled Security",
          color: theme.palette.warning.main,
          icon: <Security fontSize="small" />,
        };
      case "Security":
        return {
          label: "Security Group",
          color: theme.palette.warning.main,
          icon: <Security fontSize="small" />,
        };
      default:
        return {
          label: "Group",
          color: theme.palette.grey[600],
          icon: <People fontSize="small" />,
        };
    }
  };
  const groupTypeStyle = getGroupTypeStyle();

  // --- Dialogs ---
  const addMemberDialog = useDialog();
  const addOwnerDialog = useDialog();
  const addContactDialog = useDialog();
  const addDeviceDialog = useDialog();

  const userPickerField = [
    {
      type: "autoComplete",
      name: "UserID",
      label: "Select User",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListGraphRequest",
        data: {
          Endpoint: "users",
          $filter: "accountEnabled eq true",
          $top: 999,
          $count: true,
          $orderby: "displayName",
          $select: "id,displayName,userPrincipalName",
        },
        dataKey: "Results",
        labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
        valueField: "id",
        addedField: {
          userPrincipalName: "userPrincipalName",
          displayName: "displayName",
          id: "id",
        },
      },
      validators: {
        validate: (value) => (!value ? "Please select a user" : true),
      },
    },
  ];

  // Members can be users or nested groups (owners remain users-only)
  const memberPickerField = [
    {
      type: "autoComplete",
      name: "UserID",
      label: "Select User or Group",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListUsersAndGroups",
        data: { TenantFilter: tenantFilter },
        dataKey: "Results",
        queryKey: `ListUsersAndGroups-${tenantFilter}`,
        labelField: (option) => {
          if (option.userPrincipalName)
            return `${option.displayName} (${option.userPrincipalName})`;
          const groupType =
            option.mailEnabled && !option.securityEnabled
              ? "Distribution Group"
              : option.mailEnabled && option.securityEnabled
                ? "Mail-Enabled Security Group"
                : "Security Group";
          return `${option.displayName} (${groupType})`;
        },
        valueField: "id",
        addedField: {
          userPrincipalName: "userPrincipalName",
          displayName: "displayName",
          id: "id",
        },
      },
      validators: {
        validate: (value) => (!value ? "Please select a user or group" : true),
      },
    },
  ];

  const contactPickerField = [
    {
      type: "autoComplete",
      name: "ContactID",
      label: "Select Contact",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListContacts",
        labelField: (option) =>
          `${option.displayName || option.DisplayName} (${
            option.mail || option.WindowsEmailAddress
          })`,
        valueField: "WindowsEmailAddress",
        addedField: {
          Guid: "Guid",
          displayName: "displayName",
          WindowsEmailAddress: "WindowsEmailAddress",
        },
      },
      validators: {
        validate: (value) => (!value ? "Please select a contact" : true),
      },
    },
  ];

  const devicePickerField = [
    {
      type: "autoComplete",
      name: "DeviceID",
      label: "Select Device",
      multiple: false,
      creatable: false,
      api: {
        url: "/api/ListGraphRequest",
        dataKey: "Results",
        data: {
          Endpoint: "devices",
          manualPagination: true,
          $select: "id,displayName,operatingSystem",
          $count: true,
          $orderby: "displayName",
          $top: 999,
        },
        labelField: (option) =>
          option?.operatingSystem
            ? `${option.displayName} (${option.operatingSystem})`
            : (option?.displayName ?? ""),
        valueField: "id",
        addedField: {
          displayName: "displayName",
          deviceName: "displayName",
        },
        queryKey: `ListDevices-${tenantFilter}`,
        dataFilter: (options) =>
          options.filter((option) => !members.some((m) => m.id === option.value)),
        showRefresh: true,
      },
      validators: {
        validate: (value) => (!value ? "Please select a device" : true),
      },
    },
  ];

  const addMemberApi = {
    url: "/api/EditGroup",
    type: "POST",
    customDataformatter: (row, action, formData) => ({
      tenantFilter,
      groupId,
      groupType: computedGroupType,
      groupName,
      AddMember: [formData.UserID],
    }),
    confirmText: "Select a user or group to add as a member to this group.",
    relatedQueryKeys: [`ListGroups-${groupId}`],
  };

  const addOwnerApi = {
    url: "/api/EditGroup",
    type: "POST",
    customDataformatter: (row, action, formData) => ({
      tenantFilter,
      groupId,
      groupType: computedGroupType,
      groupName,
      AddOwner: [formData.UserID],
    }),
    confirmText:
      "Select a user to add as an owner. Owners can manage group settings and membership.",
    relatedQueryKeys: [`ListGroups-${groupId}`],
  };

  const addContactApi = {
    url: "/api/EditGroup",
    type: "POST",
    customDataformatter: (row, action, formData) => ({
      tenantFilter,
      groupId,
      groupType: computedGroupType,
      groupName,
      AddContact: [formData.ContactID],
    }),
    confirmText: "Select a contact to add to this group.",
    relatedQueryKeys: [`ListGroups-${groupId}`],
  };

  const addDeviceApi = {
    url: "/api/EditGroup",
    type: "POST",
    customDataformatter: (row, action, formData) => ({
      tenantFilter,
      groupId,
      groupType: computedGroupType,
      groupName,
      AddDevice: [formData.DeviceID],
    }),
    confirmText: "Select a device to add as a member of this group.",
    relatedQueryKeys: [`ListGroups-${groupId}`],
  };

  // --- Row Actions ---
  const ownerActions = [
    {
      label: "Remove Owner",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/EditGroup",
      dataFunction: (row) => ({
        tenantFilter,
        groupId,
        groupType: computedGroupType,
        groupName,
        RemoveOwner: [
          {
            value: row.id,
            addedFields: {
              userPrincipalName: row.userPrincipalName,
              displayName: row.displayName,
              id: row.id,
            },
          },
        ],
      }),
      confirmText: "Remove this owner from the group? Ensure at least one owner remains.",
      color: "error",
      category: "danger",
      relatedQueryKeys: [`ListGroups-${groupId}`],
    },
  ];

  const memberActions = [
    {
      label: "Remove Member",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/EditGroup",
      dataFunction: (row) => ({
        tenantFilter,
        groupId,
        groupType: computedGroupType,
        groupName,
        RemoveMember: [
          {
            value: row.id,
            addedFields: {
              userPrincipalName: row.userPrincipalName,
              displayName: row.displayName,
              id: row.id,
            },
          },
        ],
      }),
      confirmText: "Remove this member from the group?",
      color: "error",
      category: "danger",
      relatedQueryKeys: [`ListGroups-${groupId}`],
    },
  ];

  const contactActions = [
    {
      label: "Remove Contact",
      type: "POST",
      icon: <PersonRemove />,
      url: "/api/EditGroup",
      dataFunction: (row) => ({
        tenantFilter,
        groupId,
        groupType: computedGroupType,
        groupName,
        RemoveContact: [{ value: row.mail, addedFields: { id: row.id } }],
      }),
      confirmText: "Remove this contact from the group?",
      color: "error",
      category: "danger",
      relatedQueryKeys: [`ListGroups-${groupId}`],
    },
  ];

  // --- Settings Toggle ---
  const [loadingField, setLoadingField] = useState(null);
  const settingsMutation = ApiPostCall({ relatedQueryKeys: [`ListGroups-${groupId}`] });

  const handleSettingToggle = useCallback(
    (field, newValue) => {
      setLoadingField(field);
      const payload = {
        tenantFilter,
        groupId,
        groupType: computedGroupType,
      };
      if (field === "allowExternal" || field === "sendCopies") {
        payload.mail = group?.mail;
      }
      if (field === "securityEnabled") {
        payload.displayName = groupName;
      }
      payload[field] = newValue;

      settingsMutation.mutate(
        { url: "/api/EditGroup", data: payload },
        {
          onSuccess: (res) => {
            const msg = Array.isArray(res?.data?.Results)
              ? res.data.Results.join(", ")
              : "Setting updated successfully";
            dispatch(showToast({ message: msg, title: "Group Settings" }));
            setLoadingField(null);
            groupInfo.refetch();
          },
          onError: (err) => {
            const msg =
              err?.response?.data?.Results?.[0] || err?.message || "Failed to update setting";
            dispatch(
              showToast({ message: msg, title: "Group Settings", toastError: { message: msg } })
            );
            setLoadingField(null);
          },
        }
      );
    },
    [tenantFilter, groupId, computedGroupType, groupName, group?.mail, settingsMutation, dispatch, groupInfo]
  );

  // --- Properties Form ---
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      description: "",
      mailNickname: "",
      membershipRules: "",
    },
  });

  const propertiesMutation = ApiPostCall({ relatedQueryKeys: [`ListGroups-${groupId}`] });
  const [propertiesSaving, setPropertiesSaving] = useState(false);

  const licenseFormControl = useForm({
    mode: "onChange",
    defaultValues: {
      AddLicenses: [],
      RemoveLicenses: [],
    },
  });
  const licenseMutation = ApiPostCall({ relatedQueryKeys: [`ListGroups-${groupId}`] });
  const [licensesSaving, setLicensesSaving] = useState(false);

  useEffect(() => {
    if (groupInfo.isSuccess && group) {
      formControl.reset({
        displayName: group.displayName || "",
        description: group.description || "",
        mailNickname: group.mailNickname || "",
        membershipRules: group.membershipRule || "",
      });
      licenseFormControl.reset({
        AddLicenses: [],
        RemoveLicenses: [],
      });
    }
  }, [groupInfo.isSuccess, groupInfo.isFetching]);

  const handleSaveProperties = useCallback(
    (formData) => {
      setPropertiesSaving(true);
      propertiesMutation.mutate(
        {
          url: "/api/EditGroup",
          data: {
            tenantFilter,
            groupId,
            groupType: computedGroupType,
            displayName: formData.displayName,
            description: formData.description,
            mailNickname: formData.mailNickname,
            ...(isDynamic ? { membershipRules: formData.membershipRules } : {}),
          },
        },
        {
          onSuccess: (res) => {
            const msg = Array.isArray(res?.data?.Results)
              ? res.data.Results.join(", ")
              : "Properties updated successfully";
            dispatch(showToast({ message: msg, title: "Group Properties" }));
            setPropertiesSaving(false);
            groupInfo.refetch();
          },
          onError: (err) => {
            const msg =
              err?.response?.data?.Results?.[0] || err?.message || "Failed to update properties";
            dispatch(
              showToast({
                message: msg,
                title: "Group Properties",
                toastError: { message: msg },
              })
            );
            setPropertiesSaving(false);
          },
        }
      );
    },
    [tenantFilter, groupId, computedGroupType, isDynamic, propertiesMutation, dispatch, groupInfo]
  );

  const handleSaveLicenses = useCallback(
    (formData) => {
      const addLicenses = formData.AddLicenses || [];
      const removeLicenses = formData.RemoveLicenses || [];
      if (addLicenses.length === 0 && removeLicenses.length === 0) {
        dispatch(
          showToast({
            message: "Select at least one license to add or remove.",
            title: "Group Licenses",
            toastError: { message: "No license changes selected." },
          })
        );
        return;
      }

      setLicensesSaving(true);
      licenseMutation.mutate(
        {
          url: "/api/EditGroup",
          data: {
            tenantFilter,
            groupId,
            groupType: computedGroupType,
            groupName,
            AddLicenses: addLicenses,
            RemoveLicenses: removeLicenses,
          },
        },
        {
          onSuccess: (res) => {
            const msg = Array.isArray(res?.data?.Results)
              ? res.data.Results.join(", ")
              : "License changes submitted successfully";
            dispatch(showToast({ message: msg, title: "Group Licenses" }));
            setLicensesSaving(false);
            licenseFormControl.reset({ AddLicenses: [], RemoveLicenses: [] });
            groupInfo.refetch();
          },
          onError: (err) => {
            const msg =
              err?.response?.data?.Results?.[0] || err?.message || "Failed to update group licenses";
            dispatch(
              showToast({
                message: msg,
                title: "Group Licenses",
                toastError: { message: msg },
              })
            );
            setLicensesSaving(false);
          },
        }
      );
    },
    [
      tenantFilter,
      groupId,
      computedGroupType,
      groupName,
      licenseMutation,
      dispatch,
      groupInfo,
      licenseFormControl,
    ]
  );

  // --- Loading state ---
  if (!router.isReady || groupInfo.isLoading) {
    return (
      <>
        <CippHead title="Group Details" />
        <Container maxWidth={false}>
          <Stack spacing={2} sx={{ py: 4 }}>
            <Button
              component={Link}
              href="/identity/administration/groups"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: "flex-start" }}
            >
              Back to Groups
            </Button>
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          </Stack>
        </Container>
      </>
    );
  }

  // --- Error state ---
  if (groupInfo.isError || !group) {
    return (
      <>
        <CippHead title="Group Details" />
        <Container maxWidth={false}>
          <Stack spacing={2} sx={{ py: 4 }}>
            <Button
              component={Link}
              href="/identity/administration/groups"
              startIcon={<ArrowBack />}
              sx={{ alignSelf: "flex-start" }}
            >
              Back to Groups
            </Button>
            <Alert severity="error">
              Failed to load group details. The group may not exist or you may not have permission to
              view it.
            </Alert>
          </Stack>
        </Container>
      </>
    );
  }

  // Build settings list
  const settingsList = [];
  if (isM365) {
    settingsList.push({
      label: group.visibility === "Public" ? "Public" : "Private",
      field: "visibility",
      icon:
        group.visibility === "Public" ? (
          <Public fontSize="small" />
        ) : (
          <PublicOff fontSize="small" />
        ),
      isEnabled: group.visibility === "Public",
      toggleValue: group.visibility === "Public" ? "Private" : "Public",
    });
  }
  if (isM365 || isDistribution) {
    settingsList.push({
      label: "Allow External Senders",
      field: "allowExternal",
      isEnabled: groupInfo.data?.allowExternal === true,
      toggleValue: !(groupInfo.data?.allowExternal === true),
    });
  }
  if (isM365) {
    settingsList.push({
      label: "Send Copies to Inboxes",
      field: "sendCopies",
      isEnabled: groupInfo.data?.sendCopies === true,
      toggleValue: !(groupInfo.data?.sendCopies === true),
    });
    settingsList.push({
      label: "Hide from Outlook",
      field: "hideFromOutlookClients",
      isEnabled: groupInfo.data?.hideFromOutlookClients === true,
      toggleValue: !(groupInfo.data?.hideFromOutlookClients === true),
    });
    settingsList.push({
      label: "Security Enabled",
      field: "securityEnabled",
      isEnabled: group.securityEnabled === true,
      toggleValue: !group.securityEnabled,
    });
  }

  // Name column with guest badge (reusable)
  const nameColumnWithGuestBadge = {
    header: "Name",
    id: "displayName",
    accessorKey: "displayName",
    size: 200,
    Cell: ({ row }) => {
      const email = (row.original.userPrincipalName || row.original.mail || "").toLowerCase();
      const isGuest = email.includes("#ext#") || email.includes("_ext_@");
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="body2">{row.original.displayName}</Typography>
          {isGuest && (
            <Chip
              icon={<PersonAdd sx={{ fontSize: 14 }} />}
              label="Guest"
              size="small"
              color="info"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem", "& .MuiChip-label": { px: 0.5 } }}
            />
          )}
        </Stack>
      );
    },
  };

  return (
    <>
      <CippHead title={`${groupName} - Group Details`} />
      <Container maxWidth={false}>
        <Stack spacing={2} sx={{ py: 3 }}>
          {/* Back Button */}
          <Button
            component={Link}
            href="/identity/administration/groups"
            startIcon={<ArrowBack />}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to Groups
          </Button>

          {/* On-prem sync warning */}
          {isOnPrem && (
            <Alert severity="warning" icon={<Sync />}>
              This group is synced from on-premises Active Directory. Some changes should be made in
              the on-premises environment.
            </Alert>
          )}

          {/* Hero + Stats */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    groupTypeStyle.color,
                    0.12
                  )} 0%, ${alpha(groupTypeStyle.color, 0.04)} 100%)`,
                  borderLeft: `4px solid ${groupTypeStyle.color}`,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: alpha(groupTypeStyle.color, 0.15),
                      color: groupTypeStyle.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Groups sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
                      {groupName}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        icon={groupTypeStyle.icon}
                        label={groupTypeStyle.label}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(groupTypeStyle.color, 0.1),
                          color: groupTypeStyle.color,
                          borderColor: groupTypeStyle.color,
                        }}
                        variant="outlined"
                      />
                      {isM365 && group.visibility && (
                        <Chip
                          icon={
                            group.visibility === "Public" ? (
                              <Public fontSize="small" />
                            ) : (
                              <PublicOff fontSize="small" />
                            )
                          }
                          label={group.visibility}
                          size="small"
                          color={group.visibility === "Public" ? "success" : "warning"}
                          variant="outlined"
                        />
                      )}
                      {isDynamic && (
                        <Chip
                          icon={<DynamicFeed fontSize="small" />}
                          label="Dynamic"
                          size="small"
                          color="info"
                          variant="filled"
                        />
                      )}
                      {isOnPrem && (
                        <Chip
                          icon={<Sync fontSize="small" />}
                          label="On-Prem Synced"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    {group.mail && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                        noWrap
                      >
                        {group.mail}
                      </Typography>
                    )}
                    {group.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {group.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0}
                  divider={<Divider orientation="vertical" flexItem />}
                  justifyContent="space-around"
                  sx={{ width: "100%" }}
                >
                  <StatBox value={owners.length} label="Owners" color="warning" />
                  <StatBox value={members.length} label="Members" color="info" />
                  {showContacts && (
                    <StatBox value={contacts.length} label="Contacts" color="success" />
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Owners + Members side by side */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SupervisorAccount fontSize="small" color="warning" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Owners ({owners.length})
                    </Typography>
                  </Stack>
                  {!isDistribution && !isMailEnabledSecurity && (
                    <Button
                      size="small"
                      startIcon={<PersonAdd />}
                      onClick={() => addOwnerDialog.handleOpen()}
                    >
                      Add
                    </Button>
                  )}
                </Stack>
                <Box sx={{ px: 0 }}>
                  <CippDataTable
                    title="Owners"
                    data={owners}
                    isFetching={groupInfo.isFetching}
                    columnsFromApi={false}
                    columns={[
                      nameColumnWithGuestBadge,
                      {
                        header: "Email",
                        id: "userPrincipalName",
                        accessorKey: "userPrincipalName",
                      },
                    ]}
                    actions={ownerActions}
                    queryKey={`group-owners-${groupId}`}
                    refreshFunction={() => groupInfo.refetch()}
                    noCard
                    hideTitle
                    maxHeightOffset="600px"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <People fontSize="small" color="info" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Members ({members.length})
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {showDevices && (
                      <Button
                        size="small"
                        startIcon={<DevicesOther />}
                        onClick={() => addDeviceDialog.handleOpen()}
                      >
                        Add Device
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<PersonAdd />}
                      onClick={() => addMemberDialog.handleOpen()}
                    >
                      Add
                    </Button>
                  </Stack>
                </Stack>
                <Box sx={{ px: 0 }}>
                  <CippDataTable
                    title="Members"
                    data={members}
                    isFetching={groupInfo.isFetching}
                    columnsFromApi={false}
                    columns={[
                      nameColumnWithGuestBadge,
                      {
                        header: "Email",
                        id: "userPrincipalName",
                        accessorKey: "userPrincipalName",
                        // Nested groups have no UPN - show the group type instead
                        Cell: ({ row: tableRow }) => {
                          const m = tableRow.original;
                          if (m.userPrincipalName) return m.userPrincipalName;
                          if (m["@odata.type"] === "#microsoft.graph.group") {
                            return m.mailEnabled && !m.securityEnabled
                              ? "Distribution Group"
                              : m.mailEnabled && m.securityEnabled
                                ? "Mail-Enabled Security Group"
                                : "Security Group";
                          }
                          return "";
                        },
                      },
                    ]}
                    actions={memberActions}
                    queryKey={`group-members-${groupId}`}
                    refreshFunction={() => groupInfo.refetch()}
                    noCard
                    hideTitle
                    maxHeightOffset="600px"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Contacts (conditional) */}
          {showContacts && (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ContactMail fontSize="small" color="success" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Contacts ({contacts.length})
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  startIcon={<PersonAdd />}
                  onClick={() => addContactDialog.handleOpen()}
                >
                  Add
                </Button>
              </Stack>
              <Box sx={{ px: 0 }}>
                <CippDataTable
                  title="Contacts"
                  data={contacts}
                  isFetching={groupInfo.isFetching}
                  columnsFromApi={false}
                  columns={[
                    {
                      header: "Name",
                      id: "displayName",
                      accessorKey: "displayName",
                      size: 200,
                    },
                    { header: "Email", id: "mail", accessorKey: "mail" },
                  ]}
                  actions={contactActions}
                  queryKey={`group-contacts-${groupId}`}
                  refreshFunction={() => groupInfo.refetch()}
                  noCard
                  hideTitle
                  maxHeightOffset="600px"
                />
              </Box>
            </Paper>
          )}

          {/* Properties + Settings */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: hasSettings ? 6 : 12 }}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
                >
                  <Edit fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Group Properties
                  </Typography>
                </Stack>
                <Box sx={{ p: 2 }}>
                  <form onSubmit={formControl.handleSubmit(handleSaveProperties)}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CippFormComponent
                          type="textField"
                          fullWidth
                          label="Display Name"
                          name="displayName"
                          formControl={formControl}
                          isFetching={groupInfo.isFetching}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CippFormComponent
                          type="textField"
                          fullWidth
                          label="Description"
                          name="description"
                          formControl={formControl}
                          isFetching={groupInfo.isFetching}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <CippFormComponent
                          type="textField"
                          fullWidth
                          label="Mail Nickname"
                          name="mailNickname"
                          formControl={formControl}
                          isFetching={groupInfo.isFetching}
                        />
                      </Grid>
                      {isDynamic && (
                        <Grid size={{ xs: 12 }}>
                          <CippFormComponent
                            type="textField"
                            fullWidth
                            label="Membership Rules"
                            name="membershipRules"
                            formControl={formControl}
                            isFetching={groupInfo.isFetching}
                          />
                        </Grid>
                      )}
                      <Grid size={{ xs: 12 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={
                            propertiesSaving ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Save />
                            )
                          }
                          disabled={propertiesSaving}
                          size="small"
                        >
                          {propertiesSaving ? "Saving..." : "Save Properties"}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </Paper>
            </Grid>

            {hasSettings && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
                  >
                    <Settings fontSize="small" color="action" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Group Settings
                    </Typography>
                  </Stack>
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      {settingsList.map(({ label, field, icon, isEnabled, toggleValue }) => {
                        const isLoading = loadingField === field;
                        return (
                          <Tooltip
                            key={field}
                            title={`${label} — Click to ${
                              field === "visibility"
                                ? isEnabled
                                  ? "make Private"
                                  : "make Public"
                                : isEnabled
                                ? "disable"
                                : "enable"
                            }`}
                            arrow
                            placement="left"
                          >
                            <Chip
                              label={label}
                              icon={
                                isLoading ? (
                                  <CircularProgress size={14} color="inherit" />
                                ) : icon ? (
                                  icon
                                ) : isEnabled ? (
                                  <CheckCircle fontSize="small" />
                                ) : (
                                  <Cancel fontSize="small" />
                                )
                              }
                              color={isEnabled ? "success" : "default"}
                              variant={isEnabled ? "filled" : "outlined"}
                              size="small"
                              disabled={isLoading || isOnPrem}
                              onClick={() => handleSettingToggle(field, toggleValue)}
                              sx={{
                                fontWeight: 500,
                                justifyContent: "flex-start",
                                cursor: isOnPrem ? "not-allowed" : "pointer",
                                "&:hover": { opacity: 0.85, transform: "scale(1.01)" },
                                transition: "all 0.15s ease-in-out",
                                ...(isEnabled && {
                                  bgcolor: alpha(theme.palette.success.main, 0.85),
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.success.main, 0.7),
                                    transform: "scale(1.01)",
                                  },
                                }),
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                      {isOnPrem && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Settings are read-only for on-premises synced groups.
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>

          {showLicenseManagement && (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
              >
                <VpnKey fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Group Licenses
                </Typography>
              </Stack>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Licenses assigned to this group are automatically applied to all members. Changes
                  can take 2-5 minutes to propagate.
                </Typography>

                {group.assignedLicenses?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Currently assigned licenses
                    </Typography>
                    {group.assignedLicenses.map((lic) => (
                      <Typography key={lic.skuId} variant="body2">
                        - {getCippLicenseTranslation([lic])}
                      </Typography>
                    ))}
                  </Box>
                )}

                <form onSubmit={licenseFormControl.handleSubmit(handleSaveLicenses)}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormLicenseSelector
                        formControl={licenseFormControl}
                        name="AddLicenses"
                        label="Add Licenses"
                        multiple={true}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="RemoveLicenses"
                        label="Remove Licenses"
                        formControl={licenseFormControl}
                        multiple={true}
                        creatable={false}
                        options={
                          group.assignedLicenses?.map((lic) => ({
                            label: getCippLicenseTranslation([lic]),
                            value: lic.skuId,
                          })) || []
                        }
                        sortOptions={true}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={
                          licensesSaving ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <Save />
                          )
                        }
                        disabled={licensesSaving}
                        size="small"
                      >
                        {licensesSaving ? "Saving..." : "Update Licenses"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Paper>
          )}

          {/* Dynamic membership rule display */}
          {isDynamic && group.membershipRule && (
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ px: 2, py: 1.5, bgcolor: "background.default" }}
              >
                <DynamicFeed fontSize="small" color="info" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Current Membership Rule
                </Typography>
              </Stack>
              <Box sx={{ p: 2 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}
                  >
                    {group.membershipRule}
                  </Typography>
                </Paper>
              </Box>
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Dialogs */}
      <CippApiDialog
        createDialog={addMemberDialog}
        title="Add Member (User or Group)"
        fields={memberPickerField}
        api={addMemberApi}
        row={{}}
        relatedQueryKeys={[`ListGroups-${groupId}`]}
      />
      <CippApiDialog
        createDialog={addOwnerDialog}
        title="Add Owner"
        fields={userPickerField}
        api={addOwnerApi}
        row={{}}
        relatedQueryKeys={[`ListGroups-${groupId}`]}
      />
      {showContacts && (
        <CippApiDialog
          createDialog={addContactDialog}
          title="Add Contact"
          fields={contactPickerField}
          api={addContactApi}
          row={{}}
          relatedQueryKeys={[`ListGroups-${groupId}`]}
        />
      )}
      {showDevices && (
        <CippApiDialog
          createDialog={addDeviceDialog}
          title="Add Device"
          fields={devicePickerField}
          api={addDeviceApi}
          row={{}}
          relatedQueryKeys={[`ListGroups-${groupId}`]}
        />
      )}
    </>
  );
};

EditGroup.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default EditGroup;
