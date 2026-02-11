import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { PersonAdd, PlayArrow, Assignment, Done } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Email & Collaboration Alerts";

  // Define actions for incidents
  const actions = [
    {
      label: "Assign to self",
      type: "POST",
      icon: <PersonAdd />,
      url: "/api/ExecSetMdoAlert",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to assign this incident to yourself?",
    },
    {
      label: "Set status to active",
      type: "POST",
      icon: <PlayArrow />,
      url: "/api/ExecSetMdoAlert",
      data: {
        GUID: "id",
        Status: "!active",
        Assigned: "assignedTo",
      },
      confirmText: "Are you sure you want to set the status to active?",
    },
    {
      label: "Set status to in progress",
      type: "POST",
      icon: <Assignment />,
      url: "/api/ExecSetMdoAlert",
      data: {
        GUID: "id",
        Status: "!inProgress",
        Assigned: "assignedTo",
      },
      confirmText: "Are you sure you want to set the status to in progress?",
    },
    {
      label: "Set status to resolved",
      type: "POST",
      icon: <Done />,
      url: "/api/ExecSetMdoAlert",
      data: {
        GUID: "id",
        Status: "!resolved",
        Assigned: "assignedTo",
      },
      confirmText: "Are you sure you want to set the status to resolved?",
    },
  ];

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime",
      "title",
      "description",
      "category",
      "status",
      "severity",
      "classification",
      "determination",
      "serviceSource",
      "evidence",
      "detectionSource",
      "tenant",
      "providerAlertId",
      "incidentId",
      "affectedResources",
      "involvedUsers",
      "mitreTechniques",
      "threatDisplayName",
      "threatFamilyName",
      "actorDisplayName",
      "recommendedActions",
      "firstActivityDateTime",
      "lastActivityDateTime",
      "lastUpdateDateTime",
      "resolvedDateTime",
      "alertWebUrl",
      "incidentWebUrl",
    ],
    actions: actions,
  };

  // Simplified columns for the table
  const simpleColumns = [
    "createdDateTime",
    "status",
    "severity",
    "title",
    "category",
    "classification",
    "affectedResources",
    "evidence",
    "assignedTo",
    "incidentWebUrl",
    "tenant",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ExecMdoAlertsList"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
