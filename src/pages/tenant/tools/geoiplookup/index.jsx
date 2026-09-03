import { Box, Button, Container } from "@mui/material";
import { CippIcons } from "../../../../utils/icon-registry"
import { Grid, Stack } from "@mui/system";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiPostCall } from "../../../../api/ApiCall";
import { getCippValidator } from "../../../../utils/get-cipp-validator";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../../hooks/use-settings";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import CippGeoLocation from "../../../../components/CippComponents/CippGeoLocation";
import { useState } from "react";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const formControl = useForm({ mode: "onBlur" });
  const ip = useWatch({ control: formControl.control, name: "ipAddress" });
  const [ipAddress, setIpAddress] = useState(null);

  const actions = [
    {
      label: "View Location",
      customFunction: (row) => setIpAddress(row.RowKey),
      noConfirm: true,
      icon: <CippIcons.MapPinIcon />,
      hideBulk: true,
    },
    {
      label: "Add to Whitelist",
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      type: "POST",
      data: {
        IP: "RowKey",
        State: "!Trusted",
      },
      icon: <CippIcons.Add />,
      confirmText: "Are you sure you want to add this IP to the whitelist?",
      multiPost: false,
      condition: (row) => row.state !== "Trusted",
    },
    {
      label: "Remove from Whitelist",
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      type: "POST",
      data: {
        IP: "RowKey",
        State: "!NotTrusted",
      },
      icon: <CippIcons.Delete />,
      confirmText: "Are you sure you want to remove this IP from the whitelist?",
      multiPost: false,
      condition: (row) => row.state !== "NotTrusted",
    },
  ];

  const addGeoIP = ApiPostCall({
    relatedQueryKeys: [`geoiplookup-${ip}`, "ListIPWhitelist"],
  });

  const handleAddToWhitelist = () => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      data: {
        IP: ip,
        State: "Trusted",
      },
    });
  };

  const handleRemoveFromWhitelist = () => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      data: {
        IP: ip,
        State: "NotTrusted",
      },
    });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth={false}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CippButtonCard
              title="Geo IP Check"
              cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <CippFormComponent
                    formControl={formControl}
                    name="ipAddress"
                    type="textField"
                    validators={{
                      validate: (value) => getCippValidator(value, "ipAny"),
                    }}
                    placeholder="Enter IP Address (IPv4 or IPv6)"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    type="submit"
                    onClick={() => setIpAddress(ip)}
                    variant="contained"
                    startIcon={<CippIcons.MagnifyingGlassIcon />}
                  >
                    Check
                  </Button>
                </Grid>
              </Grid>
            </CippButtonCard>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}></Grid>

          {/* Results Card */}
          {ipAddress && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <CippButtonCard title="Geo IP Results">
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <CippGeoLocation ipAddress={ipAddress} />
                  </Grid>
                </Grid>
                <Grid container spacing={2} sx={{
                  mt: 2
                }}>
                  <Grid size={12}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="primary" onClick={handleAddToWhitelist}>
                        Add to Whitelist
                      </Button>

                      <Button variant="outlined" color="error" onClick={handleRemoveFromWhitelist}>
                        Remove from Whitelist
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CippDataTable
              title={"IP Whitelist"}
              api={{ url: "/api/ListIPWhitelist" }}
              queryKey={"ListIPWhitelist"}
              simpleColumns={["PartitionKey", "state", "RowKey"]}
              actions={actions}
            />
            <CippApiResults apiObject={addGeoIP} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
