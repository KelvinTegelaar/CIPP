import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Link, SvgIcon, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import NextLink from "next/link";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Custom Data Mappings";

  // Columns for the table
  const columns = [
    "tenant",
    "sourceType",
    "dataset",
    "syncProperty",
    "directoryObject",
    "customDataAttribute",
  ];

  const actions = [
    {
      label: "Edit Mapping",
      icon: <PencilIcon />,
      link: "/cipp/custom-data/mappings/edit?id=[id]",
    },
    {
      label: "Delete Mapping",
      icon: <TrashIcon />,
      url: "/api/ExecCustomData?Action=DeleteMapping",
      type: "POST",
      data: {
        id: "id",
      },
      confirmText: "Are you sure you want to delete the mapping with ID '[id]'?",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        tableFilter={
          <Alert severity="info">
            <Typography variant="body2">
              Custom data mappings are used to synchronize custom data to directory objects. You can
              add, edit, or delete mappings here.
            </Typography>
          </Alert>
        }
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
