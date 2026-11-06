import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SvgIcon,
  Typography,
} from "@mui/material";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CIPPM365OAuthButton } from "../../../../components/CippComponents/CIPPM365OAuthButton";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import tabOptions from "./tabOptions";
import { CippIcons } from "../../../../utils/icon-registry";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall.jsx";
import Link from "next/link";
import { usePermissions } from "../../../../hooks/use-permissions";
import { Alert } from "@mui/material";

const Page = () => {
  const pageTitle = "Partner Tenants";
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const addPartner = ApiPostCall({ urlfromdata: true, relatedQueryKeys: ["partnerTenants"] });
  const { checkRoles, isLoading: permissionsLoading } = usePermissions();
  const isSuperAdmin = checkRoles(["superadmin"]);

  const execPartnerMode = ApiGetCall({
    url: "/api/ExecPartnerMode?Action=ListCurrent",
    queryKey: "execPartnerMode",
  });
  const partnerModeAvailable = execPartnerMode.data?.TenantMode === "PartnerTenantAvailable";

  if (!permissionsLoading && !isSuperAdmin) {
    return (
      <Alert severity="warning" sx={{ m: 3 }}>
        Managing partner tenants requires the superadmin role.
      </Alert>
    );
  }

  const actions = [
    {
      label: "Tenant List Management",
      type: "POST",
      url: "/api/ExecEditPartnerTenant",
      icon: <CippIcons.Visibility />,
      data: { partnerTenantId: "partnerTenantId" },
      fields: [
        {
          type: "radio",
          name: "Managed",
          label: "Partner tenant in the tenant list",
          options: [
            { label: "Managed - selectable as a tenant", value: "true" },
            { label: "Not managed - hidden from the tenant list", value: "false" },
          ],
        },
      ],
      defaultvalues: (row) => ({ Managed: row.Managed === false ? "false" : "true" }),
      confirmText:
        "Choose whether [displayName] appears as a manageable tenant in the tenant list. Customer tenants are unaffected either way.",
      multiPost: false,
      hideBulk: true,
      condition: () => partnerModeAvailable,
      relatedQueryKeys: ["partnerTenants", "tenants-table", "TenantSelector"],
    },
    {
      label: "Remove Partner Tenant",
      type: "POST",
      url: "/api/ExecRemovePartnerTenant",
      icon: <CippIcons.Delete />,
      data: { partnerTenantId: "partnerTenantId" },
      confirmText:
        "Are you sure you want to remove partner tenant [displayName]? Its stored credentials are deleted and its customer tenants can no longer be managed until the partner is re-added.",
      multiPost: false,
      hideBulk: true,
      fields: [
        {
          type: "switch",
          name: "RemoveTenants",
          label: "Also remove this partner's customer tenants from the tenant cache immediately",
        },
      ],
      condition: (row) => row.IsPrimary !== true,
      relatedQueryKeys: ["partnerTenants", "tenants-table", "TenantSelector"],
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "partnerTenantId",
      "defaultDomainName",
      "authenticatedUserPrincipalName",
      "IsPrimary",
      "Enabled",
      "Managed",
      "tenantCount",
      "addedDate",
      "lastTokenRefresh",
    ],
    actions: actions,
  };

  const pageAlerts = (
    <>
      <Alert severity="warning" sx={{ mb: 1 }}>
        <strong>Beta feature.</strong> Multiple partner tenant support is under active development
        and not yet officially supported — enable and use it at your own risk.
      </Alert>
      {execPartnerMode.isSuccess && !partnerModeAvailable ? (
        <Alert severity="info">
          Partner tenants only appear in the tenant list when the{" "}
          <Link href="/cipp/advanced/super-admin/tenant-mode">Tenant Mode</Link>{" "}
          is set to &quot;Multi Tenant - Add Partner Tenant&quot;. Set that mode first to manage
          partner tenants as tenants.
        </Alert>
      ) : null}
    </>
  );

  return (
    <>
      <CippTablePage
        title={pageTitle}
        queryKey="partnerTenants"
        apiUrl="/api/ListPartnerTenants"
        apiDataKey="Results"
        tableFilter={pageAlerts}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={["displayName", "defaultDomainName", "IsPrimary", "Managed", "tenantCount", "lastTokenRefresh"]}
        tenantInTitle={false}
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setAddDialogOpen(true)}
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <CippIcons.Add />
            </SvgIcon>
            Add Partner Tenant
          </Button>
        }
      />
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Partner Tenant</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Additional partner tenants are a beta feature and not yet officially supported.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sign in with the CIPP service account of the partner tenant you want to add. Its
            customer tenants will appear after the next tenant refresh.
          </Typography>
          <CIPPM365OAuthButton
            buttonText="Connect Partner Tenant"
            showSuccessAlert={false}
            tokenUpdateBody={{ tenantMode: "GDAP", addPartner: true }}
            onAuthSuccess={(tokenData) => {
              addPartner.mutate({
                url: "/api/ExecUpdateRefreshToken",
                data: { ...tokenData, tenantMode: "GDAP", addPartner: true },
              });
            }}
            scope="https://graph.microsoft.com/DelegatedPermissionGrant.ReadWrite.All https://graph.microsoft.com/Directory.ReadWrite.All https://graph.microsoft.com/AppRoleAssignment.ReadWrite.All offline_access profile openid"
          />
          <CippApiResults apiObject={addPartner} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
