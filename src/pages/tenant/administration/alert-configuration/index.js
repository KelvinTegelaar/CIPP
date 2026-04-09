import { Button } from "@mui/material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { CopyAll, Delete, Edit, NotificationAdd, Visibility } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Alerts";
  const actions = [
    {
      label: "View Task Details",
      link: "/cipp/scheduler/task?id=[RowKey]",
      icon: <Visibility />,
      condition: (row) => row?.EventType === "Scheduled Task",
    },
    {
      label: "Edit Alert",
      link: "/tenant/administration/alert-configuration/alert?id=[RowKey]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Clone & Edit Alert",
      link: "/tenant/administration/alert-configuration/alert?id=[RowKey]&clone=true",
      icon: <CopyAll />,
      color: "success",
      target: "_self",
    },
    {
      label: "Delete Alert",
      type: "POST",
      url: "/api/RemoveQueuedAlert",
      data: {
        ID: "RowKey",
        EventType: "EventType",
      },
      icon: <Delete />,
      relatedQueryKeys: "ListAlertsQueue",
      confirmText: "Are you sure you want to delete this Alert?",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAlertsQueue"
      tenantInTitle={false}
      cardButton={
        <Button
          component={Link}
          href="/tenant/administration/alert-configuration/alert"
          startIcon={<NotificationAdd />}
        >
          Add Alert
        </Button>
      }
      actions={actions}
      simpleColumns={[
        "Tenants",
        "EventType",
        "Conditions",
        "RepeatsEvery",
        "Actions",
        "AlertComment",
        "excludedTenants",
      ]}
      queryKey="ListAlertsQueue"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
