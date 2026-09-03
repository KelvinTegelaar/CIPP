import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import tabOptions from "../tabOptions";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Alert, Button, Card, CardContent, SvgIcon, Typography } from "@mui/material";
import Link from "next/link";
import { ApiGetCallWithPagination, ApiPostCall } from "../../../../api/ApiCall";
import { useCallback, useEffect, useState } from "react";
import { Box, Container, Stack } from "@mui/system";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { AccountTree, AddBox, ContentCopy, Edit, Mail } from "@mui/icons-material";

const pageTitle = "GDAP Role Templates";
const apiUrl = "/api/ExecGDAPRoleTemplate";

const actions = [
  {
    label: "Edit Template",
    link: "/tenant/gdap-management/role-templates/edit?templateId=[TemplateId]",
    pinned: true,
    icon: <Edit />,
  },
  {
    label: "Clone Template",
    url: "/api/ExecGDAPRoleTemplate?Action=Add",
    type: "POST",
    icon: <ContentCopy />,
    data: { RoleMappings: "RoleMappings" },
    confirmText: "Enter a name for the copy of [TemplateId].",
    fields: [
      {
        type: "textField",
        name: "TemplateId",
        label: "New template name",
        required: true,
        validators: {
          validate: (value) => (value?.trim() ? true : "Enter a name for the new template"),
        },
      },
    ],
    relatedQueryKeys: ["ListGDAPRoleTemplates"],
  },
  {
    label: "Create Invite",
    link: "/tenant/gdap-management/invites/add?templateId=[TemplateId]",
    icon: <Mail />,
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

const simpleColumns = ["TemplateId", "Roles", "GroupMappings"];

const Page = () => {
  const [createDefaults, setCreateDefaults] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(null);

  const currentTemplates = ApiGetCallWithPagination({
    url: apiUrl,
    queryKey: "ListGDAPRoleTemplates",
  });

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListGDAPRoleTemplates", "ListGDAPRoles"],
  });

  useEffect(() => {
    if (currentTemplates.isSuccess) {
      const results = currentTemplates?.data?.pages?.[0]?.Results ?? [];
      setHasTemplates(results.length > 0);
      setCreateDefaults(!results.find((t) => t.TemplateId === "CIPP Defaults"));
    }
  }, [currentTemplates]);

  // The template rows carry their mappings as objects; the table shows the role names as chips
  // and the mapping count. Memoized - CippDataTable re-runs the map whenever this identity changes.
  const dataMap = useCallback(
    (row) => ({
      ...row,
      Roles: (row?.RoleMappings ?? []).map((mapping) => mapping?.RoleName).filter(Boolean),
      GroupMappings: (row?.RoleMappings ?? []).length,
    }),
    []
  );

  if (hasTemplates === false) {
    return (
      <Container maxWidth={false} sx={{ py: 2 }}>
        <CippHead title={pageTitle} />
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">No role templates yet</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  A role template is the set of admin roles a GDAP invite grants. Start from the
                  CIPP defaults, or pick your own roles.
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  useFlexGap
                  sx={{ flexWrap: "wrap", alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    onClick={() =>
                      createCippDefaults.mutate({
                        url: "/api/ExecAddGDAPRole",
                        data: { TemplateId: "CIPP Defaults" },
                      })
                    }
                    startIcon={
                      <SvgIcon fontSize="small">
                        <PlusIcon />
                      </SvgIcon>
                    }
                  >
                    Create CIPP Defaults template
                  </Button>
                  <Button
                    component={Link}
                    variant="outlined"
                    href="/tenant/gdap-management/role-templates/add"
                    startIcon={<AddBox />}
                  >
                    Build a custom template
                  </Button>
                </Stack>
                <CippApiResults apiObject={createCippDefaults} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    );
  }

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
        dataMap={dataMap}
        actions={actions}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
        sx={{ flexGrow: 1, pb: 4 }}
        cardButton={
          <>
            <Button
              component={Link}
              href="/tenant/gdap-management/role-templates/mappings"
              startIcon={<AccountTree />}
            >
              Group Mappings
            </Button>
            <Button
              component={Link}
              href="/tenant/gdap-management/role-templates/add"
              startIcon={<AddBox />}
            >
              Add Template
            </Button>
          </>
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
