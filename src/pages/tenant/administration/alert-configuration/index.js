import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CopyAll, Delete, NotificationAdd } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Alerts";
  const actions = [
    {
      label: "Edit Alert",
      link: "/tenant/administration/alert-configuration/alert?id=[RowKey]",
      icon: <EyeIcon />,
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
      simpleColumns={["Tenants", "EventType", "Conditions", "RepeatsEvery", "Actions"]}
      queryKey="ListAlertsQueue"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
