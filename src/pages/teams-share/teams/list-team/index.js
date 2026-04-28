import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Stack } from "@mui/system";
import { Delete, GroupAdd } from "@mui/icons-material";
import Link from "next/link";
import { Edit } from "@mui/icons-material";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const pageTitle = "Teams";

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListTeams?type=list",
    queryKey: "ListTeams-list",
    cacheName: "Teams",
    syncTitle: "Sync Teams Report",
    allowToggle: true,
    defaultCached: false,
  });

  const actions = [
    {
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]&groupType=Microsoft 365",
      multiPost: false,
      color: "warning",
      icon: <Edit />,
    },
    {
      label: "Delete Team",
      type: "POST",
      url: "/api/ExecGroupsDelete",
      icon: <Delete />,
      data: {
        ID: "id",
        GroupType: "!Microsoft 365",
        DisplayName: "displayName",
      },
      confirmText: "Are you sure you want to delete this team?",
      multiPost: false,
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        simpleColumns={[
          ...reportDB.cacheColumns,
          "displayName",
          "description",
          "visibility",
          "mailNickname",
          "id",
        ]}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={Link} href="/teams-share/teams/list-team/add" startIcon={<GroupAdd />}>
              Add Team
            </Button>
            {reportDB.controls}
          </Stack>
        }
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
