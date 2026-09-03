import { useMemo } from "react";
import { CippIcons } from "../../../../../utils/icon-registry"
import { Layout as DashboardLayout } from "../../../../../layouts/index";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import Link from "next/link";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "../tabOptions";
import { useSettings } from "../../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Retention Tag Management";
  const tenant = useSettings().currentTenant;

  const actions = useMemo(
    () => [
      {
        label: "Edit Tag",
        link: "/email/administration/exchange-retention/tags/tag?name=[Name]",
        pinned: true,
        multiPost: false,
        postEntireRow: true,
        icon: <CippIcons.Edit />,
        color: "warning",
      },
      {
        label: "Delete Tag",
        type: "POST",
        url: "/api/ExecManageRetentionTags",
        confirmText:
          "Are you sure you want to delete retention tag [Name]? This action cannot be undone and may affect retention policies that use this tag.",
        color: "danger",
        icon: <CippIcons.Delete />,
        customDataformatter: (rows) => {
          const tags = Array.isArray(rows) ? rows : [rows];
          return {
            DeleteTags: tags.map((tag) => tag.Name),
            tenantFilter: tenant,
          };
        },
      },
    ],
    [tenant]
  );

  const simpleColumns = useMemo(
    () => [
      "Name",
      "Type",
      "RetentionAction",
      "AgeLimitForRetention",
      "RetentionEnabled",
      "Comment",
    ],
    []
  );

  const cardButton = useMemo(
    () => (
      <Button
        component={Link}
        href="/email/administration/exchange-retention/tags/tag"
        startIcon={<CippIcons.Sell />}
      >
        Add Retention Tag
      </Button>
    ),
    []
  );

  return (
    <HeaderedTabbedLayout tabOptions={tabOptions} title={pageTitle}>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ExecManageRetentionTags"
        queryKey={`RetentionTags-${tenant}`}
        actions={actions}
        simpleColumns={simpleColumns}
        cardButton={cardButton}
        hideTitle={true}
      />
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
