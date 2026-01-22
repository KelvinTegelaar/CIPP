import { Box, Button, Container, Typography, Skeleton, Link } from "@mui/material";
import { Grid } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import { Search } from "@mui/icons-material";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../../api/ApiCall";

const Page = () => {
  const formControl = useForm({ mode: "onBlur" });
  const domain = useWatch({ control: formControl.control, name: "domain" });
  const getTenant = ApiGetCall({
    url: "/api/ListExternalTenantInfo",
    data: { tenant: domain },
    queryKey: `tenant-${domain}`,
    waiting: false,
  });

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 4 }}>
            <CippButtonCard
              title="Tenant lookup"
              cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 8 }}>
                  <CippFormComponent
                    formControl={formControl}
                    name="domain"
                    type="textField"
                    placeholder="Domain name"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Button
                    type="submit"
                    onClick={() => getTenant.refetch()}
                    variant="contained"
                    startIcon={<Search />}
                  >
                    Check
                  </Button>
                </Grid>
              </Grid>
            </CippButtonCard>
          </Grid>

          {/* Results Card */}
          {getTenant.isFetching ? (
            <Grid size={{ xs: 8 }}>
              <CippButtonCard title="Fetching Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }} textAlign="center">
                    <Skeleton width={"100%"} />
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          ) : getTenant.data ? (
            <Grid size={{ xs: 8 }}>
              <CippButtonCard title="Tenant Lookup Results">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body1">
                      <strong>Tenant Name:</strong> {domain}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tenant Id:</strong> {getTenant.data?.GraphRequest?.tenantId}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Default Domain Name:</strong>{" "}
                      {getTenant.data?.GraphRequest?.defaultDomainName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tenant Brand Name :</strong>{" "}
                      {getTenant.data?.GraphRequest?.federationBrandName
                        ? getTenant.data?.GraphRequest?.federationBrandName
                        : "Not Specified"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tenant Region:</strong>{" "}
                      {getTenant.data?.OpenIdConfig?.tenant_region_scope}
                    </Typography>
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          ) : null}
        </Grid>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
