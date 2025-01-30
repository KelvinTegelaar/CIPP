import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { GroupAdd } from "@mui/icons-material";
import Link from "next/link";
import { Edit } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Teams";

  const actions = [
    {
      label: "Edit Group",
      link: "/identity/administration/groups/edit?groupId=[id]",
      multiPost: false,
      color: "warning",
      icon: <Edit />,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTeams?type=list"
      actions={actions}
      simpleColumns={["displayName", "description", "visibility", "mailNickname", "id"]}
      cardButton={
        <>
          <Button component={Link} href="/teams-share/teams/list-team/add" startIcon={<GroupAdd />}>
            Add Team
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
