import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import { Button, Chip } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Partner Organizations";

  const actions = [
    {
      label: "Edit Partner",
      link: "/tenant/administration/cross-tenant-access/partners/partner?tenantId=[tenantId]",
      color: "info",
      icon: "Edit",
      category: "edit",
    },
    {
      label: "Remove Partner",
      type: "POST",
      url: "/api/ExecRemoveCrossTenantPartner",
      data: {
        partnerTenantId: "tenantId",
      },
      confirmText: "Are you sure you want to remove this partner configuration?",
      color: "error",
      icon: "Delete",
      relatedQueryKeys: ["CrossTenantPartners"],
      category: "danger",
    },
  ];

  const accessChip = (val) => {
    const hasExplicit = val?.usersAndGroups?.accessType || val?.applications?.accessType;
    if (!hasExplicit) {
      return <Chip label="Inherited" size="small" variant="outlined" color="default" />;
    }
    const access = val?.usersAndGroups?.accessType ?? "inherited";
    return (
      <Chip
        label={access.charAt(0).toUpperCase() + access.slice(1)}
        size="small"
        color={access === "allowed" ? "success" : access === "blocked" ? "error" : "default"}
      />
    );
  };

  const columns = [
    {
      id: "partnerName",
      header: "Partner Name",
      accessorKey: "partnerName",
      size: 200,
    },
    {
      id: "partnerDomain",
      header: "Domain",
      accessorKey: "partnerDomain",
      size: 200,
    },
    {
      id: "tenantId",
      header: "Tenant ID",
      accessorKey: "tenantId",
      size: 280,
    },
    {
      id: "b2bCollaborationInbound",
      header: "B2B Collab In",
      accessorKey: "b2bCollaborationInbound",
      size: 120,
      Cell: ({ cell }) => accessChip(cell.getValue()),
    },
    {
      id: "b2bCollaborationOutbound",
      header: "B2B Collab Out",
      accessorKey: "b2bCollaborationOutbound",
      size: 120,
      Cell: ({ cell }) => accessChip(cell.getValue()),
    },
    {
      id: "b2bDirectConnectInbound",
      header: "Direct Connect In",
      accessorKey: "b2bDirectConnectInbound",
      size: 130,
      Cell: ({ cell }) => accessChip(cell.getValue()),
    },
    {
      id: "b2bDirectConnectOutbound",
      header: "Direct Connect Out",
      accessorKey: "b2bDirectConnectOutbound",
      size: 130,
      Cell: ({ cell }) => accessChip(cell.getValue()),
    },
    {
      id: "inboundTrust",
      header: "Trust MFA",
      accessorKey: "inboundTrust",
      size: 100,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return (
          <Chip
            label={val?.isMfaAccepted ? "Yes" : "No"}
            size="small"
            color={val?.isMfaAccepted ? "success" : "default"}
          />
        );
      },
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListCrossTenantPartners"
      apiDataKey="Results"
      columns={columns}
      actions={actions}
      queryKey="CrossTenantPartners"
      cardButton={
        <Link href="/tenant/administration/cross-tenant-access/partners/partner" passHref>
          <Button variant="contained" startIcon={<Add />} size="small">
            Add Partner Organization
          </Button>
        </Link>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
