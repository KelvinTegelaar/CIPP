import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { Box, Container } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippInfoBar } from "../../../components/CippCards/CippInfoBar";
import { ApiPostCall, ApiGetCallWithPagination } from "../../../api/ApiCall";
import {
  Add,
  AdminPanelSettings,
  Group,
  HourglassBottom,
  Layers,
  SupervisorAccount,
} from "@mui/icons-material";
import CippPermissionCheck from "../../../components/CippSettings/CippPermissionCheck";
import { Alert, Button, Step, StepLabel, Stepper, SvgIcon, Typography } from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { useEffect, useState } from "react";
import CippButtonCard from "../../../components/CippCards/CippButtonCard";
import { WizardSteps } from "/src/components/CippWizard/wizard-steps";
import Link from "next/link";

const Page = () => {
  const [createDefaults, setCreateDefaults] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const relationships = ApiGetCallWithPagination({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: "tenantRelationships/delegatedAdminRelationships",
      tenantFilter: "",
      $top: 300,
    },
    queryKey: "ListGDAPRelationships",
  });

  const mappedRoles = ApiGetCallWithPagination({
    url: "/api/ListGDAPRoles",
    queryKey: "ListGDAPRoles",
  });

  const roleTemplates = ApiGetCallWithPagination({
    url: "/api/ExecGDAPRoleTemplate",
    queryKey: "ListGDAPRoleTemplates",
  });

  const pendingInvites = ApiGetCallWithPagination({
    url: "/api/ListGDAPInvite",
    queryKey: "ListGDAPInvite",
  });

  const createCippDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListGDAPRoleTemplates", "ListGDAPRoles"],
  });

  useEffect(() => {
    if (roleTemplates.isSuccess) {
      var promptCreateDefaults = true;
      // check templates for CIPP Defaults
      if (
        roleTemplates?.data?.pages?.[0].Results?.length > 0 &&
        roleTemplates?.data?.pages?.[0].Results?.find((t) => t.TemplateId === "CIPP Defaults")
      ) {
        promptCreateDefaults = false;
      }
      setCreateDefaults(promptCreateDefaults);
    }
  }, [roleTemplates]);

  useEffect(() => {
    if (mappedRoles.isSuccess && roleTemplates.isSuccess && pendingInvites.isSuccess) {
      if (mappedRoles?.data?.pages?.[0]?.length > 0) {
        setActiveStep(1);
        if (roleTemplates?.data?.pages?.[0]?.Results?.length > 0) {
          setActiveStep(2);
          if (pendingInvites?.data?.pages?.[0]?.length > 0) {
            setActiveStep(4);
          }
        }
      }
    }
  }, [
    relationships.isSuccess,
    mappedRoles.isSuccess,
    roleTemplates.isSuccess,
    roleTemplates.isFetching,
    pendingInvites.isSuccess,
  ]);

  return (
    <Container
      sx={{
        flexGrow: 1,
        py: 2,
      }}
      maxWidth={false}
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <CippInfoBar
            isFetching={
              relationships.isFetching ||
              mappedRoles.isFetching ||
              roleTemplates.isFetching ||
              pendingInvites.isFetching
            }
            data={[
              {
                icon: <SupervisorAccount />,
                data:
                  relationships.data?.pages
                    ?.map((page) => page?.Results?.length)
                    .reduce((a, b) => a + b, 0) ?? 0,
                name: "GDAP Relationships",
                color: "secondary",
              },
              {
                icon: <AdminPanelSettings />,
                data:
                  mappedRoles.data?.pages?.map((page) => page?.length).reduce((a, b) => a + b, 0) ??
                  0,
                name: "Mapped Admin Roles",
                color: "green",
              },
              {
                icon: <Layers />,
                data:
                  roleTemplates.data?.pages
                    ?.map((page) => page?.Results.length)
                    .reduce((a, b) => a + b, 0) ?? 0,
                name: "Role Templates",
              },
              {
                icon: <HourglassBottom />,
                data:
                  pendingInvites.data?.pages
                    ?.map((page) => page?.length)
                    .reduce((a, b) => a + b, 0) ?? 0,
                name: "Pending Invites",
              },
            ]}
          />
        </Grid>
        <Grid size={12}>
          <Button
            LinkComponent={Link}
            href="/tenant/gdap-management/invites/add"
            startIcon={<Add />}
            variant="contained"
          >
            Add a Tenant
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CippButtonCard
            title="GDAP Setup"
            cardSx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
          >
            <WizardSteps
              activeStep={activeStep}
              orientation="vertical"
              steps={[
                {
                  title: "Map your Admin Roles",
                  description:
                    "Use CIPP to map Admin Roles to Security Groups in your partner tenant.",
                },
                {
                  title: "Create Role Templates",
                  description: "Create Templates for your Role Mappings.",
                },
                {
                  title: "Create Invites",
                  description: "Create invites based on your Role Templates.",
                },
                {
                  title: "Setup Complete",
                  description: "You're ready to start adding your tenants using CIPP.",
                },
              ]}
            />
          </CippButtonCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CippPermissionCheck type="GDAP" />
        </Grid>
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
