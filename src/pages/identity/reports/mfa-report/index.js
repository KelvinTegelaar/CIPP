import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { LockPerson, Sync, Info } from "@mui/icons-material";
import { Button, Alert, SvgIcon, IconButton, Tooltip } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";

const Page = () => {
  const pageTitle = "MFA Report";
  const apiUrl = "/api/ListMFAUsers";
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();
  const router = useRouter();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const isAllTenants = currentTenant === "AllTenants";

  const apiData = {
    UseReportDB: true,
  };
  const simpleColumns = isAllTenants
    ? [
        "Tenant",
        "UPN",
        "AccountEnabled",
        "isLicensed",
        "MFARegistration",
        "PerUser",
        "CoveredBySD",
        "CoveredByCA",
        "MFAMethods",
        "CAPolicies",
        "IsAdmin",
        "UserType",
        "CacheTimestamp",
      ]
    : [
        "UPN",
        "AccountEnabled",
        "isLicensed",
        "MFARegistration",
        "PerUser",
        "CoveredBySD",
        "CoveredByCA",
        "MFAMethods",
        "CAPolicies",
        "IsAdmin",
        "UserType",
        "CacheTimestamp",
      ];
  const filters = [
    {
      filterName: "Enabled, licensed users",
      value: [
        { id: "AccountEnabled", value: "Yes" },
        { id: "isLicensed", value: "Yes" },
      ],
      type: "column",
    },
    {
      filterName: "Enabled, licensed users missing MFA",
      value: [
        { id: "AccountEnabled", value: "Yes" },
        { id: "isLicensed", value: "Yes" },
        { id: "MFARegistration", value: "No" },
      ],
      type: "column",
    },
    {
      filterName: "No MFA methods registered",
      value: [{ id: "MFARegistration", value: "No" }],
      type: "column",
    },
    {
      filterName: "MFA methods registered",
      value: [{ id: "MFARegistration", value: "Yes" }],
      type: "column",
    },
    {
      filterName: "Admin Users",
      value: [{ id: "IsAdmin", value: "Yes" }],
      type: "column",
    },
  ];

  // Parse filters from URL query parameters
  const urlFilters = useMemo(() => {
    if (router.query.filters) {
      try {
        return JSON.parse(router.query.filters);
      } catch (e) {
        console.error("Failed to parse filters from URL:", e);
        return null;
      }
    }
    return null;
  }, [router.query.filters]);

  const actions = [
    {
      label: "Set Per-User MFA",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecPerUserMFA",
      data: { userId: "ID", userPrincipalName: "UPN" },
      fields: [
        {
          type: "autoComplete",
          name: "State",
          label: "State",
          options: [
            { label: "Enforced", value: "Enforced" },
            { label: "Enabled", value: "Enabled" },
            { label: "Disabled", value: "Disabled" },
          ],
          multiple: false,
          creatable: false,
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
  ];

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      <CippQueueTracker
        queueId={syncQueueId}
        queryKey={`ListMFAUsers-${currentTenant}`}
        title="MFA Report Sync"
      />
      <Tooltip title="This report displays cached data from the CIPP reporting database. Click the Sync button to update the cache for the current tenant.">
        <IconButton size="small">
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <Sync />
          </SvgIcon>
        }
        size="xs"
        onClick={syncDialog.handleOpen}
      >
        Sync
      </Button>
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={apiUrl}
        apiData={apiData}
        queryKey={`ListMFAUsers-${currentTenant}`}
        simpleColumns={simpleColumns}
        filters={filters}
        actions={actions}
        cardButton={pageActions}
        initialFilters={urlFilters}
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync MFA Report"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run MFA state cache sync for ${currentTenant}? This will update MFA data immediately.`,
          relatedQueryKeys: [`ListMFAUsers-${currentTenant}`],
          data: {
            Name: "MFAState",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result?.Metadata?.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
