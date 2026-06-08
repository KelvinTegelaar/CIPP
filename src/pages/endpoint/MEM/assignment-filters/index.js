import { Button } from "@mui/material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Edit, Add, Book } from "@mui/icons-material";
import { Stack } from "@mui/system";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const pageTitle = "Assignment Filters";

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListAssignmentFilters",
    queryKey: "assignment-filters",
    cacheName: "IntuneAssignmentFilters",
    syncTitle: "Sync Assignment Filters Report",
    allowToggle: true,
    defaultCached: false,
  });

  const actions = [
    {
      label: "Create template based on filter",
      type: "POST",
      url: "/api/AddAssignmentFilterTemplate",
      icon: <Book />,
      data: {
        displayName: "displayName",
        description: "description",
        platform: "platform",
        rule: "rule",
        assignmentFilterManagementType: "assignmentFilterManagementType",
      },
      confirmText: "Are you sure you want to create a template based on this filter?",
      multiPost: false,
    },
    {
      label: "Edit Filter",
      link: "/endpoint/MEM/assignment-filters/edit?filterId=[id]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Delete Filter",
      type: "POST",
      url: "/api/ExecAssignmentFilter",
      icon: <TrashIcon />,
      data: {
        ID: "id",
        Action: "Delete",
      },
      confirmText: "Are you sure you want to delete this assignment filter?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "description",
      "id",
      "platform",
      "rule",
      "assignmentFilterManagementType",
      "createdDateTime",
      "lastModifiedDateTime",
    ],
    actions: actions,
  };

  const simpleColumns = [
    ...reportDB.cacheColumns,
    "displayName",
    "description",
    "platform",
    "assignmentFilterManagementType",
    "rule",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={Link} href="assignment-filters/add" startIcon={<Add />}>
              Add Assignment Filter
            </Button>
            {reportDB.controls}
          </Stack>
        }
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
