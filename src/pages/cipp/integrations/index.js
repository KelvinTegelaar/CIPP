import { Layout as DashboardLayout } from "/src/layouts/index.js";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import extensions from "/src/data/Extensions";
import { Sync } from "@mui/icons-material";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import Link from "next/link";

const Page = () => {
  const settings = useSettings();
  const preferredTheme = settings.currentTheme?.value;

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });

  return (
    <Container maxWidth={"xl"}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={4}
        sx={{ mb: 3, mt: 3 }}
      >
        <Typography variant="h4">Integrations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Sync />}
          LinkComponent={Link}
          href="/cipp/integrations/sync"
        >
          Sync Jobs
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {extensions.map((extension) => {
          var logo = extension.logo;
          if (preferredTheme === "dark" && extension?.logoDark) {
            logo = extension.logoDark;
          }

          var integrationConfig = integrations?.data?.[extension.id];
          var isEnabled = integrationConfig?.Enabled || extension.id === "cippapi";
          var status = "Unconfigured";
          if (integrationConfig && !isEnabled) {
            status = "Disabled";
          } else if ((integrationConfig && isEnabled) || extension.id === "cippapi") {
            status = "Enabled";
          }

          return (
            <Grid item sm={12} md={6} xl={3} key={extension.id}>
              <CardActionArea
                component={Link}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                href={`/cipp/integrations/configure?id=${extension.id}`}
              >
                <Card
                  align="center"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    {extension?.logo && (
                      <Box
                        component="img"
                        layout="responsive"
                        objectFit="contain"
                        gutterBottom
                        src={logo}
                        alt={extension.name}
                        width="90%"
                        height={"auto"}
                        marginBottom={1}
                        flex={1}
                      />
                    )}
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {extension.description}
                    </Typography>
                  </CardContent>
                  <div style={{ flexGrow: 1 }} />
                  <CardActions>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {integrations.isSuccess ? (
                        <Box
                          sx={{
                            backgroundColor: isEnabled ? "success.main" : "warning.main",
                            borderRadius: "50%",
                            width: 8,
                            height: 8,
                          }}
                        />
                      ) : (
                        <Skeleton variant="circular" width={8} height={8} animation="pulse" />
                      )}

                      <Typography variant="body2">
                        {integrations.isSuccess ? status : "Loading"}
                      </Typography>
                    </Stack>
                  </CardActions>
                </Card>
              </CardActionArea>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
