import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import { Button, Chip } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Cross-Tenant Security Templates";

  const actions = [
    {
      label: "Edit Template",
      link: "/tenant/administration/cross-tenant-access/templates/template?GUID=[GUID]",
      color: "info",
      icon: "Edit",
      category: "edit",
    },
    {
      label: "Apply to Tenant",
      type: "POST",
      url: "/api/ExecApplyCrossTenantTemplate",
      data: {
        GUID: "GUID",
      },
      confirmText:
        "Are you sure you want to apply this security template to the selected tenant? This will overwrite current cross-tenant access settings.",
      color: "warning",
      icon: "PlayArrow",
      relatedQueryKeys: ["CrossTenantPolicy", "ExternalCollaboration", "CrossTenantHealth"],
      category: "manage",
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/ExecRemoveCrossTenantTemplate",
      data: {
        GUID: "GUID",
      },
      confirmText: "Are you sure you want to delete this security template?",
      color: "error",
      icon: "Delete",
      relatedQueryKeys: ["CrossTenantTemplates"],
      category: "danger",
    },
  ];

  const columns = [
    {
      header: "Template Name",
      accessorKey: "templateName",
      size: 250,
    },
    {
      header: "Description",
      accessorKey: "description",
      size: 350,
    },
    {
      header: "B2B Collab Inbound",
      accessorKey: "settings.b2bCollaborationInbound",
      size: 150,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        const access = val?.usersAndGroups?.accessType;
        if (!access) return <Chip label="Not Set" size="small" />;
        return (
          <Chip
            label={access.charAt(0).toUpperCase() + access.slice(1)}
            size="small"
            color={access === "allowed" ? "success" : access === "blocked" ? "error" : "default"}
          />
        );
      },
    },
    {
      header: "B2B Direct Connect",
      accessorKey: "settings.b2bDirectConnectInbound",
      size: 150,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        const access = val?.usersAndGroups?.accessType;
        if (!access) return <Chip label="Not Set" size="small" />;
        return (
          <Chip
            label={access.charAt(0).toUpperCase() + access.slice(1)}
            size="small"
            color={access === "allowed" ? "success" : access === "blocked" ? "error" : "default"}
          />
        );
      },
    },
    {
      header: "Trust External MFA",
      accessorKey: "settings.inboundTrust",
      size: 140,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        if (!val) return <Chip label="Not Set" size="small" />;
        return (
          <Chip
            label={val.isMfaAccepted ? "Yes" : "No"}
            size="small"
            color={val.isMfaAccepted ? "success" : "default"}
          />
        );
      },
    },
    {
      header: "Guest Invite Policy",
      accessorKey: "settings.allowInvitesFrom",
      size: 180,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        if (!val) return <Chip label="Not Set" size="small" />;
        const labels = {
          none: "No one",
          adminsAndGuestInviters: "Admins + Guest Inviters",
          adminsGuestInvitersAndAllMembers: "Members + Admins",
          everyone: "Everyone",
        };
        return <Chip label={labels[val] ?? val} size="small" variant="outlined" />;
      },
    },
    {
      header: "Updated By",
      accessorKey: "updatedBy",
      size: 150,
    },
    {
      header: "Updated At",
      accessorKey: "updatedAt",
      size: 180,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return val ? new Date(val).toLocaleString() : "";
      },
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListCrossTenantTemplates"
      apiDataKey="Results"
      columns={columns}
      actions={actions}
      queryKey="CrossTenantTemplates"
      tenantInTitle={false}
      cardButton={
        <Link href="/tenant/administration/cross-tenant-access/templates/template" passHref>
          <Button variant="contained" startIcon={<Add />} size="small">
            Add Security Template
          </Button>
        </Link>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
