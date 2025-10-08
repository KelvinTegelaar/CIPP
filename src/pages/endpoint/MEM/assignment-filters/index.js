import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";
import { FilterAlt, Edit, Add } from "@mui/icons-material";
import { Stack } from "@mui/system";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Assignment Filters";
  const { currentTenant } = useSettings();

  const actions = [
    {
      label: "Edit Filter",
      link: "/endpoint/MEM/assignment-filters/edit?filterId=[id]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Create template based on filter",
      type: "POST",
      url: "/api/AddAssignmentFilterTemplate",
      icon: <FilterAlt />,
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

  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="assignment-filters/add" startIcon={<Add />}>
            Add Assignment Filter
          </Button>
        </Stack>
      }
      apiUrl="/api/ListAssignmentFilters"
      queryKey={`assignment-filters-${currentTenant}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "displayName",
        "description",
        "platform",
        "assignmentFilterManagementType",
        "rule",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
