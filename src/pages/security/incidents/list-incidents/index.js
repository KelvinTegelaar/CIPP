import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { PersonAdd, PlayArrow, Assignment, Done } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Incidents List";

  // Define actions for incidents
  const actions = [
    {
      label: "Assign to self",
      type: "POST",
      icon: <PersonAdd />,
      url: "/api/ExecSetSecurityIncident",
      data: {
        GUID: "id",
        Assigned: "currentUserId",
      },
      confirmText: "Are you sure you want to assign this incident to yourself?",
    },
    {
      label: "Set status to active",
      type: "POST",
      icon: <PlayArrow />,
      url: "/api/ExecSetSecurityIncident",
      data: {
        GUID: "id",
        Status: "active",
        Assigned: "currentAssignedUser",
      },
      confirmText: "Are you sure you want to set the status to active?",
    },
    {
      label: "Set status to in progress",
      type: "POST",
      icon: <Assignment />,
      url: "/api/ExecSetSecurityIncident",
      data: {
        GUID: "id",
        Status: "inProgress",
        Assigned: "currentAssignedUser",
      },
      confirmText: "Are you sure you want to set the status to in progress?",
    },
    {
      label: "Set status to resolved",
      type: "POST",
      icon: <Done />,
      url: "/api/ExecSetSecurityIncident",
      data: {
        GUID: "id",
        Status: "resolved",
        Assigned: "currentAssignedUser",
      },
      confirmText: "Are you sure you want to set the status to resolved?",
    },
  ];

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: [
      "Created",
      "Updated",
      "Tenant",
      "Id",
      "RedirectId",
      "DisplayName",
      "Status",
      "Severity",
      "AssignedTo",
      "Classification",
      "Determination",
      "IncidentUrl",
      "Tags",
    ],
    actions: actions,
  };

  // Simplified columns for the table
  const simpleColumns = ["Created", "Tenant", "Id", "DisplayName", "Status", "Severity", "Tags"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ExecIncidentsList"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
