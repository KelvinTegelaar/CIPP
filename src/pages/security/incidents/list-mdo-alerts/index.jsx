import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Defender Alerts";

  // Define actions for incidents
  const actions = [
    {
      label: "Assign to self",
      type: "POST",
      icon: <CippIcons.PersonAdd />,
      url: "/api/ExecSetMdoAlert",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to assign this incident to yourself?",
    },
    {
      label: "Set status to active",
      type: "POST",
      icon: <CippIcons.PlayArrow />,
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
      icon: <CippIcons.Assignment />,
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
      icon: <CippIcons.Done />,
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
    "serviceSource",
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
