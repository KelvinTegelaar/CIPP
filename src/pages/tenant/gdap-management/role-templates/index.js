import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Alert, Button, SvgIcon } from "@mui/material";
import Link from "next/link";
import { ApiGetCallWithPagination, ApiPostCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/system";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { Edit, AddBox } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "GDAP Role Templates";
  const [createDefaults, setCreateDefaults] = useState(false);
  const actions = [
    {
      label: "Edit Template",
      link: "/tenant/gdap-management/role-templates/edit?templateId=[TemplateId]",
      icon: <Edit />,
    },
    {
      label: "Delete Template",
      url: "/api/ExecGDAPRoleTemplate?Action=Delete",
      type: "POST",
      icon: <TrashIcon />,
      data: { TemplateId: "TemplateId" },
      confirmText: "Are you sure you want to delete this Role Template?",
    },
  ];

  const simpleColumns = ["TemplateId", "RoleMappings"];
  const apiUrl = "/api/ExecGDAPRoleTemplate";

  const currentTemplates = ApiGetCallWithPagination({
    url: apiUrl,
    queryKey: "ListGDAPRoleTemplates",
  });

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: "ListGDAPRoleTemplates",
  });

  useEffect(() => {
    if (currentTemplates.isSuccess) {
      var promptCreateDefaults = true;
      // check templates for CIPP Defaults
      if (
        currentTemplates?.data?.pages?.[0].Results?.length > 0 &&
        currentTemplates?.data?.pages?.[0].Results?.find((t) => t.TemplateId === "CIPP Defaults")
      ) {
        promptCreateDefaults = false;
      }
      setCreateDefaults(promptCreateDefaults);
    }
  }, [currentTemplates]);
  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      {createDefaults && (
        <>
          <Box>
            <Alert severity="warning" sx={{ mx: 3 }}>
              The CIPP Defaults template is missing from the GDAP Role Templates. Create it now?
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  createCippDefaults.mutate({
                    url: "/api/ExecAddGDAPRole",
                    data: { TemplateId: "CIPP Defaults" },
                  })
                }
                sx={{ ml: 2 }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <PlusIcon />
                  </SvgIcon>
                }
              >
                Create CIPP Defaults
              </Button>
            </Alert>
          </Box>
          <Box sx={{ px: 3 }}>
            <CippApiResults apiObject={createCippDefaults} />
          </Box>
        </>
      )}
      <CippTablePage
        title={pageTitle}
        apiUrl={apiUrl}
        apiDataKey="Results"
        actions={actions}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
        sx={{ flexGrow: 1, pb: 4 }}
        cardButton={
          <Button
            component={Link}
            href="/tenant/gdap-management/role-templates/add"
            startIcon={<AddBox />}
          >
            Add Template
          </Button>
        }
        queryKey="ListGDAPRoleTemplates"
        maxHeightOffset="460px"
      />
    </Stack>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
