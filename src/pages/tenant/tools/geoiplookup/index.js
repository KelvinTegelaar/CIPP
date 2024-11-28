import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Skeleton,
  Link,
} from "@mui/material";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import { Search } from "@mui/icons-material";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../../../api/ApiCall";
import { getCippValidator } from "../../../../utils/get-cipp-validator";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../../hooks/use-settings";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const actions = [];
  const formControl = useForm({ mode: "onBlur" });
  const ip = useWatch({ control: formControl.control, name: "ipAddress" });
  const getGeoIP = ApiGetCall({
    url: "/api/ExecGeoIPLookup",
    data: { ip },
    queryKey: `geoiplookup-${ip}`,
    waiting: false,
  });

  const addGeoIP = ApiPostCall({
    relatedQueryKeys: [`geoiplookup-${ip}`, "ListIPWhitelist"],
  });

  const handleAddToWhitelist = () => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP?IP=${ip}&TenantFilter=${currentTenant}&State=Trusted`,
    });
  };

  const handleRemoveFromWhitelist = () => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP?IP=${ip}&TenantFilter=${currentTenant}&State=NotTrusted`,
    });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        py: 4,
      }}
    >
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <CippButtonCard
              title="Geo IP Check"
              cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <CippFormComponent
                    formControl={formControl}
                    name="ipAddress"
                    type="textField"
                    validators={{
                      validate: (value) => getCippValidator(value, "ip"),
                    }}
                    placeholder="Enter IP Address"
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    type="submit"
                    onClick={() => getGeoIP.refetch()}
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
          {getGeoIP.isFetching ? (
            <Grid item xs={8}>
              <CippButtonCard title="Fetching Results">
                <Grid container spacing={2}>
                  <Grid item xs={12} textAlign="center">
                    <Skeleton width={"100%"} />
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          ) : getGeoIP.data ? (
            <Grid item xs={8}>
              <CippButtonCard title="Geo IP Results">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong>IP Address:</strong> {ip}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Country:</strong> {getGeoIP.data?.country}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Region:</strong> {getGeoIP.data?.region}
                    </Typography>
                    <Typography variant="body1">
                      <strong>City:</strong> {getGeoIP.data?.city}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">
                      <strong>ISP:</strong> {getGeoIP.data?.isp}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Latitude:</strong> {getGeoIP.data?.lat}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Longitude:</strong> {getGeoIP.data?.lon}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Organization:</strong> {getGeoIP.data?.org}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Map Location:</strong>{" "}
                      <Link
                        href={`https://www.google.com/maps/search/${getGeoIP.data?.lat}+${getGeoIP.data?.lon}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Map
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleAddToWhitelist}>
                      Add to Whitelist
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="outlined" color="error" onClick={handleRemoveFromWhitelist}>
                      Remove from Whitelist
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <CippApiResults apiObject={addGeoIP} />
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <CippDataTable
              title={"IP Whitelist"}
              api={{ url: "/api/ListIPWhitelist" }}
              queryKey={"ListIPWhitelist"}
              simple={false}
              simpleColumns={["PartitionKey", "state", "RowKey"]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
