import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Link, SvgIcon, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import NextLink from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Custom Data Mappings";

  // Columns for the table
  const columns = [
    "tenantFilter.label",
    "tenantFilter.type",
    "customDataAttribute.label",
    "directoryObjectType.label",
    "extensionSyncAttribute.label",
  ];

  const actions = [
    {
      label: "Delete Mapping",
      icon: <TrashIcon />,
      url: "/api/ExecCustomData?Action=DeleteMapping",
      type: "POST",
      data: {
        mappingName: "mappingName",
      },
      confirmText: "Are you sure you want to delete the mapping '[mappingName]'?",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            component={NextLink}
            href="/cipp/custom-data/mappings/add"
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Add />
            </SvgIcon>
            Add Mapping
          </Button>
        }
        tenantInTitle={false}
        apiUrl="/api/ExecCustomData?Action=ListMappings"
        apiDataKey="Results"
        simpleColumns={columns}
        filters={[]}
        actions={actions}
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
