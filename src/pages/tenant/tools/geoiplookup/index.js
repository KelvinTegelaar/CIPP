import { Box, Button, Container } from "@mui/material";
import { Grid, Stack } from "@mui/system";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippButtonCard from "../../../../components/CippCards/CippButtonCard";
import { Add, Delete, Search } from "@mui/icons-material";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { ApiPostCall } from "../../../../api/ApiCall";
import { getCippValidator } from "../../../../utils/get-cipp-validator";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useSettings } from "../../../../hooks/use-settings";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import CippGeoLocation from "../../../../components/CippComponents/CippGeoLocation";
import { useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";

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
      icon: <MapPinIcon />,
      hideBulk: true,
    },
    {
      label: "Add to Whitelist",
      url: `/api/ExecAddTrustedIP`,
      type: "POST",
      data: {
        IP: "RowKey",
        State: "!Trusted",
      },
      icon: <Add />,
      confirmText: "Are you sure you want to add this IP to the whitelist?",
      multiPost: false,
      condition: (row) => row.state !== "Trusted",
    },
    {
      label: "Remove from Whitelist",
      url: `/api/ExecAddTrustedIP`,
      type: "POST",
      data: {
        IP: "RowKey",
        State: "!NotTrusted",
      },
      icon: <Delete />,
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
      url: `/api/ExecAddTrustedIP`,
      data: {
        IP: ip,
        State: "Trusted",
        tenantFilter: currentTenant,
      }
    });
  };

  const handleRemoveFromWhitelist = () => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP`,
      data: {
        IP: ip,
        State: "NotTrusted",
        tenantFilter: currentTenant,
      }
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
        <Grid container spacing={1}>
          <Grid size={{ xs: 4 }}>
            <CippButtonCard
              title="Geo IP Check"
              cardSx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid size={8}>
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
                <Grid size={4}>
                  <Button
                    type="submit"
                    onClick={() => setIpAddress(ip)}
                    variant="contained"
                    startIcon={<Search />}
                  >
                    Check
                  </Button>
                </Grid>
              </Grid>
            </CippButtonCard>
          </Grid>
          <Grid size={8}></Grid>

          {/* Results Card */}
          {ipAddress && (
            <Grid size={6}>
              <CippButtonCard title="Geo IP Results">
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <CippGeoLocation ipAddress={ipAddress} />
                  </Grid>
                </Grid>
                <Grid container spacing={2} mt={2}>
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
          <Grid size={6}>
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
