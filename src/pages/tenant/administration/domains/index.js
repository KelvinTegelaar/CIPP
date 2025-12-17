import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CheckCircle, Star, Delete } from "@mui/icons-material";
import { CippAddDomainDrawer } from "/src/components/CippComponents/CippAddDomainDrawer.jsx";
import { CippDomainVerificationRecords } from "/src/components/CippComponents/CippDomainVerificationRecords.jsx";
import { CippDomainServiceConfigurationRecords } from "/src/components/CippComponents/CippDomainServiceConfigurationRecords.jsx";
import { Box, Typography, Divider } from "@mui/material";
import { Stack } from "@mui/system";
import { CippPropertyList } from "/src/components/CippComponents/CippPropertyList";
import { getCippFormatting } from "/src/utils/get-cipp-formatting";

const Page = () => {
  const pageTitle = "Domains";
  const apiUrl = "/api/ListGraphRequest";

  // API Data configuration for the request
  const apiData = {
    Endpoint: "domains",
  };

  const simpleColumns = [
    "id",
    "authenticationType",
    "isAdminManaged",
    "isDefault",
    "isInitial",
    "isVerified",
  ];

  const offCanvas = {
    size: "lg",
    children: (row) => {
      const offcanvasProperties = [
        {
          label: "Supported Services",
          value: getCippFormatting(row?.supportedServices, "supportedServices"),
        },
      ];
      return (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Domain Details for {row.id}
            </Typography>
          </Box>
          <Box sx={{ pb: 2 }}>
            <CippPropertyList propertyItems={offcanvasProperties} showDivider={false} />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Verification Records
            </Typography>
            <CippDomainVerificationRecords row={row} />
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Service Configuration Records
            </Typography>
            <CippDomainServiceConfigurationRecords row={row} />
          </Box>
        </Stack>
      );
    },
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      apiData={apiData}
      offCanvas={offCanvas}
      cardButton={
        <CippAddDomainDrawer
          buttonText="Add Domain"
          requiredPermissions={["Tenant.Administration.ReadWrite"]}
        />
      }
      actions={[
        {
          label: "Verify Domain",
          condition: (row) => !row.isVerified,
          type: "POST",
          icon: <CheckCircle />,
          url: "/api/ExecDomainAction",
          data: { domain: "id", Action: "verify" },
          confirmText:
            "Are you sure you want to verify this domain? Use one of the records below to complete verification.",
          children: ({ row }) => <CippDomainVerificationRecords row={row} />,
          size: "lg",
        },
        {
          label: "Set as Default",
          condition: (row) => !row.isDefault && row.isVerified,
          type: "POST",
          icon: <Star />,
          url: "/api/ExecDomainAction",
          data: { domain: "id", Action: "setDefault" },
          confirmText: "Are you sure you want to set [id] as the default domain?",
          multiPost: false,
          hideBulk: true,
        },
        {
          label: "Delete Domain",
          condition: (row) => !row.isDefault && !row.isInitial,
          type: "POST",
          icon: <Delete />,
          url: "/api/ExecDomainAction",
          data: { domain: "id", Action: "delete" },
          confirmText: "Are you sure you want to delete [id]? This action cannot be undone.",
          color: "error",
          multiPost: false,
        },
      ]}
    />
  );
};

// Adding the layout for the dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
