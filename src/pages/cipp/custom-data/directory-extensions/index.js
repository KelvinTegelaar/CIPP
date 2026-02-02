import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Link, SvgIcon } from "@mui/material";
import { Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import NextLink from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Directory Extensions";

  // Columns for the table
  const columns = [
    "name", // Extension ID
    "dataType", // Data Type
    "isMultiValued", // Multi-Valued
    "targetObjects", // Target Objects
  ];

  const actions = [
    {
      label: "Delete Directory Extension",
      icon: <TrashIcon />,
      url: "/api/ExecCustomData?Action=DeleteDirectoryExtension",
      type: "POST",
      data: {
        name: "name",
        id: "id",
      },
      confirmText: "Are you sure you want to delete the directory extension '[name]'?",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        tableFilter={
          <Alert severity="info" style={{ marginBottom: 16 }}>
            <Link
              target="_blank"
              href="https://learn.microsoft.com/en-us/graph/extensibility-overview?tabs=http#directory-microsoft-entra-id-extensions"
            >
              Directory extensions
            </Link>{" "}
            allow you to add custom properties to Microsoft Entra directory objects.
            <ul>
              <li>Directory extensions must have unique names.</li>
              <li>There is a limit of 100 extension values per resource instance</li>
              <li>
                <Link
                  target="_blank"
                  href="https://learn.microsoft.com/en-us/graph/extensibility-overview?tabs=http#considerations-for-using-directory-extensions"
                >
                  Considerations for using directory extensions
                </Link>
              </li>
            </ul>
          </Alert>
        }
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            component={NextLink}
            href="/cipp/custom-data/directory-extensions/add"
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Add />
            </SvgIcon>
            Add Directory Extension
          </Button>
        }
        tenantInTitle={false}
        apiUrl="/api/ExecCustomData?Action=ListDirectoryExtensions"
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
