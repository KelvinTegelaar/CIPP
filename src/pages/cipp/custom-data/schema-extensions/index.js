import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Link, SvgIcon, Typography } from "@mui/material";
import { Add, Block, CheckCircleOutline } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { TrashIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";

const Page = () => {
  const pageTitle = "Schema Extensions";

  // Columns for the table
  const columns = [
    "id", // Schema ID
    "status", // Status
    "description", // Description
    "targetTypes", // Target Types
    "properties", // Properties
  ];

  const actions = [
    {
      label: "Add Property",
      icon: <Add />,
      url: "/api/ExecCustomData?Action=AddSchemaProperty",
      type: "POST",
      data: {
        id: "id",
      },
      confirmText: (
        <>
          <Typography> Add a new property to the schema.</Typography>
          <Alert severity="warning">Properties cannot be deleted once they are created.</Alert>
        </>
      ),
      fields: [
        {
          name: "name",
          label: "Property Name",
          type: "textField",
          required: true,
          disableVariables: true,
        },
        {
          name: "type",
          label: "Property Type",
          type: "select",
          required: true,
          options: [
            { value: "Binary", label: "Binary (256 bytes max)" },
            { value: "Boolean", label: "Boolean" },
            { value: "DateTime", label: "DateTime (ISO 8601, UTC)" },
            { value: "Integer", label: "Integer (32-bit)" },
            { value: "String", label: "String (256 characters max)" },
          ],
          creatable: false,
          validate: (value) => {
            if (value) return true;
            return "Please select a property type.";
          },
        },
      ],
      hideBulk: true,
      condition: (row) => row.status !== "Deprecated",
    },
    {
      label: "Set to Available",
      icon: <CheckCircleOutline />,
      url: "/api/ExecCustomData?Action=ChangeSchemaState",
      type: "POST",
      data: {
        id: "id",
        status: "!Available",
      },
      confirmText:
        "Set [id] to Available. You will no longer be able to delete properties or the schema.",
      condition: (row) => row.status === "InDevelopment",
    },
    {
      label: "Set to Deprecated",
      icon: <Block />,
      url: "/api/ExecCustomData?Action=ChangeSchemaState",
      type: "POST",
      data: {
        id: "id",
        status: "!Deprecated",
      },
      confirmText: "Set [id] to Deprecated. This is a permanent action and cannot be undone.",
      condition: (row) => row.status === "Available",
    },
    {
      label: "Delete Schema",
      icon: <TrashIcon />,
      url: "/api/ExecCustomData?Action=DeleteSchema",
      type: "POST",
      data: {
        id: "id",
      },
      confirmText: "Are you sure you want to delete [id]?",
      condition: (row) => row.status === "InDevelopment",
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
              href="https://learn.microsoft.com/en-us/graph/extensibility-overview?tabs=http#schema-extensions"
            >
              Schema extensions
            </Link>{" "}
            allow you to add custom properties to Microsoft Entra directory objects.
            <ul>
              <li>Schema extensions can only be Deprecated once they are set to Available.</li>
              <li>Properties cannot be deleted once they are created.</li>
              <li>
                There is a limit of 100 extension values per resource instance (directory objects
                only)
              </li>
              <li>There is a limit of 5 total schema extensions.</li>
            </ul>
          </Alert>
        }
        cardButton={
          <Button
            variant="contained"
            color="primary"
            size="small"
            component={NextLink}
            href="/cipp/custom-data/schema-extensions/add"
          >
            <SvgIcon fontSize="small" style={{ marginRight: 4 }}>
              <Add />
            </SvgIcon>
            Add Schema Extensions
          </Button>
        }
        tenantInTitle={false}
        apiUrl="/api/ExecCustomData?Action=ListSchemaExtensions"
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
