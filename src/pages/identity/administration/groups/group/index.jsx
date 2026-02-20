import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useSettings } from "../../../../../hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippFormSkeleton from "../../../../../components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import {
  Group,
  Mail,
  Fingerprint,
  Launch,
  Person,
  AdminPanelSettings,
  Visibility,
  Lock,
  LockOpen,
  CloudSync,
  GroupSharp,
  GroupAdd,
} from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { SvgIcon, Typography, Card, CardHeader, Divider } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";
import { PropertyList } from "../../../../../components/property-list";
import { PropertyListItem } from "../../../../../components/property-list-item";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import { CippHead } from "../../../../../components/CippComponents/CippHead";
import { Button } from "@mui/material";
import { Edit } from "@mui/icons-material";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { groupId } = router.query;
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (groupId) {
      setWaiting(true);
    }
  }, [groupId]);

  const groupRequest = ApiGetCall({
    url: `/api/ListGraphRequest`,
    data: {
      Endpoint: `groups/${groupId}`,
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `Group-${groupId}`,
    waiting: waiting,
  });

  const groupBulkRequest = ApiPostCall({
    urlFromData: true,
  });

  function refreshFunction() {
    if (!groupId) return;
    const requests = [
      {
        id: "groupMembers",
        url: `/groups/${groupId}/members`,
        method: "GET",
      },
      {
        id: "groupOwners",
        url: `/groups/${groupId}/owners`,
        method: "GET",
      },
      {
        id: "groupMemberOf",
        url: `/groups/${groupId}/memberOf`,
        method: "GET",
      },
    ];

    groupBulkRequest.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        Requests: requests,
        tenantFilter: userSettingsDefaults.currentTenant,
      },
    });
  }

  useEffect(() => {
    if (
      groupId &&
      userSettingsDefaults.currentTenant &&
      groupRequest.isSuccess &&
      !groupBulkRequest.isSuccess
    ) {
      refreshFunction();
    }
  }, [groupId, userSettingsDefaults.currentTenant, groupRequest.isSuccess, groupBulkRequest.isSuccess]);

  // Handle response structure - ListGraphRequest may wrap single items in Results array
  let groupData = null;
  if (groupRequest.isSuccess && groupRequest.data) {
    if (Array.isArray(groupRequest.data.Results)) {
      groupData = groupRequest.data.Results[0];
    } else if (groupRequest.data.Results) {
      groupData = groupRequest.data.Results;
    } else {
      groupData = groupRequest.data;
    }
  }

  const bulkData = groupBulkRequest?.data?.data ?? [];
  const groupMembersData = bulkData?.find((item) => item.id === "groupMembers");
  const groupOwnersData = bulkData?.find((item) => item.id === "groupOwners");
  const groupMemberOfData = bulkData?.find((item) => item.id === "groupMemberOf");

  const groupMembers = groupMembersData?.body?.value || [];
  const groupOwners = groupOwnersData?.body?.value || [];
  const groupMemberOf = groupMemberOfData?.body?.value || [];

  // Set the title and subtitle for the layout
  const title = groupRequest.isSuccess ? groupData?.displayName : "Loading...";

  const subtitle = groupRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={groupData?.mail || groupData?.mailNickname || "N/A"} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={groupData?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <CippTimeAgo data={groupData?.createdDateTime} />
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
              href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_IAM/GroupDetailsMenuBlade/~/Overview/groupId/${groupId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ]
    : [];

  // Calculate groupType and calculatedGroupType for actions
  const calculateGroupType = (group) => {
    if (!group) return { groupType: null, calculatedGroupType: null };
    let groupType = null;
    let calculatedGroupType = null;

    if (group.groupTypes?.includes("Unified")) {
      groupType = "Microsoft 365";
      calculatedGroupType = "m365";
    } else if (!group.mailEnabled && group.securityEnabled) {
      groupType = "Security";
      calculatedGroupType = "security";
    } else if (group.mailEnabled && group.securityEnabled) {
      groupType = "Mail-Enabled Security";
      calculatedGroupType = "mailenabledsecurity";
    } else if (
      (!group.groupTypes || group.groupTypes.length === 0) &&
      group.mailEnabled &&
      !group.securityEnabled
    ) {
      groupType = "Distribution List";
      calculatedGroupType = "distribution";
    }

    return { groupType, calculatedGroupType };
  };

  // Calculate group type and add to data for actions
  const { groupType, calculatedGroupType } = calculateGroupType(groupData);
  const data = groupData
    ? {
        ...groupData,
        groupType: groupType,
        calculatedGroupType: calculatedGroupType,
      }
    : null;

  // Calculate group type for display
  const getGroupType = () => {
    if (!groupData) return "N/A";
    if (groupData.groupTypes?.includes("Unified")) {
      return "Microsoft 365";
    }
    if (!groupData.mailEnabled && groupData.securityEnabled) {
      return "Security";
    }
    if (groupData.mailEnabled && groupData.securityEnabled) {
      return "Mail-Enabled Security";
    }
    if (
      (!groupData.groupTypes || groupData.groupTypes.length === 0) &&
      groupData.mailEnabled &&
      !groupData.securityEnabled
    ) {
      return "Distribution List";
    }
    return "N/A";
  };

  // Get group actions
  const getGroupActions = () => {
    if (!groupData) return [];
    const { groupType, calculatedGroupType } = calculateGroupType(groupData);

    return [
      {
        //tested
        label: "Edit Group",
        link: "/identity/administration/groups/edit?groupId=[id]&groupType=[groupType]",
        multiPost: false,
        icon: <Edit />,
        color: "success",
        showInActionsMenu: true,
      },
      {
        label: "Set Global Address List Visibility",
        type: "POST",
        url: "/api/ExecGroupsHideFromGAL",
        icon: <Visibility />,
        data: {
          ID: "mail",
          GroupType: "groupType",
        },
        fields: [
          {
            type: "radio",
            name: "HidefromGAL",
            label: "Global Address List Visibility",
            options: [
              { label: "Hidden", value: true },
              { label: "Shown", value: false },
            ],
            validators: { required: "Please select a visibility option" },
          },
        ],
        confirmText:
          "Are you sure you want to hide this group from the global address list? Remember this will not work if the group is AD Synched.",
        multiPost: false,
      },
      {
        label: "Only allow messages from people inside the organisation",
        type: "POST",
        url: "/api/ExecGroupsDeliveryManagement",
        icon: <Lock />,
        data: {
          ID: "mail",
          GroupType: "groupType",
          OnlyAllowInternal: true,
        },
        confirmText:
          "Are you sure you want to only allow messages from people inside the organisation? Remember this will not work if the group is AD Synched.",
        multiPost: false,
      },
      {
        label: "Allow messages from people inside and outside the organisation",
        type: "POST",
        icon: <LockOpen />,
        url: "/api/ExecGroupsDeliveryManagement",
        data: {
          ID: "mail",
          GroupType: "groupType",
          OnlyAllowInternal: false,
        },
        confirmText:
          "Are you sure you want to allow messages from people inside and outside the organisation? Remember this will not work if the group is AD Synched.",
        multiPost: false,
      },
      {
        label: "Set Source of Authority",
        type: "POST",
        url: "/api/ExecSetCloudManaged",
        icon: <CloudSync />,
        data: {
          ID: "id",
          displayName: "displayName",
          type: "!Group",
        },
        fields: [
          {
            type: "radio",
            name: "isCloudManaged",
            label: "Source of Authority",
            options: [
              { label: "Cloud Managed", value: true },
              { label: "On-Premises Managed", value: false },
            ],
            validators: { required: "Please select a source of authority" },
          },
        ],
        confirmText:
          "Are you sure you want to change the source of authority for '[displayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
        multiPost: false,
      },
      {
        label: "Create template based on group",
        type: "POST",
        url: "/api/AddGroupTemplate",
        icon: <GroupSharp />,
        data: {
          displayName: "displayName",
          description: "description",
          groupType: "calculatedGroupType",
          membershipRules: "membershipRule",
          allowExternal: "allowExternal",
          username: "mailNickname",
        },
        confirmText: "Are you sure you want to create a template based on this group?",
        multiPost: false,
      },
      {
        label: "Create Team from Group",
        type: "POST",
        url: "/api/AddGroupTeam",
        icon: <GroupAdd />,
        data: {
          GroupId: "id",
        },
        confirmText:
          "Are you sure you want to create a Team from this group? Note: The group must be at least 15 minutes old for this to work.",
        multiPost: false,
        defaultvalues: {
          TeamSettings: {
            memberSettings: {
              allowCreatePrivateChannels: false,
              allowCreateUpdateChannels: true,
              allowDeleteChannels: false,
              allowAddRemoveApps: false,
              allowCreateUpdateRemoveTabs: false,
              allowCreateUpdateRemoveConnectors: false,
            },
            messagingSettings: {
              allowUserEditMessages: true,
              allowUserDeleteMessages: true,
              allowOwnerDeleteMessages: false,
              allowTeamMentions: false,
              allowChannelMentions: false,
            },
            funSettings: {
              allowGiphy: true,
              giphyContentRating: "strict",
              allowStickersAndMemes: false,
              allowCustomMemes: false,
            },
          },
        },
        fields: [
          {
            type: "heading",
            name: "memberSettingsHeading",
            label: "Member Settings",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowCreatePrivateChannels",
            label: "Allow members to create private channels",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowCreateUpdateChannels",
            label: "Allow members to create and update channels",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowDeleteChannels",
            label: "Allow members to delete channels",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowAddRemoveApps",
            label: "Allow members to add and remove apps",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowCreateUpdateRemoveTabs",
            label: "Allow members to create, update and remove tabs",
          },
          {
            type: "switch",
            name: "TeamSettings.memberSettings.allowCreateUpdateRemoveConnectors",
            label: "Allow members to create, update and remove connectors",
          },
          {
            type: "heading",
            name: "messagingSettingsHeading",
            label: "Messaging Settings",
          },
          {
            type: "switch",
            name: "TeamSettings.messagingSettings.allowUserEditMessages",
            label: "Allow users to edit their messages",
          },
          {
            type: "switch",
            name: "TeamSettings.messagingSettings.allowUserDeleteMessages",
            label: "Allow users to delete their messages",
          },
          {
            type: "switch",
            name: "TeamSettings.messagingSettings.allowOwnerDeleteMessages",
            label: "Allow owners to delete messages",
          },
          {
            type: "switch",
            name: "TeamSettings.messagingSettings.allowTeamMentions",
            label: "Allow @team mentions",
          },
          {
            type: "switch",
            name: "TeamSettings.messagingSettings.allowChannelMentions",
            label: "Allow @channel mentions",
          },
          {
            type: "heading",
            name: "funSettingsHeading",
            label: "Fun Settings",
          },
          {
            type: "switch",
            name: "TeamSettings.funSettings.allowGiphy",
            label: "Allow Giphy",
          },
          {
            type: "select",
            name: "TeamSettings.funSettings.giphyContentRating",
            label: "Giphy content rating",
            options: [
              { value: "strict", label: "Strict" },
              { value: "moderate", label: "Moderate" },
            ],
          },
          {
            type: "switch",
            name: "TeamSettings.funSettings.allowStickersAndMemes",
            label: "Allow stickers and memes",
          },
          {
            type: "switch",
            name: "TeamSettings.funSettings.allowCustomMemes",
            label: "Allow custom memes",
          },
        ],
        condition: (row) => row?.calculatedGroupType === "m365",
      },
      {
        label: "Delete Group",
        type: "POST",
        url: "/api/ExecGroupsDelete",
        icon: <TrashIcon />,
        data: {
          ID: "id",
          GroupType: "groupType",
          DisplayName: "displayName",
        },
        confirmText: "Are you sure you want to delete this group.",
        multiPost: false,
      },
    ];
  };

  const groupActions = groupData ? getGroupActions() : [];

  // Prepare members items
  const membersItems =
    groupMembers.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <Person />,
            },
            text: "Members",
            subtext: "List of members in this group",
            statusText: ` ${groupMembers.length} Member(s)`,
            statusColor: "info.main",
            table: {
              title: "Members",
              hideTitle: true,
              actions: [
                {
                  icon: <EyeIcon />,
                  label: "View User",
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                  condition: (row) => row["@odata.type"] === "#microsoft.graph.user",
                },
              ],
              data: groupMembers,
              refreshFunction: refreshFunction,
              simpleColumns: ["displayName", "userPrincipalName", "mail", "@odata.type"],
            },
          },
        ]
      : groupMembersData?.status !== 200
      ? [
          {
            id: 1,
            cardLabelBox: "!",
            text: "Error loading members",
            subtext: groupMembersData?.body?.error?.message || "Unknown error",
            statusColor: "error.main",
            statusText: "Error",
            propertyItems: [],
          },
        ]
      : [
          {
            id: 1,
            cardLabelBox: "-",
            text: "No members",
            subtext: "This group has no members.",
            statusColor: "warning.main",
            statusText: "No Members",
            propertyItems: [],
          },
        ];

  // Prepare owners items
  const ownersItems =
    groupOwners.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <AdminPanelSettings />,
            },
            text: "Owners",
            subtext: "List of owners of this group",
            statusText: ` ${groupOwners.length} Owner(s)`,
            statusColor: "info.main",
            table: {
              title: "Owners",
              hideTitle: true,
              actions: [
                {
                  icon: <EyeIcon />,
                  label: "View User",
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                  condition: (row) => row["@odata.type"] === "#microsoft.graph.user",
                },
              ],
              data: groupOwners,
              refreshFunction: refreshFunction,
              simpleColumns: ["displayName", "userPrincipalName", "mail", "@odata.type"],
            },
          },
        ]
      : groupOwnersData?.status !== 200
      ? [
          {
            id: 1,
            cardLabelBox: "!",
            text: "Error loading owners",
            subtext: groupOwnersData?.body?.error?.message || "Unknown error",
            statusColor: "error.main",
            statusText: "Error",
            propertyItems: [],
          },
        ]
      : [
          {
            id: 1,
            cardLabelBox: "-",
            text: "No owners",
            subtext: "This group has no owners.",
            statusColor: "warning.main",
            statusText: "No Owners",
            propertyItems: [],
          },
        ];

  // Prepare group memberships items
  const groupMembershipItems =
    groupMemberOf.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <Group />,
            },
            text: "Group Memberships",
            subtext: "List of groups this group is a member of",
            statusText: ` ${
              groupMemberOf?.filter((item) => item?.["@odata.type"] === "#microsoft.graph.group").length
            } Group(s)`,
            statusColor: "info.main",
            table: {
              title: "Group Memberships",
              hideTitle: true,
              actions: [
                {
                  icon: <EyeIcon />,
                  label: "View Group",
                  link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                  condition: (row) => row["@odata.type"] === "#microsoft.graph.group",
                },
                {
                  icon: <PencilIcon />,
                  label: "Edit Group",
                  link: "/identity/administration/groups/edit?groupId=[id]&groupType=[calculatedGroupType]",
                  condition: (row) => row["@odata.type"] === "#microsoft.graph.group",
                },
              ],
              data: groupMemberOf?.filter((item) => item?.["@odata.type"] === "#microsoft.graph.group"),
              refreshFunction: refreshFunction,
              simpleColumns: ["displayName", "groupTypes", "securityEnabled", "mailEnabled"],
            },
          },
        ]
      : groupMemberOfData?.status !== 200
      ? [
          {
            id: 1,
            cardLabelBox: "!",
            text: "Error loading group memberships",
            subtext: groupMemberOfData?.body?.error?.message || "Unknown error",
            statusColor: "error.main",
            statusText: "Error",
            propertyItems: [],
          },
        ]
      : [
          {
            id: 1,
            cardLabelBox: "-",
            text: "No group memberships",
            subtext: "This group is not a member of any other groups.",
            statusColor: "warning.main",
            statusText: "No Groups",
            propertyItems: [],
          },
        ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={groupActions}
      actionsData={data}
      subtitle={subtitle}
      isFetching={groupRequest.isLoading}
    >
      {groupRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {groupRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={4}>
              <Card>
                <CardHeader title="Group Details" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack alignItems="center" spacing={1}>
                        <SvgIcon sx={{ fontSize: 64 }}>
                          <Group />
                        </SvgIcon>
                        <Typography variant="h6">{data?.displayName || "N/A"}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getGroupType()}
                        </Typography>
                      </Stack>
                    }
                  />
                  <PropertyListItem
                    divider
                    label="Group Information"
                    value={
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Display Name:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.displayName, "displayName") || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Group ID:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.id, "id") || "N/A"}
                          </Typography>
                        </Grid>
                        {data?.mail && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Email Address:
                            </Typography>
                            <Typography variant="inherit">{data.mail || "N/A"}</Typography>
                          </Grid>
                        )}
                        {data?.description && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Description:
                            </Typography>
                            <Typography variant="inherit">{data.description || "N/A"}</Typography>
                          </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Group Type:
                          </Typography>
                          <Typography variant="inherit">{getGroupType()}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Mail Enabled:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.mailEnabled, "mailEnabled") || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Security Enabled:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.securityEnabled, "securityEnabled") || "N/A"}
                          </Typography>
                        </Grid>
                        {data?.createdDateTime && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Created Date:
                            </Typography>
                            <Typography variant="inherit">
                              {data.createdDateTime
                                ? new Date(data.createdDateTime).toLocaleString()
                                : "N/A"}
                            </Typography>
                          </Grid>
                        )}
                        {data?.onPremisesSyncEnabled && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Synced from AD:
                            </Typography>
                            <Typography variant="inherit">
                              {getCippFormatting(data?.onPremisesSyncEnabled, "onPremisesSyncEnabled") ||
                                "N/A"}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    }
                  />
                </PropertyList>
              </Card>
            </Grid>
            <Grid size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Members</Typography>
                <CippBannerListCard
                  isFetching={groupBulkRequest.isPending}
                  items={membersItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Owners</Typography>
                <CippBannerListCard
                  isFetching={groupBulkRequest.isPending}
                  items={ownersItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Memberships</Typography>
                <CippBannerListCard
                  isFetching={groupBulkRequest.isPending}
                  items={groupMembershipItems}
                  isCollapsible={true}
                />
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
