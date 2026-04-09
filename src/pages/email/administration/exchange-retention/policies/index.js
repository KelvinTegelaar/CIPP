import { useMemo } from "react";
import { Layout as DashboardLayout } from "../../../../../layouts/index";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage";
import { Policy, Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "../tabOptions";
import { useSettings } from "../../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Retention Policy Management";
  const tenant = useSettings().currentTenant;

  const actions = useMemo(
    () => [
      {
        label: "Edit Policy",
        link: "/email/administration/exchange-retention/policies/policy?name=[Name]",
        multiPost: false,
        postEntireRow: true,
        icon: <Edit />,
        color: "warning",
      },
      {
        label: "Delete Policy",
        type: "POST",
        url: "/api/ExecManageRetentionPolicies",
        confirmText:
          "Are you sure you want to delete retention policy [Name]? This action cannot be undone.",
        color: "danger",
        icon: <TrashIcon />,
        customDataformatter: (rows) => {
          const policies = Array.isArray(rows) ? rows : [rows];
          return {
            DeletePolicies: policies.map((policy) => policy.Name),
            tenantFilter: tenant,
          };
        },
      },
    ],
    [tenant]
  );

  const simpleColumns = useMemo(
    () => ["Name", "IsDefault", "IsDefaultArbitrationMailbox", "RetentionPolicyTagLinks"],
    []
  );

  const cardButton = useMemo(
    () => (
      <Button
        component={Link}
        href="/email/administration/exchange-retention/policies/policy"
        startIcon={<Policy />}
      >
        Add Retention Policy
      </Button>
    ),
    []
  );

  return (
    <HeaderedTabbedLayout tabOptions={tabOptions} title={pageTitle}>
      <CippTablePage
        apiUrl="/api/ExecManageRetentionPolicies"
        queryKey={`RetentionPolicies-${tenant}`}
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
