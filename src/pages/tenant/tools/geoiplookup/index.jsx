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

  // Entries are single addresses or CIDR ranges; a tenant entry overrides an AllTenants one for the
  // same range and the most specific range decides an address. Blocked entries mark known attacker
  // addresses (the BEC investigation treats them as confirmed compromised).
  const actions = [
    {
      label: "View Location",
      customFunction: (row) => setIpAddress(String(row.Range || row.RowKey).split("/")[0]),
      noConfirm: true,
      icon: <CippIcons.MapPinIcon />,
      hideBulk: true,
    },
    {
      label: "Trust",
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      type: "POST",
      data: {
        IP: "Range",
        State: "!Trusted",
      },
      icon: <CippIcons.Add />,
      confirmText: "Mark [Range] as trusted?",
      multiPost: false,
      condition: (row) => row.state !== "Trusted",
    },
    {
      label: "Block",
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      type: "POST",
      data: {
        IP: "Range",
        State: "!Blocked",
      },
      icon: <CippIcons.Block />,
      confirmText: "Mark [Range] as blocked (a known attacker address)?",
      multiPost: false,
      condition: (row) => row.state !== "Blocked",
    },
    {
      label: "Remove from list",
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      type: "POST",
      data: {
        IP: "Range",
        State: "!NotTrusted",
      },
      icon: <CippIcons.Delete />,
      confirmText: "Make [Range] neutral again (neither trusted nor blocked)?",
      multiPost: false,
      condition: (row) => row.state !== "NotTrusted",
    },
  ];

  const addGeoIP = ApiPostCall({
    relatedQueryKeys: [`geoiplookup-${ip}`, "ListIPWhitelist"],
  });

  const setListState = (value, State) => {
    addGeoIP.mutate({
      url: `/api/ExecAddTrustedIP${`?tenantFilter=${currentTenant}`}`,
      data: {
        IP: value,
        State,
      },
    });
  };
  const handleAddToWhitelist = () => setListState(ip, "Trusted");
  const handleBlock = () => setListState(ip, "Blocked");
  const handleRemoveFromWhitelist = () => setListState(ip, "NotTrusted");

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
                      validate: (value) =>
                        String(value || "").includes("/")
                          ? getCippValidator(value, "ipv4cidr") === true ||
                            getCippValidator(value, "ipv6cidr")
                          : getCippValidator(value, "ipAny"),
                    }}
                    placeholder="IP address or CIDR range (IPv4 or IPv6)"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    type="submit"
                    onClick={() => setIpAddress(String(ip || "").split("/")[0])}
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
                        Trust
                      </Button>
                      <Button variant="contained" color="error" onClick={handleBlock}>
                        Block
                      </Button>
                      <Button variant="outlined" onClick={handleRemoveFromWhitelist}>
                        Remove from list
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CippButtonCard>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <CippDataTable
              title={"IP Allow/Block List"}
              api={{ url: "/api/ListIPWhitelist" }}
              queryKey={"ListIPWhitelist"}
              simpleColumns={["PartitionKey", "state", "Range", "Note"]}
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
