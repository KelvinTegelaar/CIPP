import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import {
  Button,
  Paper,
  Avatar,
  Typography,
  Chip,
  Divider,
  useTheme,
  Tooltip,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Box, Stack } from "@mui/system";
import {
  Delete,
  GroupAdd,
  Public,
  PublicOff,
  Description,
  Fingerprint,
  Edit,
  PersonAdd,
  PersonRemove,
  Archive,
  Unarchive,
  ContentCopy,
  OpenInNew,
  Groups,
  Inventory,
  TrendingDown,
  Info,
  Mail,
  SupervisorAccount,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../../hooks/use-settings";
import { useMemo, useCallback } from "react";

const Page = () => {
  const pageTitle = "Teams";
  const tenantFilter = useSettings().currentTenant;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const handleCardClick = useCallback((team) => {
    router.push(`/teams-share/teams/list-team/team-details?teamId=${team.id}&name=${encodeURIComponent(team.displayName || "")}`);
  }, [router]);

  const actions = useMemo(
    () => [
      {
        label: "View Details",
        type: "link",
        icon: <Info />,
        link: "/teams-share/teams/list-team/team-details?teamId=[id]&name=[displayName]",
        category: "view",
        quickAction: true,
      },
      {
        label: "Edit Group",
        type: "link",
        icon: <Edit />,
        link: "/identity/administration/groups/edit?groupId=[id]&groupType=Microsoft%20365",
        category: "edit",
        quickAction: true,
      },
      {
        label: "Add Member",
        type: "POST",
        icon: <PersonAdd />,
        url: "/api/ExecTeamMember",
        data: {
          TeamID: "id",
          DisplayName: "displayName",
          Action: "!Add",
          Role: "!member",
        },
        confirmText: "Select a user to add as a member to '[displayName]'.",
        fields: [
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
                $select: "id,displayName,userPrincipalName",
                $top: 999,
                $count: true,
              },
              queryKey: "ListUsersAutoComplete",
              dataKey: "Results",
              labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
              valueField: "id",
              showRefresh: true,
            },
          },
        ],
        multiPost: false,
        category: "edit",
        quickAction: true,
      },
      {
        label: "Add Owner",
        type: "POST",
        icon: <SupervisorAccount />,
        url: "/api/ExecTeamMember",
        data: {
          TeamID: "id",
          DisplayName: "displayName",
          Action: "!Add",
          Role: "!owner",
        },
        confirmText: "Select a user to add as an owner to '[displayName]'. Owners can manage team settings and membership.",
        fields: [
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
                $select: "id,displayName,userPrincipalName",
                $top: 999,
                $count: true,
              },
              queryKey: "ListUsersAutoComplete",
              dataKey: "Results",
              labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
              valueField: "id",
              showRefresh: true,
            },
          },
        ],
        multiPost: false,
        category: "security",
        quickAction: true,
      },
      {
        label: "Archive Team",
        type: "POST",
        icon: <Archive />,
        url: "/api/ExecTeamAction",
        data: {
          TeamID: "id",
          DisplayName: "displayName",
          Action: "!Archive",
        },
        confirmText:
          "Are you sure you want to archive '[displayName]'? Archived teams become read-only. Users can still view content but cannot post new messages or modify channels.",
        multiPost: false,
        category: "manage",
        quickAction: true,
      },
      {
        label: "Unarchive Team",
        type: "POST",
        icon: <Unarchive />,
        url: "/api/ExecTeamAction",
        data: {
          TeamID: "id",
          DisplayName: "displayName",
          Action: "!Unarchive",
        },
        confirmText:
          "Are you sure you want to unarchive '[displayName]'? This will restore full functionality to the team.",
        multiPost: false,
        category: "manage",
        quickAction: true,
      },
      {
        label: "Clone Team",
        type: "POST",
        icon: <ContentCopy />,
        url: "/api/ExecTeamAction",
        data: {
          TeamID: "id",
          DisplayName: "displayName",
          Action: "!Clone",
        },
        confirmText:
          "Clone '[displayName]' to create a new team with the same apps, tabs, settings, and channels. This may take a few minutes to complete.",
        fields: [
          {
            type: "textField",
            name: "CloneDisplayName",
            label: "New Team Name",
            required: true,
          },
          {
            type: "textField",
            name: "CloneDescription",
            label: "Description (optional)",
          },
          {
            type: "autoComplete",
            name: "CloneVisibility",
            label: "Visibility",
            multiple: false,
            creatable: false,
            options: [
              { label: "Public", value: "public" },
              { label: "Private", value: "private" },
            ],
          },
        ],
        multiPost: false,
        category: "edit",
        quickAction: true,
      },
      {
        label: "Delete Team",
        type: "POST",
        icon: <Delete />,
        url: "/api/ExecGroupsDelete",
        data: {
          ID: "id",
          GroupType: "!Microsoft 365",
          DisplayName: "displayName",
        },
        confirmText:
          "Are you sure you want to delete '[displayName]'? This will permanently remove the team, all channels, files, and conversations. This action cannot be undone.",
        color: "error",
        multiPost: false,
        category: "danger",
        quickAction: true,
      },
    ],
    []
  );

  const filters = useMemo(
    () => [
      {
        filterName: "Public Teams",
        value: [{ id: "visibility", value: "Public" }],
        type: "column",
      },
      {
        filterName: "Private Teams",
        value: [{ id: "visibility", value: "Private" }],
        type: "column",
      },
      {
        filterName: "Archived Teams",
        value: [{ id: "isArchived", value: "true" }],
        type: "column",
      },
    ],
    []
  );

  const cardConfig = useMemo(
    () => ({
      title: "displayName",
      subtitle: "mailNickname",
      avatar: {
        field: "displayName",
      },
      badges: [
        {
          field: "visibility",
          conditions: {
            Public: {
              label: "Public",
              tooltip: "Anyone can join this team",
              color: "success",
              icon: <Public fontSize="small" />,
            },
            Private: {
              label: "Private",
              tooltip: "Invite only",
              color: "warning",
              icon: <PublicOff fontSize="small" />,
            },
          },
          iconOnly: true,
        },
        {
          field: "isArchived",
          conditions: {
            true: {
              label: "Archived",
              color: "error",
              icon: <Inventory fontSize="small" />,
            },
          },
          transform: (value) => (value === true ? "true" : null),
          iconOnly: true,
        },
      ],
      extraFields: [
        { field: "description", icon: <Description /> },
      ],
      desktopFields: [
        { field: "mailNickname", icon: <Mail />, label: "Mail Nickname" },
      ],
      cardGridProps: {
        md: 6,
        lg: 4,
      },
      mobileQuickActions: ["View Details", "Add Member", "Archive Team"],
    }),
    []
  );

  const offCanvasChildren = useCallback(
    (row) => {
      const isPublic = row.visibility === "Public";
      const isArchived = row.isArchived === true;

      return (
        <Stack spacing={3}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(
                isPublic ? theme.palette.success.main : theme.palette.warning.main,
                0.15
              )} 0%, ${alpha(
                isPublic ? theme.palette.success.main : theme.palette.warning.main,
                0.05
              )} 100%)`,
              borderLeft: `4px solid ${isPublic ? theme.palette.success.main : theme.palette.warning.main}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha(
                    isPublic ? theme.palette.success.main : theme.palette.warning.main,
                    0.15
                  ),
                  color: isPublic ? theme.palette.success.main : theme.palette.warning.main,
                  width: 56,
                  height: 56,
                }}
              >
                <Groups sx={{ fontSize: 28 }} />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.displayName || "Unknown Team"}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    icon={isPublic ? <Public fontSize="small" /> : <PublicOff fontSize="small" />}
                    label={isPublic ? "Public" : "Private"}
                    size="small"
                    color={isPublic ? "success" : "warning"}
                    variant="outlined"
                  />
                  {isArchived && (
                    <Chip
                      icon={<Inventory fontSize="small" />}
                      label="Archived"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {/* Description */}
          {row.description && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Description fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {row.description}
              </Typography>
            </Box>
          )}

          {/* Team Info */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Fingerprint fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Team Info
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Mail Nickname
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {row.mailNickname}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Team ID
                </Typography>
                <Tooltip title={row.id}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.id}
                  </Typography>
                </Tooltip>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Visibility
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {row.visibility}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={isArchived ? "Archived" : "Active"}
                  size="small"
                  color={isArchived ? "error" : "success"}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Quick Link to Details */}
          <Box>
            <Button
              component={Link}
              href={`/teams-share/teams/list-team/team-details?teamId=${row.id}&name=${encodeURIComponent(row.displayName)}`}
              variant="outlined"
              startIcon={<OpenInNew />}
              fullWidth
            >
              View Full Details (Members, Channels, Apps)
            </Button>
          </Box>
        </Stack>
      );
    },
    [theme]
  );

  const offCanvas = useMemo(
    () => ({
      actions: actions,
      children: offCanvasChildren,
      size: "lg",
    }),
    [actions, offCanvasChildren]
  );

  const simpleColumns = useMemo(
    () =>
      isMobile
        ? ["displayName", "visibility", "isArchived"]
        : ["displayName", "description", "visibility", "mailNickname", "isArchived", "id"],
    [isMobile]
  );

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTeams?type=list"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filters}
      cardConfig={cardConfig}
      onCardClick={handleCardClick}
      cardButton={
        <Button component={Link} href="/teams-share/teams/list-team/add" startIcon={<GroupAdd />}>
          {isMobile ? "" : "Add Team"}
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
